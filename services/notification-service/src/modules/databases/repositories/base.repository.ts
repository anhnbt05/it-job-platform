import { BaseEntity } from '@/modules/databases/entities';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  Repository,
  DeepPartial,
  ObjectLiteral,
  DataSource,
  EntityManager,
  FindOneOptions,
} from 'typeorm';

export abstract class BaseRepository<T extends BaseEntity & ObjectLiteral> {
  constructor(
    protected readonly repo: Repository<T>,
    @InjectDataSource() protected readonly dataSource: DataSource,
  ) {}

  async findById(id: T['id'], options?: FindOneOptions<T>): Promise<T | null> {
    return this.repo.findOne({
      where: { id } as any,
      ...options,
    });
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: T['id'], data: DeepPartial<T>): Promise<T | null> {
    await this.repo.update(id as any, data as any);
    return this.findById(id);
  }

  async delete(id: T['id']): Promise<void> {
    await this.repo.delete(id as any);
  }

  async paginate(page = 1, limit = 10) {
    const [data, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async withTransaction<R>(
    work: (manager: EntityManager) => Promise<R>,
  ): Promise<R> {
    return this.dataSource.transaction(work);
  }
}
