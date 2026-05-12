import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { CategoryMutationTracker } from '../../application/ports/category-mutation-tracker.port';

@Injectable()
export class PrometheusCategoryMutationTracker implements CategoryMutationTracker {
  constructor(
    @InjectMetric('organization_mutations_total')
    private readonly organizationMutationsCounter: Counter<string>,
  ) {}

  trackCreate() {
    this.track('create');
  }

  trackUpdate() {
    this.track('update');
  }

  trackDelete() {
    this.track('delete');
  }

  private track(action: string) {
    this.organizationMutationsCounter.inc({
      service: 'organization-service',
      entity: 'category',
      action,
    });
  }
}
