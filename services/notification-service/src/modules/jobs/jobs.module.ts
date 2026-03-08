import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { GraphileWorkerModule } from 'nestjs-graphile-worker';
import { ConfigService } from '@nestjs/config';
import { SendEmailTask } from '@/modules/jobs/tasks';
import { EmailsService } from '@/modules/emails/emails.service';

@Module({
  imports: [
    GraphileWorkerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connectionString: configService.get<string>('database_url', ''),
        schema: 'graphile_worker',
        pollInterval: 1000,
      }),
    }),
  ],
  providers: [JobsService, SendEmailTask, EmailsService],
  exports: [JobsService],
})
export class JobsModule {}
