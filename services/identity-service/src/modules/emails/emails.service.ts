import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail_host'),
      port: Number(this.configService.get<number>('mail_port') ?? 587),
      secure: this.configService.get<string>('mail_secure') === 'true',
      auth: {
        user: this.configService.get<string>('mail_user'),
        pass: this.configService.get<string>('mail_pass'),
      },
    });
  }

  async sendVerificationOtpEmail(
    to: string,
    otp: string,
    expiresInMinutes: number,
  ): Promise<void> {
    const from =
      this.configService.get<string>('mail_from') ??
      this.configService.get<string>('mail_user');

    const subject = 'Mã xác thực tài khoản của bạn';
    const text = `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong ${expiresInMinutes} phút. Vui lòng không chia sẻ mã này với bất kỳ ai.`;
    const html = `
      <p>Xin chào,</p>
      <p>Mã OTP xác thực tài khoản của bạn là:</p>
      <h2>${otp}</h2>
      <p>Mã có hiệu lực trong <strong>${expiresInMinutes} phút</strong>.</p>
      <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
    `;

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      this.logger.error('Gửi email xác thực thất bại', error as Error);
      throw error;
    }
  }

  async sendPasswordResetOtpEmail(
    to: string,
    otp: string,
    expiresInMinutes: number,
  ): Promise<void> {
    const from =
      this.configService.get<string>('mail_from') ??
      this.configService.get<string>('mail_user');

    const subject = 'Mã xác thực đặt lại mật khẩu';
    const text = `Mã OTP đặt lại mật khẩu của bạn là: ${otp}. Mã có hiệu lực trong ${expiresInMinutes} phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.`;
    const html = `
      <p>Xin chào,</p>
      <p>Mã OTP đặt lại mật khẩu của bạn là:</p>
      <h2>${otp}</h2>
      <p>Mã có hiệu lực trong <strong>${expiresInMinutes} phút</strong>.</p>
      <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
    `;

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      this.logger.error(
        'Gửi email OTP đặt lại mật khẩu thất bại',
        error as Error,
      );
      throw error;
    }
  }
}
