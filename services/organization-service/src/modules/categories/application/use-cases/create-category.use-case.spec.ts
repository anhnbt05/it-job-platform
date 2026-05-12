import { BadRequestException } from '@nestjs/common';
import { Category } from '@/modules/categories/domain/category';
import { CreateCategoryUseCase } from './create-category.use-case';

describe('CreateCategoryUseCase', () => {
  it('creates a category when the name does not exist', async () => {
    const save = jest
      .fn()
      .mockImplementation(async (category: Category) =>
        Category.rehydrate({
          ...category.toPrimitives(),
          id: 'category-1',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      );
    const categoryRepository = {
      findByName: jest.fn().mockResolvedValue(null),
      save,
    };
    const categorySnapshotPublisher = {
      publishCreated: jest.fn().mockResolvedValue(undefined),
    };
    const categoryMutationTracker = {
      trackCreate: jest.fn(),
    };
    const useCase = new CreateCategoryUseCase(
      categoryRepository as never,
      categorySnapshotPublisher as never,
      categoryMutationTracker as never,
    );

    const category = await useCase.execute({ name: 'Backend' });

    expect(categoryRepository.findByName).toHaveBeenCalledWith('Backend');
    expect(save).toHaveBeenCalledTimes(1);
    expect(categorySnapshotPublisher.publishCreated).toHaveBeenCalledWith(
      category,
    );
    expect(categoryMutationTracker.trackCreate).toHaveBeenCalled();
    expect(category.toPrimitives()).toMatchObject({
      id: 'category-1',
      name: 'Backend',
    });
  });

  it('throws when the category name already exists', async () => {
    const categoryRepository = {
      findByName: jest.fn().mockResolvedValue(
        Category.rehydrate({
          id: 'category-2',
          name: 'Backend',
        }),
      ),
      save: jest.fn(),
    };
    const categorySnapshotPublisher = {
      publishCreated: jest.fn(),
    };
    const categoryMutationTracker = {
      trackCreate: jest.fn(),
    };
    const useCase = new CreateCategoryUseCase(
      categoryRepository as never,
      categorySnapshotPublisher as never,
      categoryMutationTracker as never,
    );

    await expect(useCase.execute({ name: 'Backend' })).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(categoryRepository.save).not.toHaveBeenCalled();
    expect(categorySnapshotPublisher.publishCreated).not.toHaveBeenCalled();
    expect(categoryMutationTracker.trackCreate).not.toHaveBeenCalled();
  });
});
