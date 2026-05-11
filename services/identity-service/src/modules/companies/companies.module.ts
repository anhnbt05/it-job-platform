import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import {
  CompanySnapshotCommandRegistry,
  CreateBranchSnapshotCommand,
  CreateCompanySnapshotCommand,
  UpdateBranchSnapshotCommand,
  UpdateCompanySnapshotCommand,
} from './commands';
import { CompaniesEventsConsumer } from './consumers';

@Module({
  controllers: [CompaniesEventsConsumer],
  providers: [
    CompaniesService,
    CompanySnapshotCommandRegistry,
    CreateCompanySnapshotCommand,
    UpdateCompanySnapshotCommand,
    CreateBranchSnapshotCommand,
    UpdateBranchSnapshotCommand,
  ],
})
export class CompaniesModule {}
