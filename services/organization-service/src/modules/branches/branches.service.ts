import { CreateBranchDto, UpdateBranchDto } from '@/modules/branches/dto';
import { Injectable } from '@nestjs/common';
import {
  CreateBranchUseCase,
  FindBranchByIdUseCase,
  GetBranchUseCase,
  GetBranchesUseCase,
  UpdateBranchUseCase,
} from './application/use-cases';

@Injectable()
export class BranchesService {
  constructor(
    private readonly createBranchUseCase: CreateBranchUseCase,
    private readonly findBranchByIdUseCase: FindBranchByIdUseCase,
    private readonly getBranchUseCase: GetBranchUseCase,
    private readonly getBranchesUseCase: GetBranchesUseCase,
    private readonly updateBranchUseCase: UpdateBranchUseCase,
  ) {}

  async getBranches(companyId?: string) {
    const branches = await this.getBranchesUseCase.execute(companyId);
    return branches.map((branch) => branch.toPrimitives());
  }

  async getBranch(id: string) {
    const branch = await this.getBranchUseCase.execute(id);
    return branch.toPrimitives();
  }

  async updateBranch(id: string, dto: UpdateBranchDto) {
    return this.updateBranchUseCase.execute(id, dto);
  }

  async findBranchById(dto: { id: string }) {
    const branch = await this.findBranchByIdUseCase.execute(dto.id);
    return branch?.toPrimitives() ?? null;
  }

  async createBranch(dto: CreateBranchDto) {
    const branch = await this.createBranchUseCase.execute(dto);
    return branch.toPrimitives();
  }
}
