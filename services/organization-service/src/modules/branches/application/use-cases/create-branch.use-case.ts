import { CreateBranchDto } from '@/modules/branches/dto';
import { Branch } from '@/modules/branches/domain/branch';
import {
  BRANCH_REPOSITORY,
} from '@/modules/branches/domain/branch.repository';
import { COMPANY_REPOSITORY } from '@/modules/companies/domain/company.repository';
import {
  BRANCH_MUTATION_TRACKER,
} from '../ports/branch-mutation-tracker.port';
import {
  BRANCH_SNAPSHOT_PUBLISHER,
} from '../ports/branch-snapshot.publisher.port';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { BranchRepository } from '@/modules/branches/domain/branch.repository';
import type { CompanyRepository } from '@/modules/companies/domain/company.repository';
import type { BranchMutationTracker } from '../ports/branch-mutation-tracker.port';
import type { BranchSnapshotPublisher } from '../ports/branch-snapshot.publisher.port';

@Injectable()
export class CreateBranchUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: BranchRepository,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @Inject(BRANCH_SNAPSHOT_PUBLISHER)
    private readonly branchSnapshotPublisher: BranchSnapshotPublisher,
    @Inject(BRANCH_MUTATION_TRACKER)
    private readonly branchMutationTracker: BranchMutationTracker,
  ) {}

  async execute(dto: CreateBranchDto) {
    const company = await this.companyRepository.findById(dto.company_id);

    if (!company) {
      throw new NotFoundException('Không tìm thấy thông tin công ty.');
    }

    const branch = Branch.create({
      name: dto.name,
      address: dto.address,
      city: dto.city,
      country: dto.country,
      company: company.toPrimitives(),
    });

    const savedBranch = await this.branchRepository.save(branch);

    await this.branchSnapshotPublisher.publishCreated(savedBranch);
    this.branchMutationTracker.trackCreate();

    return savedBranch;
  }
}
