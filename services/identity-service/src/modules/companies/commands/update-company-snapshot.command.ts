import { UpdateCompanyDto } from '@/modules/companies/dto';
import { CompaniesService } from '@/modules/companies/companies.service';
import { Injectable } from '@nestjs/common';
import {
  CompanySnapshotCommand,
  CompanySnapshotEvent,
} from './company-snapshot-command.interface';

@Injectable()
export class UpdateCompanySnapshotCommand
  implements CompanySnapshotCommand<UpdateCompanyDto>
{
  readonly event = CompanySnapshotEvent.COMPANY_UPDATED;

  constructor(private readonly companiesService: CompaniesService) {}

  async execute(payload: UpdateCompanyDto): Promise<void> {
    await this.companiesService.updateCompanySnapshot(payload);
  }
}
