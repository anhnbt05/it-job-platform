import { EmailStrategy } from './emails.strategy';

export class UnlockAccountStrategy implements EmailStrategy<{
  contactPhone: string;
  contactEmail: string;
}> {
  build(to: string, payload: { contactPhone: string; contactEmail: string }) {
    const { contactPhone, contactEmail } = payload;

    return {
      subject: 'Tài khoản của bạn đã được mở khóa',
      text: `Tài khoản của bạn đã được mở khóa. Bạn có thể đăng nhập lại. Nếu cần hỗ trợ, vui lòng liên hệ ${contactPhone} hoặc ${contactEmail}.`,
      html: `
        <p>Xin chào,</p>

        <p>
          Tài khoản của bạn đã được 
          <strong style="color: green;">mở khóa thành công</strong>.
        </p>

        <p>Bạn có thể đăng nhập và sử dụng hệ thống như bình thường.</p>

        <p>Nếu bạn không thực hiện yêu cầu này hoặc cần hỗ trợ, vui lòng liên hệ:</p>

        <ul>
          <li>Số điện thoại: <strong>${contactPhone}</strong></li>
          <li>Email: <strong>${contactEmail}</strong></li>
        </ul>

        <p>Trân trọng.</p>
      `,
    };
  }
}
