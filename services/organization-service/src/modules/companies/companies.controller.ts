import { MessagePattern, Payload } from '@nestjs/microservices';
import { CompaniesService } from './companies.service';
import { Controller } from '@nestjs/common';
import { CreateCompanyDto } from '@/modules/companies/dto';

@Controller()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @MessagePattern('company.created')
  async createCompany(@Payload() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.createCompany(createCompanyDto);
  }

  @MessagePattern('company.find-by-name-and-website')
  async findCompanyByNameAndWebsite(
    @Payload() dto: { name: string; website: string },
  ) {
    return this.companiesService.findCompanyByNameAndWebsite(dto);
  }
}
