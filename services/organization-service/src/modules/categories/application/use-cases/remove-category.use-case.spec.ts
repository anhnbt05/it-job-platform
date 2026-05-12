import { NotFoundException } from '@nestjs/common';
import { Category } from '@/modules/categories/domain/category';
import { RemoveCategoryUseCase } from './remove-category.use-case';

describe('RemoveCategoryUseCase', () => {
  it('removes a category and publishes the deletion event', async () => {
    const category = Category.rehydrate({
      id: 'category-1',
      name: 'Backend',
    });
    const categoryRepository = {
      findById: jest.fn().mockResolvedValue(category),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    const categorySnapshotPublisher = {
      publishDeleted: jest.fn().mockResolvedValue(undefined),
    };
    const categoryMutationTracker = {
      trackDelete: jest.fn(),
    };
    const useCase = new RemoveCategoryUseCase(
      categoryRepository as never,
      categorySnapshotPublisher as never,
      categoryMutationTracker as never,
    );

    await expect(useCase.execute('category-1')).resolves.toBeUndefined();

    expect(categoryRepository.findById).toHaveBeenCalledWith('category-1');
    expect(categoryRepository.remove).toHaveBeenCalledWith(category);
    expect(categorySnapshotPublisher.publishDeleted).toHaveBeenCalledWith(
      'category-1',
    );
    expect(categoryMutationTracker.trackDelete).toHaveBeenCalled();
  });

  it('throws when the category is missing', async () => {
    const categoryRepository = {
      findById: jest.fn().mockResolvedValue(null),
      remove: jest.fn(),
    };
    const categorySnapshotPublisher = {
      publishDeleted: jest.fn(),
    };
    const categoryMutationTracker = {
      trackDelete: jest.fn(),
    };
    const useCase = new RemoveCategoryUseCase(
      categoryRepository as never,
      categorySnapshotPublisher as never,
      categoryMutationTracker as never,
    );

    await expect(useCase.execute('missing-category')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(categoryRepository.remove).not.toHaveBeenCalled();
    expect(categorySnapshotPublisher.publishDeleted).not.toHaveBeenCalled();
    expect(categoryMutationTracker.trackDelete).not.toHaveBeenCalled();
  });
});
