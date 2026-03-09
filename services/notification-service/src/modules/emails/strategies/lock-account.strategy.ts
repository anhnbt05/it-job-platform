import { EmailStrategy } from './emails.strategy';

export class LockAccountStrategy implements EmailStrategy<{
  reason: string;
  contactPhone: string;
  contactEmail: string;
}> {
  build(
    to: string,
    payload: { reason: string; contactPhone: string; contactEmail: string },
  ) {
    const { reason, contactPhone, contactEmail } = payload;

    return {
      subject: 'Tài khoản của bạn đã bị khóa',
      text: `Tài khoản của bạn đã bị khóa. Lý do: ${reason}. Nếu cần hỗ trợ, vui lòng liên hệ ${contactPhone} hoặc ${contactEmail}.`,
      html: `
        <p>Xin chào,</p>
        <p>Tài khoản của bạn hiện đã bị <strong>khóa</strong>.</p>
        
        <p>Lý do:</p>
        <p style="color: red; font-weight: bold;">
          ${reason}
        </p>

        <p>Nếu bạn cho rằng đây là nhầm lẫn hoặc cần hỗ trợ, vui lòng liên hệ:</p>
        <ul>
          <li>Số điện thoại: <strong>${contactPhone}</strong></li>
          <li>Email: <strong>${contactEmail}</strong></li>
        </ul>

        <p>Trân trọng.</p>
      `,
    };
  }
}
