import { Category } from '@/modules/categories/domain/category';
import { Injectable } from '@nestjs/common';
import {
  CategoryDeletedPayload,
  CategorySnapshotPayload,
  SnapshotEventMessage,
} from './snapshot-event.types';

@Injectable()
export class CategorySnapshotEventFactory {
  createCreated(
    category: Category,
  ): SnapshotEventMessage<CategorySnapshotPayload> {
    return {
      topic: 'category-snapshot.created',
      payload: this.createPayload(
        category,
        'category-snapshot.created',
        'CategorySnapshotCreated',
      ),
    };
  }

  createUpdated(
    category: Category,
  ): SnapshotEventMessage<CategorySnapshotPayload> {
    return {
      topic: 'category-snapshot.updated',
      payload: this.createPayload(
        category,
        'category-snapshot.updated',
        'CategorySnapshotUpdated',
      ),
    };
  }

  createDeleted(id: string): SnapshotEventMessage<CategoryDeletedPayload> {
    const occurredAt = new Date();
    return {
      topic: 'category-snapshot.deleted',
      payload: {
        event_id: this.createEventId('category-snapshot.deleted', id, occurredAt),
        event_type: 'CategorySnapshotDeleted',
        occurred_at: occurredAt,
        id,
        updated_at: occurredAt,
      },
    };
  }

  private createPayload(
    category: Category,
    topic: string,
    eventType: string,
  ): CategorySnapshotPayload {
    const updatedAt = new Date(category.updatedAt ?? new Date());
    return {
      event_id: this.createEventId(topic, category.id!, updatedAt),
      event_type: eventType,
      occurred_at: updatedAt,
      id: category.id!,
      name: category.name,
      updated_at: updatedAt,
    };
  }

  private createEventId(topic: string, aggregateId: string, occurredAt: Date) {
    return `${topic}:${aggregateId}:${occurredAt.toISOString()}`;
  }
}
