import { COMPANY_REPOSITORY } from '@/modules/companies/domain/company.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CompanyRepository } from '@/modules/companies/domain/company.repository';

@Injectable()
export class GetCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(id: string) {
    const company = await this.companyRepository.findById(id);

    if (!company) {
      throw new NotFoundException('Không tìm thấy thông tin công ty.');
    }

    return company;
  }
}
