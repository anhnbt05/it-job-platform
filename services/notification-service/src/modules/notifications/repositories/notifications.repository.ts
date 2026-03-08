import { NotificationType } from '@/common/enums';
import { BaseRepository } from '@/modules/databases/repositories';
import { Notifications } from '@/modules/notifications/entities';
import { INotificationsRepository } from '@/modules/notifications/repositories';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class NotificationsRepository
  extends BaseRepository<Notifications>
  implements INotificationsRepository
{
  constructor(
    @InjectRepository(Notifications)
    notificationRepo: Repository<Notifications>,
    @InjectDataSource()
    dataSource: DataSource,
  ) {
    super(notificationRepo, dataSource);
  }

  async findByType(type: NotificationType): Promise<Notifications | null> {
    return (
      (await this.repo.findOne({
        where: {
          type,
        },
      })) ?? null
    );
  }
}
