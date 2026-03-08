import { EmailStrategy } from './emails.strategy';

export class PasswordResetOtpStrategy implements EmailStrategy<{
  otp: string;
  expiresInMinutes: number;
}> {
  build(to: string, payload: { otp: string; expiresInMinutes: number }) {
    const { otp, expiresInMinutes } = payload;

    return {
      subject: 'Mã xác thực đặt lại mật khẩu',
      text: `Mã OTP đặt lại mật khẩu của bạn là ${otp}`,
      html: `
        <p>Xin chào,</p>
        <p>Mã OTP đặt lại mật khẩu của bạn:</p>
        <h2>${otp}</h2>
        <p>Có hiệu lực trong ${expiresInMinutes} phút</p>
      `,
    };
  }
}
