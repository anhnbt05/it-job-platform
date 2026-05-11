import { EmailType } from '@/common/enums';

export type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

export interface EmailStrategy<T = any> {
  readonly type: EmailType;
  build(to: string, payload: T): EmailContent;
}
