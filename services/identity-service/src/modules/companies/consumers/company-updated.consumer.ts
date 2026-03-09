import { UpdateCompanyDto } from '@/modules/companies/dto';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CompaniesService } from '../companies.service';

@Controller()
export class CompanyUpdatedConsummer {
  constructor(private readonly companiesService: CompaniesService) {}

  @EventPattern('company-snapshot.updated')
  async updateCompanySnapshot(@Payload() dto: UpdateCompanyDto) {
    return this.companiesService.updateCompanySnapshot(dto);
  }
}
