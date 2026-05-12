import { Branch } from '../../domain/branch';

export const BRANCH_SNAPSHOT_PUBLISHER = 'BRANCH_SNAPSHOT_PUBLISHER';

export interface BranchSnapshotPublisher {
  publishCreated(branch: Branch): Promise<unknown> | unknown;
  publishUpdated(branch: Branch): Promise<unknown> | unknown;
}
