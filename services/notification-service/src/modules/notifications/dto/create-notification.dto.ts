import { NotificationType } from '@/common/enums';

export class CreateNotificationDto {
  constructor(
    public readonly type: NotificationType,
    public readonly title: string,
    public readonly userId: string,
    public readonly metadata: Record<string, any>,
  ) {}
}
