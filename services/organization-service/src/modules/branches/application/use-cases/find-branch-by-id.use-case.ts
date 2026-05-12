import { BRANCH_REPOSITORY } from '@/modules/branches/domain/branch.repository';
import { Inject, Injectable } from '@nestjs/common';
import type { BranchRepository } from '@/modules/branches/domain/branch.repository';

@Injectable()
export class FindBranchByIdUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: BranchRepository,
  ) {}

  execute(id: string) {
    return this.branchRepository.findById(id);
  }
}
