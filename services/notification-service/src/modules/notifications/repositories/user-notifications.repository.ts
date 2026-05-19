import { BaseRepository } from '@/modules/databases/repositories';
import { GetUserNotificationsQueryDto } from '@/modules/notifications/dto';
import { UserNotifications } from '@/modules/notifications/entities';
import { IUserNotificationsRepository } from '@/modules/notifications/repositories';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class UserNotificationsRepository
  extends BaseRepository<UserNotifications>
  implements IUserNotificationsRepository
{
  constructor(
    @InjectRepository(UserNotifications)
    userNotificationRepo: Repository<UserNotifications>,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(userNotificationRepo, dataSource);
  }

  async deleleBulk(
    ids: string[],
    userId: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    if (ids.length === 0) {
      return {
        success: true,
        message: 'Không có thông báo nào cần xoá.',
      };
    }

    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .from(UserNotifications)
      .where('user_id = :userId', { userId })
      .andWhere('id IN (:...ids)', { ids })
      .execute();

    return {
      success: true,
      message: `Đã xoá thành công ${result.affected ?? 0} thông báo.`,
    };
  }

  async findAllOfUserWithQuery(
    query: GetUserNotificationsQueryDto,
    userId: string,
  ): Promise<UserNotifications[]> {
    const qb = this.repo
      .createQueryBuilder('userNotification')
      .leftJoinAndSelect('userNotification.notification', 'notification')
      .where('userNotification.userId = :userId', {
        userId,
      });

    if (query.isRead !== undefined) {
      qb.andWhere('userNotification.isRead = :isRead', {
        isRead: query.isRead,
      });
    }

    if (query.type) {
      qb.andWhere('notification.type = :type', {
        type: query.type,
      });
    }

    qb.orderBy('userNotification.createdAt', 'DESC');

    return qb.getMany();
  }

  async markNotificationsAsRead(
    ids: string[],
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    if (ids.length === 0) {
      return {
        success: true,
        message: 'Không có thông báo nào cần cập nhật.',
      };
    }

    const result = await this.repo
      .createQueryBuilder()
      .update(UserNotifications)
      .set({
        isRead: true,
        readAt: () => 'CURRENT_TIMESTAMP',
      } as any)
      .where('user_id = :userId', { userId })
      .andWhere('id IN (:...ids)', { ids })
      .andWhere('(is_read = false OR read_at IS NULL)')
      .execute();

    return {
      success: true,
      message: `Đã đánh dấu ${result.affected ?? 0} thông báo thành trạng thái đã đọc.`,
    };
  }
}
