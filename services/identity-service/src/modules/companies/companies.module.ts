import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { BranchCreatedConsummer, CompanyCreatedConsummer } from './consumers';

@Module({
  controllers: [CompanyCreatedConsummer, BranchCreatedConsummer],
  providers: [CompaniesService],
})
export class CompaniesModule {}
