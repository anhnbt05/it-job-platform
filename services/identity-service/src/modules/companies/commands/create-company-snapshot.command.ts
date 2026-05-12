import { CreateCompanyDto } from '@/modules/companies/dto';
import { CompaniesService } from '@/modules/companies/companies.service';
import { Injectable } from '@nestjs/common';
import {
  CompanySnapshotCommand,
  CompanySnapshotEvent,
} from './company-snapshot-command.interface';

@Injectable()
export class CreateCompanySnapshotCommand implements CompanySnapshotCommand<CreateCompanyDto> {
  readonly event = CompanySnapshotEvent.COMPANY_CREATED;

  constructor(private readonly companiesService: CompaniesService) {}

  async execute(payload: CreateCompanyDto): Promise<void> {
    await this.companiesService.createCompanySnapshot(payload);
  }
}
