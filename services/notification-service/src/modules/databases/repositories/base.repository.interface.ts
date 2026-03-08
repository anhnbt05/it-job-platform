import { EntityManager, FindOneOptions } from 'typeorm';

export interface IBaseRepository<T> {
  findById(id: string, options?: FindOneOptions<T>): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<void>;
  paginate(
    page: number,
    limit: number,
  ): Promise<{
    data: T[];
    meta: {
      total: number;
      page: number;
      lastPage: number;
    };
  }>;
  withTransaction(work: (manager: EntityManager) => Promise<T>): Promise<T>;
}
