import {
  CreateBranchDto,
  CreateCompanyDto,
  UpdateBranchDto,
  UpdateCompanyDto,
} from '@/modules/companies/dto';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  CompanySnapshotCommandRegistry,
  CompanySnapshotEvent,
} from '../commands';

@Controller()
export class CompaniesEventsConsumer {
  constructor(
    private readonly commandRegistry: CompanySnapshotCommandRegistry,
  ) {}

  @EventPattern(CompanySnapshotEvent.COMPANY_CREATED)
  async handleCompanyCreated(@Payload() dto: CreateCompanyDto) {
    await this.commandRegistry.dispatch(
      CompanySnapshotEvent.COMPANY_CREATED,
      dto,
    );
  }

  @EventPattern(CompanySnapshotEvent.COMPANY_UPDATED)
  async handleCompanyUpdated(@Payload() dto: UpdateCompanyDto) {
    await this.commandRegistry.dispatch(
      CompanySnapshotEvent.COMPANY_UPDATED,
      dto,
    );
  }

  @EventPattern(CompanySnapshotEvent.BRANCH_CREATED)
  async handleBranchCreated(@Payload() dto: CreateBranchDto) {
    await this.commandRegistry.dispatch(
      CompanySnapshotEvent.BRANCH_CREATED,
      dto,
    );
  }

  @EventPattern(CompanySnapshotEvent.BRANCH_UPDATED)
  async handleBranchUpdated(@Payload() dto: UpdateBranchDto) {
    await this.commandRegistry.dispatch(
      CompanySnapshotEvent.BRANCH_UPDATED,
      dto,
    );
  }
}
