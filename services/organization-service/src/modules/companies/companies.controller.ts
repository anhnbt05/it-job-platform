import { Roles } from '@/common/decorators';
import { RoleEnum } from '@/common/enums';
import { CreateCompanyDto, UpdateCompanyDto } from '@/modules/companies/dto';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CompaniesService } from './companies.service';

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

  @Patch(':id')
  @Roles(RoleEnum.RECRUITER)
  async updateCompany(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companiesService.updateCompany(id, updateCompanyDto);
  }
}
