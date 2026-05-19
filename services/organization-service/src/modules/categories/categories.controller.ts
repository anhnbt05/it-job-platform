import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Public } from '@/common/decorators';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Post('internal')
  @Public()
  createInternalCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Get()
  getCategories() {
    return this.categoriesService.getCategories();
  }

  @Get('internal')
  @Public()
  getInternalCategories() {
    return this.categoriesService.getCategories();
  }

  @Get(':id')
  getCategory(@Param('id') id: string) {
    return this.categoriesService.getCategory(id);
  }

  @Patch(':id')
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':id')
  removeCategory(@Param('id') id: string) {
    return this.categoriesService.removeCategory(id);
  }
}
