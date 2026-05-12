import { SendEmailDto } from '@/modules/emails/dto';
import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { WorkerService } from 'nestjs-graphile-worker';
import { Counter } from 'prom-client';

@Injectable()
export class JobsService {
  constructor(
    private readonly workerService: WorkerService,
    @InjectMetric('email_jobs_total')
    private readonly emailJobsCounter: Counter<string>,
  ) {}

  async addJobSendEmail(dto: SendEmailDto) {
    await this.workerService.addJob('send-email', dto);
    this.emailJobsCounter.inc({
      service: 'notification-service',
      type: dto.type,
      status: 'queued',
    });
  }
}
