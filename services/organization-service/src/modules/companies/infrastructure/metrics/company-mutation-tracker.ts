import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { CompanyMutationTracker } from '../../application/ports/company-mutation-tracker.port';

@Injectable()
export class PrometheusCompanyMutationTracker implements CompanyMutationTracker {
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
      entity: 'company',
      action,
    });
  }
}
