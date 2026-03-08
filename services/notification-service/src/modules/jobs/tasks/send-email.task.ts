import { SendEmailDto } from '@/modules/emails/dto';
import { EmailsService } from '@/modules/emails/emails.service';
import { Injectable, Logger } from '@nestjs/common';
import { Task, TaskHandler } from 'nestjs-graphile-worker';

@Injectable()
@Task('send-email')
export class SendEmailTask {
  private readonly logger = new Logger(SendEmailTask.name);

  constructor(private readonly emailsService: EmailsService) {}

  @TaskHandler()
  async handler(payload: SendEmailDto) {
    this.logger.log(`Bắt đầu gửi email đến '${payload.to}'`);
    try {
      await this.emailsService.send(payload);
      this.logger.log(`Đã gửi email thành công tới '${payload.to}'`);
    } catch (error) {
      this.logger.error(
        `Gửi email đến '${payload.to}' thất bại: `,
        error?.stack || error,
      );
      throw error;
    }
  }
}
