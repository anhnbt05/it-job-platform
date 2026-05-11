import { EmailType } from '@/common/enums';
import { Injectable } from '@nestjs/common';
import { BaseEmailStrategy } from './base-email.strategy';

@Injectable()
export class PasswordResetOtpStrategy extends BaseEmailStrategy<{
  otp: string;
  expiresInMinutes: number;
}> {
  readonly type = EmailType.PASSWORD_RESET_OTP;

  protected buildSubject() {
    return 'Mã xác thực đặt lại mật khẩu';
  }

  protected buildText(
    to: string,
    payload: { otp: string; expiresInMinutes: number },
  ) {
    const { otp, expiresInMinutes } = payload;

    return `Mã OTP đặt lại mật khẩu của bạn là ${otp}. Mã có hiệu lực trong ${expiresInMinutes} phút.`;
  }

  protected buildHtml(
    to: string,
    payload: { otp: string; expiresInMinutes: number },
  ) {
    const { otp, expiresInMinutes } = payload;

    return `
        <p>Xin chào,</p>
        <p>Mã OTP đặt lại mật khẩu của bạn:</p>
        <h2>${otp}</h2>
        <p>Có hiệu lực trong ${expiresInMinutes} phút</p>
      `;
  }
}
