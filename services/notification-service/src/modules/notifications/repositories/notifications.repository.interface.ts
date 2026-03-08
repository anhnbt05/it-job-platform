import { NotificationType } from '@/common/enums';
import { IBaseRepository } from '@/modules/databases/repositories';
import { Notifications } from '@/modules/notifications/entities';

export interface INotificationsRepository extends IBaseRepository<Notifications> {
  findByType(type: NotificationType): Promise<Notifications | null>;
}

export const NOTIFICATION_REPOSITORY_TOKEN = Symbol('INotificationRepository');
