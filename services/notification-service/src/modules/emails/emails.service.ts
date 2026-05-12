import { SendEmailDto } from '@/modules/emails/dto';
import { EmailStrategyRegistry } from '@/modules/emails/email-strategy.registry';
import { createEmailTransporter } from '@/modules/emails/factories';
import { Injectable, Logger } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Counter } from 'prom-client';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly strategyRegistry: EmailStrategyRegistry,
    @InjectMetric('email_jobs_total')
    private readonly emailJobsCounter: Counter<string>,
  ) {
    this.transporter = createEmailTransporter(configService);
  }

  async send(dto: SendEmailDto): Promise<void> {
    const from =
      this.configService.get<string>('mail_from') ??
      this.configService.get<string>('mail_user');

    const strategy = this.strategyRegistry.get(dto.type);

    const { subject, text, html } = strategy.build(dto.to, dto.payload);

    try {
      await this.transporter.sendMail({
        from,
        to: dto.to,
        subject,
        text,
        html,
      });
      this.emailJobsCounter.inc({
        service: 'notification-service',
        type: dto.type,
        status: 'sent',
      });
    } catch (error) {
      this.emailJobsCounter.inc({
        service: 'notification-service',
        type: dto.type,
        status: 'failed',
      });
      this.logger.error('Gửi email thất bại: ', error as Error);
      throw error;
    }
  }
}
