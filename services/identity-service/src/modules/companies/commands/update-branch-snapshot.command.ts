import { UpdateBranchDto } from '@/modules/companies/dto';
import { CompaniesService } from '@/modules/companies/companies.service';
import { Injectable } from '@nestjs/common';
import {
  CompanySnapshotCommand,
  CompanySnapshotEvent,
} from './company-snapshot-command.interface';

@Injectable()
export class UpdateBranchSnapshotCommand implements CompanySnapshotCommand<UpdateBranchDto> {
  readonly event = CompanySnapshotEvent.BRANCH_UPDATED;

  constructor(private readonly companiesService: CompaniesService) {}

  async execute(payload: UpdateBranchDto): Promise<void> {
    await this.companiesService.updateBranchSnapshot(payload);
  }
}
