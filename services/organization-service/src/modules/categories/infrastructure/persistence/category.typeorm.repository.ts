import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from '@/modules/categories/entities';
import { Category } from '@/modules/categories/domain/category';
import { CategoryRepository } from '@/modules/categories/domain/category.repository';
import { CategoryMapper } from './category.mapper';

@Injectable()
export class CategoryTypeOrmRepository implements CategoryRepository {
  constructor(
    @InjectRepository(Categories)
    private readonly categoryRepository: Repository<Categories>,
  ) {}

  async findAll() {
    const categories = await this.categoryRepository.find();
    return categories.map((category) => CategoryMapper.toDomain(category));
  }

  async findById(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    return category ? CategoryMapper.toDomain(category) : null;
  }

  async findByName(name: string) {
    const category = await this.categoryRepository.findOne({ where: { name } });
    return category ? CategoryMapper.toDomain(category) : null;
  }

  async save(category: Category) {
    const categoryEntity = CategoryMapper.toPersistence(category);
    const savedCategory = await this.categoryRepository.save(categoryEntity);
    return CategoryMapper.toDomain(savedCategory);
  }

  async remove(category: Category) {
    await this.categoryRepository.remove(
      CategoryMapper.toPersistence(category),
    );
  }
}
