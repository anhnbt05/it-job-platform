import { CreateBranchDto } from '@/modules/companies/dto';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CompaniesService } from '../companies.service';

@Controller()
export class BranchCreatedConsummer {
  constructor(private readonly companiesService: CompaniesService) {}

  @EventPattern('branch-snapshot.created')
  async createBranchSnapshot(@Payload() dto: CreateBranchDto) {
    return this.companiesService.createBranchSnapshot(dto);
  }
}
