import { CreateBranchDto } from '@/modules/companies/dto';
import { CompaniesService } from '@/modules/companies/companies.service';
import { Injectable } from '@nestjs/common';
import {
  CompanySnapshotCommand,
  CompanySnapshotEvent,
} from './company-snapshot-command.interface';

@Injectable()
export class CreateBranchSnapshotCommand
  implements CompanySnapshotCommand<CreateBranchDto>
{
  readonly event = CompanySnapshotEvent.BRANCH_CREATED;

  constructor(private readonly companiesService: CompaniesService) {}

  async execute(payload: CreateBranchDto): Promise<void> {
    await this.companiesService.createBranchSnapshot(payload);
  }
}
