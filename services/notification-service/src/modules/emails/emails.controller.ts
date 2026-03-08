import { SendEmailDto } from '@/modules/emails/dto';
import { JobsService } from '@/modules/jobs/jobs.service';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class EmailsController {
  constructor(private readonly jobsService: JobsService) {}

  @EventPattern('email.send')
  async sendEmail(@Payload() payload: SendEmailDto) {
    return this.jobsService.addJobSendEmail(payload);
  }
}
