import { Roles } from '@/common/decorators';
import { RoleEnum } from '@/common/enums';
import { BranchesService } from '@/modules/branches/branches.service';
import { CreateBranchDto, UpdateBranchDto } from '@/modules/branches/dto';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @Roles(RoleEnum.RECRUITER, RoleEnum.ADMIN)
  async getBranches(@Query('companyId') companyId?: string) {
    return this.branchesService.getBranches(companyId);
  }

  @Get(':id')
  @Roles(RoleEnum.RECRUITER, RoleEnum.ADMIN)
  async getBranch(@Param('id', ParseUUIDPipe) id: string) {
    return this.branchesService.getBranch(id);
  }

  @MessagePattern('branch.find-by-id')
  async findBranchById(@Payload() payload: { id: string }) {
    return this.branchesService.findBranchById(payload);
  }

  @MessagePattern('branch.created')
  async createBranch(@Payload() payload: CreateBranchDto) {
    return this.branchesService.createBranch(payload);
  }

  @Post()
  @Roles(RoleEnum.RECRUITER, RoleEnum.ADMIN)
  async createBranchHttp(@Body() payload: CreateBranchDto) {
    return this.createBranch(payload);
  }

  @Patch(':id')
  @Roles(RoleEnum.RECRUITER, RoleEnum.ADMIN)
  async updateBranch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchesService.updateBranch(id, dto);
  }
}
