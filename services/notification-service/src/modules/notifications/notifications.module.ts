import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import {
  NOTIFICATION_REPOSITORY_TOKEN,
  NotificationsRepository,
  USER_NOTIFICATION_REPOSITORY_TOKEN,
  UserNotificationsRepository,
} from '@/modules/notifications/repositories';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Notifications,
  UserNotifications,
} from '@/modules/notifications/entities';
import { MetricsModule } from '@/modules/observability/metrics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserNotifications, Notifications]),
    MetricsModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    {
      provide: NOTIFICATION_REPOSITORY_TOKEN,
      useClass: NotificationsRepository,
    },
    {
      provide: USER_NOTIFICATION_REPOSITORY_TOKEN,
      useClass: UserNotificationsRepository,
    },
  ],
})
export class NotificationsModule {}
