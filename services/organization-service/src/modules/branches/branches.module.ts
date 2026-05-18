import { Branches } from '@/modules/branches/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { CompaniesModule } from '@/modules/companies/companies.module';
import { MetricsModule } from '@/modules/observability/metrics.module';
import { BRANCH_REPOSITORY } from './domain';
import {
  BRANCH_MUTATION_TRACKER,
  BRANCH_SNAPSHOT_PUBLISHER,
} from './application/ports';
import {
  CreateBranchUseCase,
  FindBranchByIdUseCase,
  GetBranchUseCase,
  GetBranchesUseCase,
  UpdateBranchUseCase,
} from './application/use-cases';
import { PrometheusBranchMutationTracker } from './infrastructure/metrics';
import { BranchTypeOrmRepository } from './infrastructure/persistence';
import { KafkaBranchSnapshotPublisher } from './infrastructure/publishers';

@Module({
  imports: [TypeOrmModule.forFeature([Branches]), CompaniesModule, MetricsModule],
  controllers: [BranchesController],
  providers: [
    BranchesService,
    CreateBranchUseCase,
    FindBranchByIdUseCase,
    GetBranchUseCase,
    GetBranchesUseCase,
    UpdateBranchUseCase,
    BranchTypeOrmRepository,
    KafkaBranchSnapshotPublisher,
    PrometheusBranchMutationTracker,
    {
      provide: BRANCH_REPOSITORY,
      useExisting: BranchTypeOrmRepository,
    },
    {
      provide: BRANCH_SNAPSHOT_PUBLISHER,
      useExisting: KafkaBranchSnapshotPublisher,
    },
    {
      provide: BRANCH_MUTATION_TRACKER,
      useExisting: PrometheusBranchMutationTracker,
    },
  ],
  exports: [BranchesService],
})
export class BranchesModule {}
