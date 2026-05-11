import { WelcomePayload } from '@/common/types';
import { EmailType, RoleEnum } from '@/common/enums';
import { Injectable } from '@nestjs/common';
import { BaseEmailStrategy } from './base-email.strategy';

@Injectable()
export class WelcomeStrategy extends BaseEmailStrategy<WelcomePayload> {
  readonly type = EmailType.WELCOME;

  protected buildSubject(payload: WelcomePayload) {
    if (payload.role === RoleEnum.RECRUITER) {
      return 'Chào mừng bạn đến với nền tảng tuyển dụng IT';
    }

    return 'Chào mừng bạn đến với nền tảng việc làm IT';
  }

  protected buildText(to: string, payload: WelcomePayload) {
    const { name, role, loginUrl } = payload;
    const greeting = name ? `Xin chào ${name},` : 'Xin chào,';
    const url = loginUrl ?? 'https://your-it-job-platform.vn/login';

    if (role === RoleEnum.CANDIDATE) {
      return `
${greeting}

Chào mừng bạn đã tham gia nền tảng tìm việc dành cho lập trình viên tại Việt Nam.

Tại đây bạn có thể:
- Tìm kiếm việc làm IT phù hợp
- Khám phá các công ty công nghệ hàng đầu
- Nhận gợi ý việc làm phù hợp với kỹ năng

Đăng nhập tại: ${url}

Chúc bạn sớm tìm được công việc phù hợp!
        `;
    }

    if (role === RoleEnum.RECRUITER) {
      return `
${greeting}

Cảm ơn bạn đã đăng ký tài khoản nhà tuyển dụng.

Bạn có thể:
- Đăng tin tuyển dụng IT
- Tìm kiếm lập trình viên phù hợp
- Quản lý các ứng viên trong hệ thống

Đăng nhập tại: ${url}

Chúc bạn sớm tìm được ứng viên phù hợp!
        `;
    }

    return `${greeting}\n\nChào mừng bạn đến với nền tảng của chúng tôi.`;
  }

  protected buildHtml(to: string, payload: WelcomePayload) {
    const { name, role, loginUrl } = payload;
    const greeting = name ? `Xin chào ${name},` : 'Xin chào,';
    const url = loginUrl ?? 'https://your-it-job-platform.vn/login';

    if (role === RoleEnum.CANDIDATE) {
      return `
<p>${greeting}</p>

<p>Chào mừng bạn đến với <strong>nền tảng tìm việc dành cho lập trình viên tại Việt Nam</strong>.</p>

<p>Bạn có thể:</p>
<ul>
  <li>Tìm kiếm các vị trí IT phù hợp với kỹ năng</li>
  <li>Khám phá các công ty công nghệ hàng đầu</li>
  <li>Nhận gợi ý việc làm phù hợp với hồ sơ của bạn</li>
</ul>

<p>
  <a href="${url}" style="padding:10px 16px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">
    Bắt đầu tìm việc
  </a>
</p>

<p>Chúc bạn sớm tìm được công việc IT phù hợp!</p>
      `;
    }

    if (role === RoleEnum.RECRUITER) {
      return `
<p>${greeting}</p>

<p>Cảm ơn bạn đã đăng ký tài khoản <strong>Nhà tuyển dụng</strong> trên nền tảng tuyển dụng IT của chúng tôi.</p>

<p>Bạn có thể:</p>
<ul>
  <li>Đăng tin tuyển dụng IT</li>
  <li>Tìm kiếm và tiếp cận lập trình viên phù hợp</li>
  <li>Quản lý danh sách ứng viên</li>
</ul>

<p>
  <a href="${url}" style="padding:10px 16px;background:#16a34a;color:white;text-decoration:none;border-radius:6px;">
    Bắt đầu tuyển dụng
  </a>
</p>

<p>Chúc bạn sớm tìm được ứng viên phù hợp!</p>
      `;
    }

    return `<p>${greeting}</p><p>Chào mừng bạn đến với nền tảng của chúng tôi.</p>`;
  }
}
