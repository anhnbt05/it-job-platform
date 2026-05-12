import { Category } from '../../domain/category';

export const CATEGORY_SNAPSHOT_PUBLISHER = 'CATEGORY_SNAPSHOT_PUBLISHER';

export interface CategorySnapshotPublisher {
  publishCreated(category: Category): Promise<unknown> | unknown;
  publishUpdated(category: Category): Promise<unknown> | unknown;
  publishDeleted(id: string): Promise<unknown> | unknown;
}
