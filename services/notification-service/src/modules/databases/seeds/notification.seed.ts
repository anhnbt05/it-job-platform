import { NotificationType } from '@/common/enums';
import { notificationMockData } from '@/modules/databases/data/mocks';
import {
  Notifications,
  UserNotifications,
} from '@/modules/notifications/entities';
import { DataSource } from 'typeorm';

const ADMIN_USER_ID = '33333333-3333-3333-3333-333333333333';
const CANDIDATE_USER_ID = '44444444-4444-4444-4444-444444444444';
const RECRUITER_USER_ID = '66666666-6666-6666-6666-666666666666';

const USER_NOTIFICATIONS: Array<{
  id: string;
  userId: string;
  type: NotificationType;
  contents: string[];
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}> = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    userId: ADMIN_USER_ID,
    type: NotificationType.ADMIN_NEW_JOB_POST,
    contents: [
      'Tin tuyen dung "Senior Backend Engineer" vua duoc tao va dang cho duyet.',
      'Cong ty dang dang bai: Tech Corp Vietnam.',
      'Vui long kiem tra mo ta, muc luong va deadline truoc khi phe duyet.',
    ],
    isRead: false,
    createdAt: new Date('2026-05-13T08:15:00+07:00'),
    metadata: {
      companyName: 'Tech Corp Vietnam',
      jobTitle: 'Senior Backend Engineer',
      source: 'seed-demo',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    userId: ADMIN_USER_ID,
    type: NotificationType.ADMIN_NEW_JOB_POST,
    contents: [
      'Tin tuyen dung "Frontend Team Lead" tu CloudVerse Labs da vao hang doi duyet.',
      'Trang jobs review hien da co du lieu cho luong duyet demo.',
    ],
    isRead: true,
    readAt: new Date('2026-05-12T16:00:00+07:00'),
    createdAt: new Date('2026-05-12T15:30:00+07:00'),
    metadata: {
      companyName: 'CloudVerse Labs',
      jobTitle: 'Frontend Team Lead',
      source: 'seed-demo',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    userId: CANDIDATE_USER_ID,
    type: NotificationType.CANDIDATE_APPLICATION_APPROVED,
    contents: [
      'Don ung tuyen cua ban cho vi tri "Backend Developer" da duoc chuyen sang vong phong van.',
      'Nha tuyen dung se lien he de hen lich trong 1-2 ngay lam viec toi.',
    ],
    isRead: false,
    createdAt: new Date('2026-05-13T09:00:00+07:00'),
    metadata: {
      companyName: 'Tech Corp Vietnam',
      jobTitle: 'Backend Developer',
      source: 'seed-demo',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    userId: CANDIDATE_USER_ID,
    type: NotificationType.CANDIDATE_APPLICATION_REJECTED,
    contents: [
      'Don ung tuyen cho vi tri "QA Engineer" chua phu hop o thoi diem hien tai.',
      'Ban van co the theo doi cac co hoi khac tu cung cong ty trong danh sach viec da luu.',
    ],
    isRead: true,
    readAt: new Date('2026-05-11T14:10:00+07:00'),
    createdAt: new Date('2026-05-11T13:50:00+07:00'),
    metadata: {
      companyName: 'ProductForge Asia',
      jobTitle: 'QA Engineer',
      source: 'seed-demo',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    userId: CANDIDATE_USER_ID,
    type: NotificationType.CANDIDATE_JOB_CLOSED,
    contents: [
      'Cong viec "Junior Fullstack Developer" ban tung ung tuyen da dong bai.',
      'Neu quan tam, ban co the mo danh sach viec de tim cac bai dang tuong tu.',
    ],
    isRead: false,
    createdAt: new Date('2026-05-10T18:20:00+07:00'),
    metadata: {
      companyName: 'NovaHR Solutions',
      jobTitle: 'Junior Fullstack Developer',
      source: 'seed-demo',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    userId: RECRUITER_USER_ID,
    type: NotificationType.RECRUITER_JOB_APPROVED,
    contents: [
      'Tin tuyen dung "Backend Developer" cua ban da duoc admin phe duyet.',
      'Bai dang da san sang hien thi tren candidate portal.',
    ],
    isRead: false,
    createdAt: new Date('2026-05-13T08:45:00+07:00'),
    metadata: {
      companyName: 'Tech Corp Vietnam',
      jobTitle: 'Backend Developer',
      source: 'seed-demo',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000007',
    userId: RECRUITER_USER_ID,
    type: NotificationType.RECRUITER_NEW_APPLICATION,
    contents: [
      'Co 1 ung vien moi vua nop CV vao bai "Senior Java Engineer".',
      'Ho so da kem CV va kinh nghiem de recruiter xem nhanh trong man candidates.',
    ],
    isRead: false,
    createdAt: new Date('2026-05-13T10:05:00+07:00'),
    metadata: {
      companyName: 'Tech Corp Vietnam',
      jobTitle: 'Senior Java Engineer',
      source: 'seed-demo',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000008',
    userId: RECRUITER_USER_ID,
    type: NotificationType.RECRUITER_JOB_EXPIRING_SOON,
    contents: [
      'Tin "DevOps Engineer" se het han trong 48 gio toi.',
      'Ban nen cap nhat mo ta hoac gia han de tiep tuc nhan ho so.',
    ],
    isRead: true,
    readAt: new Date('2026-05-12T11:35:00+07:00'),
    createdAt: new Date('2026-05-12T11:20:00+07:00'),
    metadata: {
      companyName: 'Tech Corp Vietnam',
      jobTitle: 'DevOps Engineer',
      source: 'seed-demo',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000009',
    userId: RECRUITER_USER_ID,
    type: NotificationType.RECRUITER_JOB_REJECTED,
    contents: [
      'Tin "Intern Data Analyst" can bo sung muc luong va job requirement de duoc duyet lai.',
      'Man jobs review hien dang giu lai ly do tu choi de demo luong xu ly.',
    ],
    isRead: true,
    readAt: new Date('2026-05-09T17:40:00+07:00'),
    createdAt: new Date('2026-05-09T17:05:00+07:00'),
    metadata: {
      companyName: 'Tech Corp Vietnam',
      jobTitle: 'Intern Data Analyst',
      source: 'seed-demo',
    },
  },
];

export async function seedNotification(dataSource: DataSource) {
  const notificationRepo = dataSource.getRepository(Notifications);
  const userNotificationRepo = dataSource.getRepository(UserNotifications);

  for (const mock of notificationMockData) {
    const { type, title } = mock;

    const existingNotif = await notificationRepo.findOne({
      where: {
        type,
      },
    });

    if (!existingNotif) {
      await notificationRepo.save(
        notificationRepo.create({
          title,
          type,
        }),
      );
    }
  }

  for (const item of USER_NOTIFICATIONS) {
    const notification = await notificationRepo.findOne({
      where: {
        type: item.type,
      },
    });

    if (!notification) {
      throw new Error(`Notification type not found: ${item.type}`);
    }

    const existingUserNotification = await userNotificationRepo.findOne({
      where: {
        id: item.id,
      },
      relations: {
        notification: true,
      },
    });

    if (existingUserNotification) {
      userNotificationRepo.merge(existingUserNotification, {
        contents: item.contents,
        isRead: item.isRead,
        readAt: item.readAt,
        createdAt: item.createdAt,
        metadata: item.metadata,
        userId: item.userId,
        notification,
      });
      await userNotificationRepo.save(existingUserNotification);
      continue;
    }

    await userNotificationRepo.save(
      userNotificationRepo.create({
        id: item.id,
        contents: item.contents,
        isRead: item.isRead,
        readAt: item.readAt,
        createdAt: item.createdAt,
        metadata: item.metadata,
        userId: item.userId,
        notification,
      }),
    );
  }
}
