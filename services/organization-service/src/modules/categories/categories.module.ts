import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categories } from '@/modules/categories/entities';
import { MetricsModule } from '@/modules/observability/metrics.module';
import { CATEGORY_REPOSITORY } from './domain';
import {
  CATEGORY_MUTATION_TRACKER,
  CATEGORY_SNAPSHOT_PUBLISHER,
} from './application/ports';
import {
  CreateCategoryUseCase,
  GetCategoriesUseCase,
  GetCategoryUseCase,
  RemoveCategoryUseCase,
  UpdateCategoryUseCase,
} from './application/use-cases';
import { PrometheusCategoryMutationTracker } from './infrastructure/metrics';
import { CategoryTypeOrmRepository } from './infrastructure/persistence';
import { KafkaCategorySnapshotPublisher } from './infrastructure/publishers';

@Module({
  imports: [TypeOrmModule.forFeature([Categories]), MetricsModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    CreateCategoryUseCase,
    GetCategoriesUseCase,
    GetCategoryUseCase,
    UpdateCategoryUseCase,
    RemoveCategoryUseCase,
    CategoryTypeOrmRepository,
    KafkaCategorySnapshotPublisher,
    PrometheusCategoryMutationTracker,
    {
      provide: CATEGORY_REPOSITORY,
      useExisting: CategoryTypeOrmRepository,
    },
    {
      provide: CATEGORY_SNAPSHOT_PUBLISHER,
      useExisting: KafkaCategorySnapshotPublisher,
    },
    {
      provide: CATEGORY_MUTATION_TRACKER,
      useExisting: PrometheusCategoryMutationTracker,
    },
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
