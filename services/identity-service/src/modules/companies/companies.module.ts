import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import {
  BranchCreatedConsummer,
  BranchUpdatedConsummer,
  CompanyCreatedConsummer,
  CompanyUpdatedConsummer,
} from './consumers';

@Module({
  controllers: [
    CompanyCreatedConsummer,
    BranchCreatedConsummer,
    CompanyUpdatedConsummer,
    BranchUpdatedConsummer,
  ],
  providers: [CompaniesService],
})
export class CompaniesModule {}
