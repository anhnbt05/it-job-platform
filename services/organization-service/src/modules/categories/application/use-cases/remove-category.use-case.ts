import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '@/modules/categories/domain/category.repository';
import { CATEGORY_MUTATION_TRACKER } from '../ports/category-mutation-tracker.port';
import { CATEGORY_SNAPSHOT_PUBLISHER } from '../ports/category-snapshot.publisher.port';
import type { CategoryRepository } from '@/modules/categories/domain/category.repository';
import type { CategoryMutationTracker } from '../ports/category-mutation-tracker.port';
import type { CategorySnapshotPublisher } from '../ports/category-snapshot.publisher.port';

@Injectable()
export class RemoveCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    @Inject(CATEGORY_SNAPSHOT_PUBLISHER)
    private readonly categorySnapshotPublisher: CategorySnapshotPublisher,
    @Inject(CATEGORY_MUTATION_TRACKER)
    private readonly categoryMutationTracker: CategoryMutationTracker,
  ) {}

  async execute(id: string) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID ${id}`);
    }

    await this.categoryRepository.remove(category);
    await this.categorySnapshotPublisher.publishDeleted(category.id!);
    this.categoryMutationTracker.trackDelete();
  }
}
