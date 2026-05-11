import { Branches } from '@/modules/branches/entities';
import { Injectable } from '@nestjs/common';
import {
  BranchSnapshotPayload,
  SnapshotEventMessage,
} from './snapshot-event.types';

@Injectable()
export class BranchSnapshotEventFactory {
  createCreated(
    branch: Branches,
    companyId: string,
  ): SnapshotEventMessage<BranchSnapshotPayload> {
    return {
      topic: 'branch-snapshot.created',
      payload: this.createPayload(branch, companyId),
    };
  }

  createUpdated(
    branch: Branches,
    companyId: string,
  ): SnapshotEventMessage<BranchSnapshotPayload> {
    return {
      topic: 'branch-snapshot.updated',
      payload: this.createPayload(branch, companyId),
    };
  }

  private createPayload(branch: Branches, companyId: string): BranchSnapshotPayload {
    return {
      id: branch.id,
      company_id: companyId,
      name: branch.name,
      updated_at: new Date(branch.updatedAt),
      city: branch.city,
      address: branch.address,
      country: branch.country,
    };
  }
}
