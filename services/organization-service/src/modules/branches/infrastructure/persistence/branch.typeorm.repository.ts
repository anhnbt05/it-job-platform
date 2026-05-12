import { Branch } from '@/modules/branches/domain/branch';
import {
  BranchRepository,
} from '@/modules/branches/domain/branch.repository';
import { Branches } from '@/modules/branches/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BranchMapper } from './branch.mapper';

@Injectable()
export class BranchTypeOrmRepository implements BranchRepository {
  constructor(
    @InjectRepository(Branches)
    private readonly branchRepository: Repository<Branches>,
  ) {}

  async findAll(companyId?: string) {
    const branches = await this.branchRepository.find({
      where: companyId
        ? {
            company: {
              id: companyId,
            },
          }
        : {},
      relations: {
        company: true,
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    return branches.map((branch) => BranchMapper.toDomain(branch));
  }

  async findById(id: string) {
    const branch = await this.branchRepository.findOne({
      where: { id },
      relations: {
        company: true,
      },
    });

    return branch ? BranchMapper.toDomain(branch) : null;
  }

  async save(branch: Branch) {
    const branchEntity = BranchMapper.toPersistence(branch);
    const savedBranch = await this.branchRepository.save(branchEntity);
    const savedBranchWithCompany = await this.branchRepository.findOneOrFail({
      where: { id: savedBranch.id },
      relations: {
        company: true,
      },
    });

    return BranchMapper.toDomain(savedBranchWithCompany);
  }
}
