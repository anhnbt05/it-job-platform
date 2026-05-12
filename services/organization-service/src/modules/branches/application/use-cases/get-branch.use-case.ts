import { BRANCH_REPOSITORY } from '@/modules/branches/domain/branch.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { BranchRepository } from '@/modules/branches/domain/branch.repository';

@Injectable()
export class GetBranchUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: BranchRepository,
  ) {}

  async execute(id: string) {
    const branch = await this.branchRepository.findById(id);

    if (!branch) {
      throw new NotFoundException('Không tìm thấy thông tin chi nhánh.');
    }

    return branch;
  }
}
