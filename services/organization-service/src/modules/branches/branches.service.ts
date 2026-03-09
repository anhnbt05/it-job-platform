import { CreateBranchDto, UpdateBranchDto } from '@/modules/branches/dto';
import { Branches } from '@/modules/branches/entities';
import { Companies } from '@/modules/companies/entities';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branches)
    private readonly brancheRepo: Repository<Branches>,
    @InjectRepository(Companies)
    private readonly companyRepo: Repository<Companies>,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async updateBranch(id: string, dto: UpdateBranchDto) {
    const branch = await this.brancheRepo.findOne({
      where: {
        id,
      },
      relations: {
        company: true,
      },
    });

    if (!branch) {
      throw new NotFoundException('Không tìm thấy thông tin chi nhánh.');
    }

    Object.assign(branch, dto);

    const savedBranch = await this.brancheRepo.save(branch);

    this.kafkaClient.emit('branch-snapshot.updated', {
      id,
      company_id: branch.company.id,
      name: savedBranch.name,
      updated_at: new Date(savedBranch.updatedAt),
      city: savedBranch.city,
      address: savedBranch.address,
      country: savedBranch.country,
    });

    return {
      success: true,
      message: 'Cập nhật thông tin chi nhánh thành công',
    };
  }

  async findBranchById(dto: { id: string }) {
    return (
      (await this.brancheRepo.findOne({
        where: {
          id: dto.id,
        },
      })) ?? null
    );
  }

  async createBranch(dto: CreateBranchDto) {
    const { company_id } = dto;

    const company = await this.companyRepo.findOne({
      where: {
        id: company_id,
      },
    });

    if (!company) {
      throw new NotFoundException('Không tìm thấy thông tin công ty.');
    }

    const newBranch = await this.brancheRepo.save(
      this.brancheRepo.create({
        name: dto.name,
        country: dto.country,
        city: dto.country,
        company,
        address: dto.address,
      }),
    );

    this.kafkaClient.emit('branch-snapshot.created', {
      id: newBranch.id,
      company_id,
      name: newBranch.name,
      updated_at: new Date(newBranch.updatedAt),
      city: newBranch.city,
      address: newBranch.address,
      country: newBranch.country,
    });

    return newBranch;
  }
}
