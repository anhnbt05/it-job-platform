import {
  COMPANY_REPOSITORY,
  FindCompanyByNameAndWebsiteCriteria,
} from '@/modules/companies/domain/company.repository';
import { Inject, Injectable } from '@nestjs/common';
import type { CompanyRepository } from '@/modules/companies/domain/company.repository';

@Injectable()
export class FindCompanyByNameAndWebsiteUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  execute(criteria: FindCompanyByNameAndWebsiteCriteria) {
    return this.companyRepository.findByNameAndWebsite(criteria);
  }
}
