import { UserSession } from '@/common/decorators';
import type { TUserSession } from '@/common/types';
import {
  CreateNotificationDto,
  DeleteUserNotificationsQueryDto,
  GetUserNotificationsQueryDto,
  MarkNotificationsAsReadDto,
} from '@/modules/notifications/dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('notification.create')
  async createNotification(@Payload() payload: CreateNotificationDto) {
    return this.notificationsService.createNotification(payload);
  }

  @Get()
  async getUserNotifications(
    @Query() getUserNotificationsQueryDto: GetUserNotificationsQueryDto,
    @UserSession() session: TUserSession,
  ) {
    return this.notificationsService.getUserNotifications(
      getUserNotificationsQueryDto,
      session,
    );
  }

  @Patch('mark-as-read')
  async markNotificationsAsRead(
    @Body() dto: MarkNotificationsAsReadDto,
    @UserSession() session: TUserSession,
  ) {
    return this.notificationsService.markNotificationsAsRead(dto, session);
  }

  @Get(':id')
  async getDetailUserNotification(
    @Param('id', ParseUUIDPipe) id: string,
    @UserSession() session: TUserSession,
  ) {
    return this.notificationsService.getDetailUserNotification(id, session);
  }

  @Delete()
  async deleteUserNotifications(
    @Query() query: DeleteUserNotificationsQueryDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.notificationsService.deleteUserNotifications(
      query,
      userSession,
    );
  }
}
