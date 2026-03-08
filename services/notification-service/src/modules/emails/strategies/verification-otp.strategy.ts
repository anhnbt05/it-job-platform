import { EmailStrategy } from './emails.strategy';

export class VerificationOtpStrategy implements EmailStrategy<{
  otp: string;
  expiresInMinutes: number;
}> {
  build(to: string, payload: { otp: string; expiresInMinutes: number }) {
    const { otp, expiresInMinutes } = payload;

    return {
      subject: 'Mã xác thực tài khoản của bạn',
      text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong ${expiresInMinutes} phút.`,
      html: `
        <p>Xin chào,</p>
        <p>Mã OTP xác thực tài khoản của bạn là:</p>
        <h2>${otp}</h2>
        <p>Mã có hiệu lực trong <strong>${expiresInMinutes} phút</strong>.</p>
      `,
    };
  }
}
