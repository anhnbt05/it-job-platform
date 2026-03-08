import { SendEmailDto } from '@/modules/emails/dto';
import { Injectable } from '@nestjs/common';
import { WorkerService } from 'nestjs-graphile-worker';

@Injectable()
export class JobsService {
  constructor(private readonly workerService: WorkerService) {}

  async addJobSendEmail(dto: SendEmailDto) {
    await this.workerService.addJob('send-email', dto);
  }
}
