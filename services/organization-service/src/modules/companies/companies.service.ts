import { CreateCompanyDto } from '@/modules/companies/dto';
import { Companies } from '@/modules/companies/entities';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Companies)
    private readonly companyRepo: Repository<Companies>,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

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

    this.kafkaClient.emit('company-snapshot.created', {
      id: existingCompanyWithName.id,
      name: existingCompanyWithName.name,
      location: existingCompanyWithName.location,
      updated_at: new Date(existingCompanyWithName.updatedAt),
      logo_url: existingCompanyWithName.logo_url,
    });

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
