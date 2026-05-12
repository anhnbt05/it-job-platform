import { CompaniesController } from './companies.controller';
import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Companies } from '@/modules/companies/entities';
import { COMPANY_REPOSITORY } from './domain';
import {
  CreateCompanyUseCase,
  FindCompanyByNameAndWebsiteUseCase,
  GetCompaniesUseCase,
  GetCompanyUseCase,
  UpdateCompanyUseCase,
} from './application/use-cases';
import {
  COMPANY_MUTATION_TRACKER,
  COMPANY_SNAPSHOT_PUBLISHER,
} from './application/ports';
import { PrometheusCompanyMutationTracker } from './infrastructure/metrics';
import { CompanyTypeOrmRepository } from './infrastructure/persistence';
import { KafkaCompanySnapshotPublisher } from './infrastructure/publishers';

@Module({
  imports: [TypeOrmModule.forFeature([Companies])],
  controllers: [CompaniesController],
  providers: [
    CompaniesService,
    CreateCompanyUseCase,
    FindCompanyByNameAndWebsiteUseCase,
    GetCompaniesUseCase,
    GetCompanyUseCase,
    UpdateCompanyUseCase,
    CompanyTypeOrmRepository,
    KafkaCompanySnapshotPublisher,
    PrometheusCompanyMutationTracker,
    {
      provide: COMPANY_REPOSITORY,
      useExisting: CompanyTypeOrmRepository,
    },
    {
      provide: COMPANY_SNAPSHOT_PUBLISHER,
      useExisting: KafkaCompanySnapshotPublisher,
    },
    {
      provide: COMPANY_MUTATION_TRACKER,
      useExisting: PrometheusCompanyMutationTracker,
    },
  ],
  exports: [CompaniesService, COMPANY_REPOSITORY],
})
export class CompaniesModule {}
