import { Roles } from '@/common/decorators';
import { RoleEnum } from '@/common/enums';
import { BranchesService } from '@/modules/branches/branches.service';
import { CreateBranchDto, UpdateBranchDto } from '@/modules/branches/dto';
import { Body, Controller, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('branches')
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

  @Patch(':id')
  @Roles(RoleEnum.RECRUITER)
  async updateBranch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchesService.updateBranch(id, dto);
  }
}
