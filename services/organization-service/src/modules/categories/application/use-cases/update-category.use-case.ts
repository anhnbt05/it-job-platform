import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateCategoryDto } from '@/modules/categories/dto';
import { CATEGORY_REPOSITORY } from '@/modules/categories/domain/category.repository';
import { CATEGORY_MUTATION_TRACKER } from '../ports/category-mutation-tracker.port';
import { CATEGORY_SNAPSHOT_PUBLISHER } from '../ports/category-snapshot.publisher.port';
import type { CategoryRepository } from '@/modules/categories/domain/category.repository';
import type { CategoryMutationTracker } from '../ports/category-mutation-tracker.port';
import type { CategorySnapshotPublisher } from '../ports/category-snapshot.publisher.port';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    @Inject(CATEGORY_SNAPSHOT_PUBLISHER)
    private readonly categorySnapshotPublisher: CategorySnapshotPublisher,
    @Inject(CATEGORY_MUTATION_TRACKER)
    private readonly categoryMutationTracker: CategoryMutationTracker,
  ) {}

  async execute(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID ${id}`);
    }

    category.update(dto);

    const updatedCategory = await this.categoryRepository.save(category);

    await this.categorySnapshotPublisher.publishUpdated(updatedCategory);
    this.categoryMutationTracker.trackUpdate();

    return updatedCategory;
  }
}
