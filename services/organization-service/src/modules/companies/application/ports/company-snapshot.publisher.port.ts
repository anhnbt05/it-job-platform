import { Company } from '../../domain/company';

export const COMPANY_SNAPSHOT_PUBLISHER = 'COMPANY_SNAPSHOT_PUBLISHER';

export interface CompanySnapshotPublisher {
  publishCreated(company: Company): Promise<unknown> | unknown;
  publishUpdated(company: Company): Promise<unknown> | unknown;
}
