import { IBaseRepository } from '@/modules/databases/repositories';
import { GetUserNotificationsQueryDto } from '@/modules/notifications/dto';
import { UserNotifications } from '@/modules/notifications/entities';

export interface IUserNotificationsRepository extends IBaseRepository<UserNotifications> {
  findAllOfUserWithQuery(
    query: GetUserNotificationsQueryDto,
    userId: string,
  ): Promise<UserNotifications[]>;
  markNotificationsAsRead(
    ids: string[],
    userId: string,
  ): Promise<{
    success: boolean;
    message: string;
  }>;
  deleleBulk(
    ids: string[],
    userId: string,
  ): Promise<{
    success: boolean;
    message: string;
  }>;
}

export const USER_NOTIFICATION_REPOSITORY_TOKEN = Symbol(
  'IUserNotificationRepository',
);
