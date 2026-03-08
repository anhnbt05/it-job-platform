import { EmailType } from '@/common/enums';

export class SendEmailDto {
  constructor(
    public readonly to: string,
    public readonly type: EmailType,
    public readonly payload: Record<string, any>,
  ) {}
}
