import { Injectable } from '@nestjs/common';
import { SnapshotEventPublisher } from '@/modules/kafka/snapshot-events';
import { Category } from '@/modules/categories/domain/category';
import { CategorySnapshotPublisher } from '../../application/ports/category-snapshot.publisher.port';

@Injectable()
export class KafkaCategorySnapshotPublisher implements CategorySnapshotPublisher {
  constructor(
    private readonly snapshotEventPublisher: SnapshotEventPublisher,
  ) {}

  publishCreated(category: Category) {
    return this.snapshotEventPublisher.publishCategoryCreated(category);
  }

  publishUpdated(category: Category) {
    return this.snapshotEventPublisher.publishCategoryUpdated(category);
  }

  publishDeleted(id: string) {
    return this.snapshotEventPublisher.publishCategoryDeleted(id);
  }
}
