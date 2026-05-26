import { Branches } from '@/modules/branches/entities';
import { Categories } from '@/modules/categories/entities';
import { Companies } from '@/modules/companies/entities';
import { KafkaService } from '@/modules/kafka/kafka.service';
import { BranchSnapshotEventFactory } from './branch-snapshot-event.factory';
import { CategorySnapshotEventFactory } from './category-snapshot-event.factory';
import { CompanySnapshotEventFactory } from './company-snapshot-event.factory';
import { SnapshotEventPublisher } from './snapshot-event.publisher';

describe('SnapshotEventPublisher', () => {
  const kafkaService = {
    emit: jest.fn(),
  } as unknown as KafkaService;

  const publisher = new SnapshotEventPublisher(
    kafkaService,
    new CompanySnapshotEventFactory(),
    new BranchSnapshotEventFactory(),
    new CategorySnapshotEventFactory(),
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('publishes company created events through the facade', () => {
    const company = {
      id: 'company-1',
      name: 'IT Job',
      location: 'HCM',
      logo_url: 'logo.png',
      updatedAt: new Date('2026-05-11T00:00:00.000Z'),
    } as Companies;

    publisher.publishCompanyCreated(company);

    expect(kafkaService.emit).toHaveBeenCalledWith(
      'company-snapshot.created',
      expect.objectContaining({
        event_id: 'company-snapshot.created:company-1:2026-05-11T00:00:00.000Z',
        event_type: 'CompanySnapshotCreated',
        occurred_at: new Date('2026-05-11T00:00:00.000Z'),
        id: 'company-1',
        name: 'IT Job',
        location: 'HCM',
        logo_url: 'logo.png',
        updated_at: new Date('2026-05-11T00:00:00.000Z'),
      }),
    );
  });

  it('publishes branch and category payloads with the matching factory output', () => {
    const branch = {
      id: 'branch-1',
      name: 'District 1',
      address: '1 Nguyen Hue',
      city: 'HCM',
      country: 'VN',
      updatedAt: new Date('2026-05-11T00:00:00.000Z'),
    } as Branches;
    const category = {
      id: 'category-1',
      name: 'Backend',
      updatedAt: new Date('2026-05-11T00:00:00.000Z'),
    } as Categories;

    publisher.publishBranchUpdated(branch, 'company-1');
    publisher.publishCategoryCreated(category);
    publisher.publishCategoryDeleted('category-1');

    expect(kafkaService.emit).toHaveBeenNthCalledWith(
      1,
      'branch-snapshot.updated',
      expect.objectContaining({
        event_id: 'branch-snapshot.updated:branch-1:2026-05-11T00:00:00.000Z',
        event_type: 'BranchSnapshotUpdated',
        occurred_at: new Date('2026-05-11T00:00:00.000Z'),
        id: 'branch-1',
        company_id: 'company-1',
        name: 'District 1',
        updated_at: new Date('2026-05-11T00:00:00.000Z'),
        city: 'HCM',
        address: '1 Nguyen Hue',
        country: 'VN',
      }),
    );
    expect(kafkaService.emit).toHaveBeenNthCalledWith(
      2,
      'category-snapshot.created',
      expect.objectContaining({
        event_id: 'category-snapshot.created:category-1:2026-05-11T00:00:00.000Z',
        event_type: 'CategorySnapshotCreated',
        occurred_at: new Date('2026-05-11T00:00:00.000Z'),
        id: 'category-1',
        name: 'Backend',
        updated_at: new Date('2026-05-11T00:00:00.000Z'),
      }),
    );
    expect(kafkaService.emit).toHaveBeenNthCalledWith(
      3,
      'category-snapshot.deleted',
      expect.objectContaining({
        event_id: expect.stringContaining('category-snapshot.deleted:category-1:'),
        event_type: 'CategorySnapshotDeleted',
        occurred_at: expect.any(Date),
        id: 'category-1',
        updated_at: expect.any(Date),
      }),
    );
  });
});
