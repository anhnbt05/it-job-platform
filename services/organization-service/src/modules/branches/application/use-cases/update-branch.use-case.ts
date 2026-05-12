import { UpdateBranchDto } from '@/modules/branches/dto';
import { BRANCH_REPOSITORY } from '@/modules/branches/domain/branch.repository';
import {
  BRANCH_MUTATION_TRACKER,
} from '../ports/branch-mutation-tracker.port';
import {
  BRANCH_SNAPSHOT_PUBLISHER,
} from '../ports/branch-snapshot.publisher.port';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { BranchRepository } from '@/modules/branches/domain/branch.repository';
import type { BranchMutationTracker } from '../ports/branch-mutation-tracker.port';
import type { BranchSnapshotPublisher } from '../ports/branch-snapshot.publisher.port';

@Injectable()
export class UpdateBranchUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: BranchRepository,
    @Inject(BRANCH_SNAPSHOT_PUBLISHER)
    private readonly branchSnapshotPublisher: BranchSnapshotPublisher,
    @Inject(BRANCH_MUTATION_TRACKER)
    private readonly branchMutationTracker: BranchMutationTracker,
  ) {}

  async execute(id: string, dto: UpdateBranchDto) {
    const branch = await this.branchRepository.findById(id);

    if (!branch) {
      throw new NotFoundException('Không tìm thấy thông tin chi nhánh.');
    }

    branch.update(dto);

    const savedBranch = await this.branchRepository.save(branch);

    await this.branchSnapshotPublisher.publishUpdated(savedBranch);
    this.branchMutationTracker.trackUpdate();

    return {
      success: true,
      message: 'Cập nhật thông tin chi nhánh thành công',
    };
  }
}
