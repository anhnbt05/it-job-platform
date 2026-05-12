export const CATEGORY_MUTATION_TRACKER = 'CATEGORY_MUTATION_TRACKER';

export interface CategoryMutationTracker {
  trackCreate(): void;
  trackUpdate(): void;
  trackDelete(): void;
}
