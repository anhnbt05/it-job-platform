import { NotificationType } from '@/common/enums';
import {
  generateNotificationContents,
  generateNotificationTitle,
} from '@/common/helpers';
import type { TUserSession } from '@/common/types';
import {
  CreateNotificationDto,
  DeleteUserNotificationsQueryDto,
  GetUserNotificationsQueryDto,
  MarkNotificationsAsReadDto,
} from '@/modules/notifications/dto';
import { UserNotifications } from '@/modules/notifications/entities';
import type {
  INotificationsRepository,
  IUserNotificationsRepository,
} from '@/modules/notifications/repositories';
import {
  NOTIFICATION_REPOSITORY_TOKEN,
  USER_NOTIFICATION_REPOSITORY_TOKEN,
} from '@/modules/notifications/repositories';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(USER_NOTIFICATION_REPOSITORY_TOKEN)
    private readonly userNotificationRepo: IUserNotificationsRepository,
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepo: INotificationsRepository,
  ) {}

  async deleteUserNotifications(
    query: DeleteUserNotificationsQueryDto,
    session: TUserSession,
  ) {
    const { ids } = query;
    return this.userNotificationRepo.deleleBulk(ids, session.id);
  }

  async getDetailUserNotification(id: string, session: TUserSession) {
    const detail = await this.userNotificationRepo.findById(id, {
      relations: {
        notification: true,
      },
    });

    if (!detail) {
      throw new NotFoundException('Không tìm thấy thông báo.');
    }

    const { id: userId } = session;

    if (detail.userId !== userId) {
      throw new ForbiddenException(
        'Bạn chỉ có thể xem chi tiết thông báo của mình.',
      );
    }

    if (!detail.isRead || !detail.readAt) {
      await this.userNotificationRepo.markNotificationsAsRead([id], userId);
    }

    return detail;
  }

  async markNotificationsAsRead(
    dto: MarkNotificationsAsReadDto,
    session: TUserSession,
  ) {
    const { id } = session;
    return this.userNotificationRepo.markNotificationsAsRead(dto.ids, id);
  }

  async getUserNotifications(
    getUserNotificationsQueryDto: GetUserNotificationsQueryDto,
    session: TUserSession,
  ) {
    const { id } = session;
    return this.userNotificationRepo.findAllOfUserWithQuery(
      getUserNotificationsQueryDto,
      id,
    );
  }

  async createNotification(dto: CreateNotificationDto) {
    const { type, userId, metadata } = dto;

    let existingNotification = await this.findNotificationByType(type);

    if (!existingNotification) {
      existingNotification = await this.createNewTypeOfNotification(
        type,
        generateNotificationTitle(type),
      );
    }

    const contents = generateNotificationContents(type, metadata);

    await this.createNewUserNotif({
      userId,
      contents,
      notification: existingNotification,
    });
  }

  private async findNotificationByType(type: NotificationType) {
    return this.notificationRepo.findByType(type);
  }

  private async createNewTypeOfNotification(
    type: NotificationType,
    title: string,
  ) {
    return this.notificationRepo.create({
      type,
      title,
    });
  }

  private async createNewUserNotif(data: Partial<UserNotifications>) {
    return this.userNotificationRepo.create(data);
  }
}
