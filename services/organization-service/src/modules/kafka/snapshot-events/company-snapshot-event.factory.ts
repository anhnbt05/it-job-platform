import { Company } from '@/modules/companies/domain/company';
import { Injectable } from '@nestjs/common';
import {
  CompanySnapshotPayload,
  SnapshotEventMessage,
} from './snapshot-event.types';

@Injectable()
export class CompanySnapshotEventFactory {
  createCreated(company: Company): SnapshotEventMessage<CompanySnapshotPayload> {
    return {
      topic: 'company-snapshot.created',
      payload: this.createPayload(company),
    };
  }

  createUpdated(company: Company): SnapshotEventMessage<CompanySnapshotPayload> {
    return {
      topic: 'company-snapshot.updated',
      payload: this.createPayload(company),
    };
  }

  private createPayload(company: Company): CompanySnapshotPayload {
    return {
      id: company.id!,
      name: company.name,
      location: company.location,
      updated_at: new Date(company.updatedAt ?? new Date()),
      logo_url: company.logoUrl,
    };
  }
}
