import { BranchesService } from '@/modules/branches/branches.service';
import { CreateBranchDto } from '@/modules/branches/dto';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @MessagePattern('branch.find-by-id')
  async findBranchById(@Payload() payload: { id: string }) {
    return this.branchesService.findBranchById(payload);
  }

  @MessagePattern('branch.created')
  async createBranch(@Payload() payload: CreateBranchDto) {
    return this.branchesService.createBranch(payload);
  }
}
