import { Inject, Injectable } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '@/modules/categories/domain/category.repository';
import type { CategoryRepository } from '@/modules/categories/domain/category.repository';

@Injectable()
export class GetCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  execute() {
    return this.categoryRepository.findAll();
  }
}
