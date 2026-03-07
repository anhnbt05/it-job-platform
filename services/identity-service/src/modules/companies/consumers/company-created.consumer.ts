import { CreateCompanyDto } from '@/modules/companies/dto';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CompaniesService } from '../companies.service';

@Controller()
export class CompanyCreatedConsummer {
  constructor(private readonly companiesService: CompaniesService) {}

  @EventPattern('company-snapshot.created')
  async createCompanySnapshot(@Payload() dto: CreateCompanyDto) {
    return this.companiesService.createCompanySnapshot(dto);
  }
}
