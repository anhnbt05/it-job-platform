import { notificationMockData } from '@/modules/databases/data/mocks';
import { Notifications } from '@/modules/notifications/entities';
import { DataSource } from 'typeorm';

export async function seedNotification(dataSource: DataSource) {
  const notificationRepo = dataSource.getRepository(Notifications);

  for (const mock of notificationMockData) {
    const { type, title } = mock;

    const existingNotif = await notificationRepo.findOne({
      where: {
        type,
      },
    });

    if (!existingNotif) {
      notificationRepo.save(
        notificationRepo.create({
          title,
          type,
        }),
      );
    }
  }
}
