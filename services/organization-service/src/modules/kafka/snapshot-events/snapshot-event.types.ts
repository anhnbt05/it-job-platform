export type SnapshotEventMessage<TPayload> = {
  topic: string;
  payload: TPayload;
};

export type CompanySnapshotPayload = {
  id: string;
  name: string;
  location: string;
  updated_at: Date;
  logo_url?: string;
};

export type BranchSnapshotPayload = {
  id: string;
  company_id: string;
  name: string;
  updated_at: Date;
  city?: string;
  country?: string;
  address?: string;
};

export type CategorySnapshotPayload = {
  id: string;
  name: string;
  updated_at: Date;
};

export type CategoryDeletedPayload = {
  id: string;
};
