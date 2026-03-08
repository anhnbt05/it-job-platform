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
    const validIds: string[] = [];

    for (const id of ids) {
      const un = await this.findById(id);
      if (un && un.userId === userId) validIds.push(id);
    }

    const result = await this.repo.delete({
      id: In(validIds),
    });

    return {
      success: true,
      message: `Đã xoá thành công ${result.affected} thông báo.`,
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
    let validIds: string[] = [];

    for (const id of ids) {
      const userNotif = await this.findById(id);
      if (userNotif && userNotif.userId === userId) validIds.push(id);
    }

    const result = await this.repo.update(
      {
        id: In(validIds),
      },
      {
        isRead: true,
      },
    );

    return {
      success: true,
      message: `Đã đánh dấu ${result.affected} thông báo thành trạng thái đã đọc.`,
    };
  }
}
