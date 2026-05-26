import { Branch } from '@/modules/branches/domain/branch';
import { Injectable } from '@nestjs/common';
import {
  BranchSnapshotPayload,
  SnapshotEventMessage,
} from './snapshot-event.types';

@Injectable()
export class BranchSnapshotEventFactory {
  createCreated(
    branch: Branch,
  ): SnapshotEventMessage<BranchSnapshotPayload> {
    return {
      topic: 'branch-snapshot.created',
      payload: this.createPayload(
        branch,
        'branch-snapshot.created',
        'BranchSnapshotCreated',
      ),
    };
  }

  createUpdated(
    branch: Branch,
  ): SnapshotEventMessage<BranchSnapshotPayload> {
    return {
      topic: 'branch-snapshot.updated',
      payload: this.createPayload(
        branch,
        'branch-snapshot.updated',
        'BranchSnapshotUpdated',
      ),
    };
  }

  private createPayload(
    branch: Branch,
    topic: string,
    eventType: string,
  ): BranchSnapshotPayload {
    const updatedAt = new Date(branch.updatedAt ?? new Date());
    return {
      event_id: this.createEventId(topic, branch.id!, updatedAt),
      event_type: eventType,
      occurred_at: updatedAt,
      id: branch.id!,
      company_id: branch.company.id!,
      name: branch.name,
      updated_at: updatedAt,
      city: branch.city,
      address: branch.address,
      country: branch.country,
    };
  }

  private createEventId(topic: string, aggregateId: string, occurredAt: Date) {
    return `${topic}:${aggregateId}:${occurredAt.toISOString()}`;
  }
}
