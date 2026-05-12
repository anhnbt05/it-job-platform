import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { BranchMutationTracker } from '../../application/ports/branch-mutation-tracker.port';

@Injectable()
export class PrometheusBranchMutationTracker implements BranchMutationTracker {
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

  private track(action: string) {
    this.organizationMutationsCounter.inc({
      service: 'organization-service',
      entity: 'branch',
      action,
    });
  }
}
