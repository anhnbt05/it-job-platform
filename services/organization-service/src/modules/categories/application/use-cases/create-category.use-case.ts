import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from '@/modules/categories/dto';
import { Category } from '@/modules/categories/domain/category';
import { CATEGORY_REPOSITORY } from '@/modules/categories/domain/category.repository';
import { CATEGORY_MUTATION_TRACKER } from '../ports/category-mutation-tracker.port';
import { CATEGORY_SNAPSHOT_PUBLISHER } from '../ports/category-snapshot.publisher.port';
import type { CategoryRepository } from '@/modules/categories/domain/category.repository';
import type { CategoryMutationTracker } from '../ports/category-mutation-tracker.port';
import type { CategorySnapshotPublisher } from '../ports/category-snapshot.publisher.port';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    @Inject(CATEGORY_SNAPSHOT_PUBLISHER)
    private readonly categorySnapshotPublisher: CategorySnapshotPublisher,
    @Inject(CATEGORY_MUTATION_TRACKER)
    private readonly categoryMutationTracker: CategoryMutationTracker,
  ) {}

  async execute(dto: CreateCategoryDto) {
    const existing = await this.categoryRepository.findByName(dto.name);

    if (existing) {
      throw new BadRequestException(
        `Category with name ${dto.name} already exists`,
      );
    }

    const category = await this.categoryRepository.save(
      Category.create({ name: dto.name }),
    );

    await this.categorySnapshotPublisher.publishCreated(category);
    this.categoryMutationTracker.trackCreate();

    return category;
  }
}
