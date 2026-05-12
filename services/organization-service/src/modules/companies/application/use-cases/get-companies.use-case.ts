import { COMPANY_REPOSITORY } from '@/modules/companies/domain/company.repository';
import { Inject, Injectable } from '@nestjs/common';
import type { CompanyRepository } from '@/modules/companies/domain/company.repository';

@Injectable()
export class GetCompaniesUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  execute() {
    return this.companyRepository.findAll();
  }
}
