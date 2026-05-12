export const COMPANY_MUTATION_TRACKER = 'COMPANY_MUTATION_TRACKER';

export interface CompanyMutationTracker {
  trackCreate(): void;
  trackUpdate(): void;
}
