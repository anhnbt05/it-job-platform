import { Branch } from '@/modules/branches/domain/branch';
import { Category } from '@/modules/categories/domain/category';
import { Company } from '@/modules/companies/domain/company';
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

  publishCompanyCreated(company: Company) {
    return this.publish(this.companyFactory.createCreated(company));
  }

  publishCompanyUpdated(company: Company) {
    return this.publish(this.companyFactory.createUpdated(company));
  }

  publishBranchCreated(branch: Branch) {
    return this.publish(this.branchFactory.createCreated(branch));
  }

  publishBranchUpdated(branch: Branch) {
    return this.publish(this.branchFactory.createUpdated(branch));
  }

  publishCategoryCreated(category: Category) {
    return this.publish(this.categoryFactory.createCreated(category));
  }

  publishCategoryUpdated(category: Category) {
    return this.publish(this.categoryFactory.createUpdated(category));
  }

  publishCategoryDeleted(id: string) {
    return this.publish(this.categoryFactory.createDeleted(id));
  }

  private publish<TPayload>(message: SnapshotEventMessage<TPayload>) {
    return this.kafkaService.emit(message.topic, message.payload);
  }
}
