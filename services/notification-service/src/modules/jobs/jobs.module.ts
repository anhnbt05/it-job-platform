import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { GraphileWorkerModule } from 'nestjs-graphile-worker';
import { ConfigService } from '@nestjs/config';
import { SendEmailTask } from '@/modules/jobs/tasks';
import { EmailsModule } from '@/modules/emails/emails.module';
import { MetricsModule } from '@/modules/observability/metrics.module';

@Module({
  imports: [
    EmailsModule,
    MetricsModule,
    GraphileWorkerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connectionString: configService.get<string>('database_url', ''),
        schema: 'graphile_worker',
        pollInterval: 1000,
      }),
    }),
  ],
  providers: [JobsService, SendEmailTask],
  exports: [JobsService],
})
export class JobsModule {}
