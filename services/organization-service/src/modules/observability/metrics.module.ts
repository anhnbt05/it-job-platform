import {
  LoggingInterceptor,
  MetricsInterceptor,
} from '@/modules/observability/interceptors';
import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { metricsProviders } from './providers/metrics.provider';

@Module({
  imports: [
    PrometheusModule.register({
      defaultLabels: {
        service: 'organization-service',
      },
    }),
  ],
  providers: [...metricsProviders, MetricsInterceptor, LoggingInterceptor],
  exports: [...metricsProviders, MetricsInterceptor, LoggingInterceptor],
})
export class MetricsModule {}
