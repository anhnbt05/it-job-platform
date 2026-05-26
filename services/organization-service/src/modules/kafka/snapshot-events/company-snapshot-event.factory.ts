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
      payload: this.createPayload(
        company,
        'company-snapshot.created',
        'CompanySnapshotCreated',
      ),
    };
  }

  createUpdated(company: Company): SnapshotEventMessage<CompanySnapshotPayload> {
    return {
      topic: 'company-snapshot.updated',
      payload: this.createPayload(
        company,
        'company-snapshot.updated',
        'CompanySnapshotUpdated',
      ),
    };
  }

  private createPayload(
    company: Company,
    topic: string,
    eventType: string,
  ): CompanySnapshotPayload {
    const updatedAt = new Date(company.updatedAt ?? new Date());
    return {
      event_id: this.createEventId(topic, company.id!, updatedAt),
      event_type: eventType,
      occurred_at: updatedAt,
      id: company.id!,
      name: company.name,
      location: company.location,
      updated_at: updatedAt,
      logo_url: company.logoUrl,
    };
  }

  private createEventId(topic: string, aggregateId: string, occurredAt: Date) {
    return `${topic}:${aggregateId}:${occurredAt.toISOString()}`;
  }
}
