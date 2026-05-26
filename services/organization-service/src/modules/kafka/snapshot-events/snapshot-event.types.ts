export type SnapshotEventMessage<TPayload> = {
  topic: string;
  payload: TPayload;
};

export type CompanySnapshotPayload = {
  event_id: string;
  event_type: string;
  occurred_at: Date;
  id: string;
  name: string;
  location: string;
  updated_at: Date;
  logo_url?: string;
};

export type BranchSnapshotPayload = {
  event_id: string;
  event_type: string;
  occurred_at: Date;
  id: string;
  company_id: string;
  name: string;
  updated_at: Date;
  city?: string;
  country?: string;
  address?: string;
};

export type CategorySnapshotPayload = {
  event_id: string;
  event_type: string;
  occurred_at: Date;
  id: string;
  name: string;
  updated_at: Date;
};

export type CategoryDeletedPayload = {
  event_id: string;
  event_type: string;
  occurred_at: Date;
  id: string;
  updated_at: Date;
};
