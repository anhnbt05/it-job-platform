import { Branch } from '@/modules/branches/domain/branch';
import { SnapshotEventPublisher } from '@/modules/kafka/snapshot-events';
import { Injectable } from '@nestjs/common';
import { BranchSnapshotPublisher } from '../../application/ports/branch-snapshot.publisher.port';

@Injectable()
export class KafkaBranchSnapshotPublisher implements BranchSnapshotPublisher {
  constructor(
    private readonly snapshotEventPublisher: SnapshotEventPublisher,
  ) {}

  publishCreated(branch: Branch) {
    return this.snapshotEventPublisher.publishBranchCreated(branch);
  }

  publishUpdated(branch: Branch) {
    return this.snapshotEventPublisher.publishBranchUpdated(branch);
  }
}
