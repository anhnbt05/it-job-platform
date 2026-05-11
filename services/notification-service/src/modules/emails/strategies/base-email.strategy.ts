import { EmailType } from '@/common/enums';
import { EmailContent, EmailStrategy } from './emails.strategy';

export abstract class BaseEmailStrategy<T = any> implements EmailStrategy<T> {
  abstract readonly type: EmailType;

  build(to: string, payload: T): EmailContent {
    return {
      subject: this.buildSubject(payload),
      text: this.buildText(to, payload),
      html: this.buildHtml(to, payload),
    };
  }

  protected abstract buildSubject(payload: T): string;

  protected abstract buildText(to: string, payload: T): string;

  protected abstract buildHtml(to: string, payload: T): string;
}
