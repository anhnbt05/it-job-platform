import { Company } from '@/modules/companies/domain/company';
import { SnapshotEventPublisher } from '@/modules/kafka/snapshot-events';
import { Injectable } from '@nestjs/common';
import { CompanySnapshotPublisher } from '../../application/ports/company-snapshot.publisher.port';

@Injectable()
export class KafkaCompanySnapshotPublisher implements CompanySnapshotPublisher {
  constructor(
    private readonly snapshotEventPublisher: SnapshotEventPublisher,
  ) {}

  publishCreated(company: Company) {
    return this.snapshotEventPublisher.publishCompanyCreated(company);
  }

  publishUpdated(company: Company) {
    return this.snapshotEventPublisher.publishCompanyUpdated(company);
  }
}
