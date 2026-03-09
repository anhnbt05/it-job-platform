import { UpdateBranchDto } from '@/modules/companies/dto';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CompaniesService } from '../companies.service';

@Controller()
export class BranchUpdatedConsummer {
  constructor(private readonly companiesService: CompaniesService) {}

  @EventPattern('branch-snapshot.updated')
  async updateBranchSnapshot(@Payload() dto: UpdateBranchDto) {
    return this.companiesService.updateBranchSnapshot(dto);
  }
}
