export enum CompanySnapshotEvent {
  COMPANY_CREATED = 'company-snapshot.created',
  COMPANY_UPDATED = 'company-snapshot.updated',
  BRANCH_CREATED = 'branch-snapshot.created',
  BRANCH_UPDATED = 'branch-snapshot.updated',
}

export interface CompanySnapshotCommand<TPayload = unknown> {
  readonly event: CompanySnapshotEvent;
  execute(payload: TPayload): Promise<void>;
}
