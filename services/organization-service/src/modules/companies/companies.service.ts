import { CreateCompanyDto, UpdateCompanyDto } from '@/modules/companies/dto';
import { Companies } from '@/modules/companies/entities';
import { SnapshotEventPublisher } from '@/modules/kafka/snapshot-events';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Companies)
    private readonly companyRepo: Repository<Companies>,
    private readonly snapshotEventPublisher: SnapshotEventPublisher,
  ) {}

  async updateCompany(id: string, dto: UpdateCompanyDto) {
    const company = await this.getCompany(id);

    Object.assign(company, dto);

    const savedCompany = await this.companyRepo.save(company);

    this.snapshotEventPublisher.publishCompanyUpdated(savedCompany);

    return {
      success: true,
      message: 'Đã cập nhật thành công thông tin công ty.',
    };
  }

  async getCompany(id: string) {
    const company = await this.companyRepo.findOne({
      where: {
        id,
      },
    });

    if (!company) {
      throw new NotFoundException('Không tìm thấy thông tin công ty.');
    }

    return company;
  }

  async createCompany(dto: CreateCompanyDto) {
    const { name } = dto;

    let existingCompanyWithName = await this.companyRepo.findOne({
      where: {
        name,
      },
    });

    if (!existingCompanyWithName) {
      existingCompanyWithName = await this.companyRepo.save(
        this.companyRepo.create(dto),
      );
    }

    this.snapshotEventPublisher.publishCompanyCreated(existingCompanyWithName);

    return existingCompanyWithName;
  }

  async findCompanyByNameAndWebsite(dto: { name: string; website: string }) {
    return this.companyRepo.findOne({
      where: {
        name: dto.name,
        website: dto.website,
      },
    });
  }

  async getCompanies() {
    return this.companyRepo.find();
  }
}
