import { Companies } from '@/modules/companies/entities';
import { Injectable } from '@nestjs/common';
import {
  CompanySnapshotPayload,
  SnapshotEventMessage,
} from './snapshot-event.types';

@Injectable()
export class CompanySnapshotEventFactory {
  createCreated(company: Companies): SnapshotEventMessage<CompanySnapshotPayload> {
    return {
      topic: 'company-snapshot.created',
      payload: this.createPayload(company),
    };
  }

  createUpdated(company: Companies): SnapshotEventMessage<CompanySnapshotPayload> {
    return {
      topic: 'company-snapshot.updated',
      payload: this.createPayload(company),
    };
  }

  private createPayload(company: Companies): CompanySnapshotPayload {
    return {
      id: company.id,
      name: company.name,
      location: company.location,
      updated_at: new Date(company.updatedAt),
      logo_url: company.logo_url,
    };
  }
}
