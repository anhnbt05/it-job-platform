import {
  CompanyRepository,
  FindCompanyByNameAndWebsiteCriteria,
} from '@/modules/companies/domain/company.repository';
import { Company } from '@/modules/companies/domain/company';
import { Companies } from '@/modules/companies/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CompanyMapper } from './company.mapper';

@Injectable()
export class CompanyTypeOrmRepository implements CompanyRepository {
  constructor(
    @InjectRepository(Companies)
    private readonly companyRepository: Repository<Companies>,
  ) {}

  async findAll() {
    const companies = await this.companyRepository.find();
    return companies.map((company) => CompanyMapper.toDomain(company));
  }

  async findById(id: string) {
    const company = await this.companyRepository.findOne({
      where: { id },
    });

    return company ? CompanyMapper.toDomain(company) : null;
  }

  async findByName(name: string) {
    const company = await this.companyRepository.findOne({
      where: { name },
    });

    return company ? CompanyMapper.toDomain(company) : null;
  }

  async findByNameAndWebsite(criteria: FindCompanyByNameAndWebsiteCriteria) {
    const company = await this.companyRepository.findOne({
      where: {
        name: criteria.name,
        website: criteria.website,
      },
    });

    return company ? CompanyMapper.toDomain(company) : null;
  }

  async save(company: Company) {
    const companyEntity = CompanyMapper.toPersistence(company);
    const savedCompany = await this.companyRepository.save(companyEntity);

    return CompanyMapper.toDomain(savedCompany);
  }
}
