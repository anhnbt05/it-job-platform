import { NotificationType, RoleEnum } from '@/common/enums';
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
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(USER_NOTIFICATION_REPOSITORY_TOKEN)
    private readonly userNotificationRepo: IUserNotificationsRepository,
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepo: INotificationsRepository,
    @InjectMetric('notifications_created_total')
    private readonly notificationsCreatedCounter: Counter<string>,
    private readonly configService: ConfigService,
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
    const { type } = dto;
    const metadata = dto.metadata ?? {};
    const recipientUserIds = this.resolveRecipientUserIds(dto);

    if (recipientUserIds.length === 0) {
      this.logger.warn(
        `Skip notification ${type}: no recipient resolved from payload`,
      );
      return;
    }

    let existingNotification = await this.findNotificationByType(type);

    if (!existingNotification) {
      existingNotification = await this.createNewTypeOfNotification(
        type,
        generateNotificationTitle(type),
      );
    }

    const contents = generateNotificationContents(type, metadata);

    await Promise.all(
      recipientUserIds.map((userId) =>
        this.createNewUserNotif({
          userId,
          contents,
          metadata,
          notification: existingNotification,
        }),
      ),
    );

    this.notificationsCreatedCounter.inc(
      {
        service: 'notification-service',
        type,
      },
      recipientUserIds.length,
    );
  }

  private resolveRecipientUserIds(dto: CreateNotificationDto): string[] {
    const recipientUserIds = new Set<string>();

    if (dto.userId?.trim()) {
      recipientUserIds.add(dto.userId.trim());
    }

    for (const userId of dto.userIds ?? []) {
      if (userId?.trim()) {
        recipientUserIds.add(userId.trim());
      }
    }

    if (dto.recipientRole === RoleEnum.ADMIN) {
      for (const adminUserId of this.getAdminUserIds()) {
        recipientUserIds.add(adminUserId);
      }
    }

    return [...recipientUserIds];
  }

  private getAdminUserIds(): string[] {
    return this.configService
      .get<string>('notification.admin_user_ids', '')
      .split(',')
      .map((userId) => userId.trim())
      .filter(Boolean);
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
