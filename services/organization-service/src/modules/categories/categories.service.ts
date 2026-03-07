import { Categories } from '@/modules/categories/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private readonly categoryRepo: Repository<Categories>,
  ) {}
}
