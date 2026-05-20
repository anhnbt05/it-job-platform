import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { GraphileWorkerModule } from 'nestjs-graphile-worker';
import { ConfigService } from '@nestjs/config';
import { EmailsController } from '@/modules/emails/emails.controller';
import { SendEmailTask } from '@/modules/jobs/tasks';
import { EmailsModule } from '@/modules/emails/emails.module';
import { MetricsModule } from '@/modules/observability/metrics.module';
import { graphileWorkerLogger } from './graphile-worker.logger';

@Module({
  imports: [
    EmailsModule,
    MetricsModule,
    GraphileWorkerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get<string>(
          'graphile_worker_database_url',
          '',
        );
        const schema = configService.get<string>(
          'graphile_worker_schema',
          'graphile_worker',
        );

        return {
          connectionString,
          schema,
          pollInterval: 1000,
          logger: graphileWorkerLogger,
        };
      },
    }),
  ],
  controllers: [EmailsController],
  providers: [JobsService, SendEmailTask],
  exports: [JobsService],
})
export class JobsModule {}
