export const BRANCH_MUTATION_TRACKER = 'BRANCH_MUTATION_TRACKER';

export interface BranchMutationTracker {
  trackCreate(): void;
  trackUpdate(): void;
}
