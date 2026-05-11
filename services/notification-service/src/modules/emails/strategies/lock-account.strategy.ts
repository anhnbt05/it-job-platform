import { EmailType } from '@/common/enums';
import { Injectable } from '@nestjs/common';
import { BaseEmailStrategy } from './base-email.strategy';

@Injectable()
export class LockAccountStrategy extends BaseEmailStrategy<{
  reason: string;
  contactPhone: string;
  contactEmail: string;
}> {
  readonly type = EmailType.LOCK_ACCOUNT;

  protected buildSubject() {
    return 'Tài khoản của bạn đã bị khóa';
  }

  protected buildText(
    to: string,
    payload: { reason: string; contactPhone: string; contactEmail: string },
  ) {
    const { reason, contactPhone, contactEmail } = payload;

    return `Tài khoản của bạn đã bị khóa. Lý do: ${reason}. Nếu cần hỗ trợ, vui lòng liên hệ ${contactPhone} hoặc ${contactEmail}.`;
  }

  protected buildHtml(
    to: string,
    payload: { reason: string; contactPhone: string; contactEmail: string },
  ) {
    const { reason, contactPhone, contactEmail } = payload;

    return `
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
      `;
  }
}
