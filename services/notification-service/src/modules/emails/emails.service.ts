import { EmailType } from '@/common/enums';
import { SendEmailDto } from '@/modules/emails/dto';
import { createEmailTransporter } from '@/modules/emails/factories';
import {
  EmailStrategy,
  PasswordResetOtpStrategy,
  VerificationOtpStrategy,
  WelcomeStrategy,
} from '@/modules/emails/strategies';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = createEmailTransporter(configService);
  }

  async send(dto: SendEmailDto): Promise<void> {
    const from =
      this.configService.get<string>('mail_from') ??
      this.configService.get<string>('mail_user');

    const strategy = this.getStrategy(dto.type);

    const { subject, text, html } = strategy.build(dto.to, dto.payload);

    try {
      await this.transporter.sendMail({
        from,
        to: dto.to,
        subject,
        text,
        html,
      });
    } catch (error) {
      this.logger.error('Gửi email thất bại: ', error as Error);
      throw error;
    }
  }

  private getStrategy(type: EmailType): EmailStrategy {
    const strategies: Record<EmailType, EmailStrategy> = {
      [EmailType.VERIFICATION_OTP]: new VerificationOtpStrategy(),
      [EmailType.PASSWORD_RESET_OTP]: new PasswordResetOtpStrategy(),
      [EmailType.WELCOME]: new WelcomeStrategy(),
    };

    const strategy = strategies[type];

    if (!strategy) {
      throw new Error(`Loại email không được hỗ trợ: ${type}`);
    }

    return strategy;
  }
}
