import { Branches } from '@/modules/branches/entities';
import { Categories } from '@/modules/categories/entities';
import { Companies } from '@/modules/companies/entities';
import { Injectable } from '@nestjs/common';
import { KafkaService } from '../kafka.service';
import { BranchSnapshotEventFactory } from './branch-snapshot-event.factory';
import { CategorySnapshotEventFactory } from './category-snapshot-event.factory';
import { CompanySnapshotEventFactory } from './company-snapshot-event.factory';
import { SnapshotEventMessage } from './snapshot-event.types';

@Injectable()
export class SnapshotEventPublisher {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly companyFactory: CompanySnapshotEventFactory,
    private readonly branchFactory: BranchSnapshotEventFactory,
    private readonly categoryFactory: CategorySnapshotEventFactory,
  ) {}

  publishCompanyCreated(company: Companies) {
    return this.publish(this.companyFactory.createCreated(company));
  }

  publishCompanyUpdated(company: Companies) {
    return this.publish(this.companyFactory.createUpdated(company));
  }

  publishBranchCreated(branch: Branches, companyId: string) {
    return this.publish(this.branchFactory.createCreated(branch, companyId));
  }

  publishBranchUpdated(branch: Branches, companyId: string) {
    return this.publish(this.branchFactory.createUpdated(branch, companyId));
  }

  publishCategoryCreated(category: Categories) {
    return this.publish(this.categoryFactory.createCreated(category));
  }

  publishCategoryUpdated(category: Categories) {
    return this.publish(this.categoryFactory.createUpdated(category));
  }

  publishCategoryDeleted(id: string) {
    return this.publish(this.categoryFactory.createDeleted(id));
  }

  private publish<TPayload>(message: SnapshotEventMessage<TPayload>) {
    return this.kafkaService.emit(message.topic, message.payload);
  }
}
