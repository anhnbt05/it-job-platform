import { MessagePattern, Payload } from '@nestjs/microservices';
import { CompaniesService } from './companies.service';
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { CreateCompanyDto } from '@/modules/companies/dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async getCompanies() {
    return this.companiesService.getCompanies();
  }

  @Get(':id')
  async getCompany(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.getCompany(id);
  }

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
