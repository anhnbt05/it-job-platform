import { Injectable } from '@nestjs/common';
import {
  CreateCompanyUseCase,
  FindCompanyByNameAndWebsiteUseCase,
  GetCompaniesUseCase,
  GetCompanyUseCase,
  UpdateCompanyUseCase,
} from './application/use-cases';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly findCompanyByNameAndWebsiteUseCase: FindCompanyByNameAndWebsiteUseCase,
    private readonly getCompaniesUseCase: GetCompaniesUseCase,
    private readonly getCompanyUseCase: GetCompanyUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
  ) {}

  async updateCompany(id: string, dto: UpdateCompanyDto) {
    return this.updateCompanyUseCase.execute(id, dto);
  }

  async getCompany(id: string) {
    const company = await this.getCompanyUseCase.execute(id);
    return company.toPrimitives();
  }

  async createCompany(dto: CreateCompanyDto) {
    const company = await this.createCompanyUseCase.execute(dto);
    return company.toPrimitives();
  }

  async findCompanyByNameAndWebsite(dto: { name: string; website: string }) {
    const company = await this.findCompanyByNameAndWebsiteUseCase.execute(dto);
    return company?.toPrimitives() ?? null;
  }

  async getCompanies() {
    const companies = await this.getCompaniesUseCase.execute();
    return companies.map((company) => company.toPrimitives());
  }
}
