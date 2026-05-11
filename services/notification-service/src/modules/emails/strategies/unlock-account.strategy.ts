import { EmailType } from '@/common/enums';
import { Injectable } from '@nestjs/common';
import { BaseEmailStrategy } from './base-email.strategy';

@Injectable()
export class UnlockAccountStrategy extends BaseEmailStrategy<{
  contactPhone: string;
  contactEmail: string;
}> {
  readonly type = EmailType.UNLOCK_ACCOUNT;

  protected buildSubject() {
    return 'Tài khoản của bạn đã được mở khóa';
  }

  protected buildText(
    to: string,
    payload: { contactPhone: string; contactEmail: string },
  ) {
    const { contactPhone, contactEmail } = payload;

    return `Tài khoản của bạn đã được mở khóa. Bạn có thể đăng nhập lại. Nếu cần hỗ trợ, vui lòng liên hệ ${contactPhone} hoặc ${contactEmail}.`;
  }

  protected buildHtml(
    to: string,
    payload: { contactPhone: string; contactEmail: string },
  ) {
    const { contactPhone, contactEmail } = payload;

    return `
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
      `;
  }
}
