import { Categories } from '@/modules/categories/entities';
import { Injectable } from '@nestjs/common';
import {
  CategoryDeletedPayload,
  CategorySnapshotPayload,
  SnapshotEventMessage,
} from './snapshot-event.types';

@Injectable()
export class CategorySnapshotEventFactory {
  createCreated(
    category: Categories,
  ): SnapshotEventMessage<CategorySnapshotPayload> {
    return {
      topic: 'category-snapshot.created',
      payload: this.createPayload(category),
    };
  }

  createUpdated(
    category: Categories,
  ): SnapshotEventMessage<CategorySnapshotPayload> {
    return {
      topic: 'category-snapshot.updated',
      payload: this.createPayload(category),
    };
  }

  createDeleted(id: string): SnapshotEventMessage<CategoryDeletedPayload> {
    return {
      topic: 'category-snapshot.deleted',
      payload: { id },
    };
  }

  private createPayload(category: Categories): CategorySnapshotPayload {
    return {
      id: category.id,
      name: category.name,
      updated_at: new Date(category.updatedAt),
    };
  }
}
