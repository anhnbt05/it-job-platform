import { EmailType } from '@/common/enums';
import { Injectable } from '@nestjs/common';
import { BaseEmailStrategy } from './base-email.strategy';

@Injectable()
export class VerificationOtpStrategy extends BaseEmailStrategy<{
  otp: string;
  expiresInMinutes: number;
}> {
  readonly type = EmailType.VERIFICATION_OTP;

  protected buildSubject() {
    return 'Mã xác thực tài khoản của bạn';
  }

  protected buildText(
    to: string,
    payload: { otp: string; expiresInMinutes: number },
  ) {
    const { otp, expiresInMinutes } = payload;

    return `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong ${expiresInMinutes} phút.`;
  }

  protected buildHtml(
    to: string,
    payload: { otp: string; expiresInMinutes: number },
  ) {
    const { otp, expiresInMinutes } = payload;

    return `
        <p>Xin chào,</p>
        <p>Mã OTP xác thực tài khoản của bạn là:</p>
        <h2>${otp}</h2>
        <p>Mã có hiệu lực trong <strong>${expiresInMinutes} phút</strong>.</p>
      `;
  }
}
