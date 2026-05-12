import { BRANCH_REPOSITORY } from '@/modules/branches/domain/branch.repository';
import { Inject, Injectable } from '@nestjs/common';
import type { BranchRepository } from '@/modules/branches/domain/branch.repository';

@Injectable()
export class GetBranchesUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: BranchRepository,
  ) {}

  execute(companyId?: string) {
    return this.branchRepository.findAll(companyId);
  }
}
