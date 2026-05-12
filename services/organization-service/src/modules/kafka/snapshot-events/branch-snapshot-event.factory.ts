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
      payload: this.createPayload(branch),
    };
  }

  createUpdated(
    branch: Branch,
  ): SnapshotEventMessage<BranchSnapshotPayload> {
    return {
      topic: 'branch-snapshot.updated',
      payload: this.createPayload(branch),
    };
  }

  private createPayload(branch: Branch): BranchSnapshotPayload {
    return {
      id: branch.id!,
      company_id: branch.company.id!,
      name: branch.name,
      updated_at: new Date(branch.updatedAt ?? new Date()),
      city: branch.city,
      address: branch.address,
      country: branch.country,
    };
  }
}
