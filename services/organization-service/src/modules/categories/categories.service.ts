import { Categories } from '@/modules/categories/entities';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KafkaService } from '../kafka/kafka.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private readonly categoryRepo: Repository<Categories>,
    @Inject('KAFKA_SERVICE') private readonly kafkaService: KafkaService
  ) { }

  async create(createCategoryDto: CreateCategoryDto): Promise<Categories> {
    const existing = await this.categoryRepo.findOne({
      where: {
        name: createCategoryDto.name
      }
    });

    if (existing) {
      throw new BadRequestException(`Category with name ${createCategoryDto.name} already exists`);
    }

    const category = await this.categoryRepo.save(
      this.categoryRepo.create(createCategoryDto)
    );

    this.kafkaService.emit('category-snapshot.created', {
      id: category.id,
      name: category.name,
      updated_at: new Date(category.updatedAt),
    });

    return category;
  }

  async findAll(): Promise<Categories[]> {
    return await this.categoryRepo.find();
  }

  async findOne(id: string): Promise<Categories> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Categories> {
    const category = await this.findOne(id);
    Object.assign(category, updateCategoryDto);
    const updated = await this.categoryRepo.save(category);

    this.kafkaService.emit('category-snapshot.updated', {
      id: updated.id,
      name: updated.name,
      updated_at: new Date(updated.updatedAt),
    });

    return updated;
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepo.remove(category);

    this.kafkaService.emit('category-snapshot.deleted', {
      id: category.id,
    });
  }
}
