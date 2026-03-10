import { MetricsInterceptor } from '@/modules/observability/interceptors';
import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { metricsProviders } from './providers/metrics.provider';

@Module({
  imports: [
    PrometheusModule.register({
      defaultLabels: {
        service: 'identity-service',
      },
    }),
  ],
  providers: [...metricsProviders, MetricsInterceptor],
  exports: [...metricsProviders, MetricsInterceptor],
})
export class MetricsModule {}
