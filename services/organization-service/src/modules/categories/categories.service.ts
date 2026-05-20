import { Injectable } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import {
  CreateCategoryUseCase,
  GetCategoriesUseCase,
  GetCategoryUseCase,
  RemoveCategoryUseCase,
  UpdateCategoryUseCase,
} from './application/use-cases';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly getCategoryUseCase: GetCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly removeCategoryUseCase: RemoveCategoryUseCase,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const category = await this.createCategoryUseCase.execute(createCategoryDto);
    return {
      success: true,
      message: 'Tạo danh mục thành công.',
      data: category.toPrimitives(),
    };
  }

  async getCategories() {
    const categories = await this.getCategoriesUseCase.execute();
    return categories.map((category) => category.toPrimitives());
  }

  async getCategory(id: string) {
    const category = await this.getCategoryUseCase.execute(id);
    return category.toPrimitives();
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.updateCategoryUseCase.execute(
      id,
      updateCategoryDto,
    );
    return {
      success: true,
      message: 'Cập nhật danh mục thành công.',
      data: category.toPrimitives(),
    };
  }

  async removeCategory(id: string) {
    await this.removeCategoryUseCase.execute(id);

    return {
      success: true,
      message: 'Xóa danh mục thành công.',
    };
  }
}
