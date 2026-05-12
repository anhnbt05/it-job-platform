import { Categories } from '@/modules/categories/entities';
import { Category } from '@/modules/categories/domain/category';

export class CategoryMapper {
  static toDomain(entity: Categories) {
    return Category.rehydrate({
      id: entity.id,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(category: Category) {
    return Object.assign(new Categories(), category.toPrimitives());
  }
}
