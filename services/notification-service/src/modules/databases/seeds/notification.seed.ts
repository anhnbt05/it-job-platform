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
const OPS_ADMIN_USER_ID = 'abababab-1111-2222-3333-444444444444';
const FRONTEND_CANDIDATE_USER_ID = '88888888-8888-8888-8888-888888888888';
const DATA_CANDIDATE_USER_ID = '12121212-3434-5656-7878-909090909090';
const MOBILE_CANDIDATE_USER_ID = '31313131-4242-5353-6464-757575757575';
const DESIGNER_CANDIDATE_USER_ID = '51515151-6262-7373-8484-959595959595';
const EXTRA_RECRUITER_USER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const CLOUD_RECRUITER_USER_ID = '72727272-8181-9191-a2a2-b3b3b3b3b3b3';
const PRODUCT_RECRUITER_USER_ID = '93939393-a4a4-b5b5-c6c6-d7d7d7d7d7d7';

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
  {
    id: '10000000-0000-4000-8000-000000000010',
    userId: OPS_ADMIN_USER_ID,
    type: NotificationType.ADMIN_NEW_JOB_POST,
    contents: [
      'Tin "Cloud Security Engineer" da vao hang doi duyet sau khi recruiter cap nhat requirement.',
      'Seed demo nay dung de hien thi luong kiem duyet bai dang moi tren admin dashboard.',
    ],
    isRead: false,
    createdAt: new Date('2026-05-14T09:20:00+07:00'),
    metadata: {
      companyName: 'GreenNode Systems',
      jobTitle: 'Cloud Security Engineer',
      source: 'seed-demo',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000011',
    userId: FRONTEND_CANDIDATE_USER_ID,
    type: NotificationType.CANDIDATE_APPLICATION_APPROVED,
    contents: [
      'Ban da duoc moi vao vong portfolio review cho vi tri "Frontend React Engineer".',
      'Vui long kiem tra email de xac nhan thoi gian phong van online.',
    ],
    isRead: false,
    createdAt: new Date('2026-05-14T10:40:00+07:00'),
    metadata: {
      companyName: 'ProductForge Asia',
      jobTitle: 'Frontend React Engineer',
      source: 'seed-demo',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000012',
    userId: DATA_CANDIDATE_USER_ID,
    type: NotificationType.CANDIDATE_APPLICATION_REJECTED,
    contents: [
      'Don ung tuyen "Product Data Analyst" chua phu hop do kinh nghiem dashboard con thieu.',
      'Ban co the nop lai cho vi tri Data Engineer hoac Site Reliability Engineer trong danh sach goi y.',
    ],
    isRead: true,
    readAt: new Date('2026-05-13T19:20:00+07:00'),
    createdAt: new Date('2026-05-13T18:55:00+07:00'),
    metadata: {
      companyName: 'CloudVerse Labs',
      jobTitle: 'Product Data Analyst',
      source: 'seed-demo',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000013',
    userId: MOBILE_CANDIDATE_USER_ID,
    type: NotificationType.CANDIDATE_JOB_CLOSED,
    contents: [
      'Tin "Solutions Architect" da dong bai sau khi ket thuc dot tuyen dung.',
      'He thong dang de xuat cac bai tuong tu nhu Site Reliability Engineer va Cloud Security Engineer.',
    ],
    isRead: false,
    createdAt: new Date('2026-05-14T08:10:00+07:00'),
    metadata: {
      companyName: 'FinStack Digital',
      jobTitle: 'Solutions Architect',
      source: 'seed-demo',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000014',
    userId: DESIGNER_CANDIDATE_USER_ID,
    type: NotificationType.CANDIDATE_APPLICATION_APPROVED,
    contents: [
      'Portfolio cua ban cho vi tri "Product Designer (UI/UX)" da qua vong screen dau tien.',
      'Recruiter se gui brief design challenge trong ngay mai.',
    ],
    isRead: true,
    readAt: new Date('2026-05-14T11:00:00+07:00'),
    createdAt: new Date('2026-05-14T10:15:00+07:00'),
    metadata: {
      companyName: 'ProductForge Asia',
      jobTitle: 'Product Designer (UI/UX)',
      source: 'seed-demo',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000015',
    userId: EXTRA_RECRUITER_USER_ID,
    type: NotificationType.RECRUITER_NEW_APPLICATION,
    contents: [
      'Co 2 ung vien moi vua nop CV vao bai "Customer Success Engineer".',
      'Dashboard recruiter hien da co du lieu de demo bang thong ke ho so moi trong ngay.',
    ],
    isRead: false,
    createdAt: new Date('2026-05-14T09:35:00+07:00'),
    metadata: {
      companyName: 'NovaHR Solutions',
      jobTitle: 'Customer Success Engineer',
      source: 'seed-demo',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000016',
    userId: CLOUD_RECRUITER_USER_ID,
    type: NotificationType.RECRUITER_JOB_EXPIRING_SOON,
    contents: [
      'Tin "Site Reliability Engineer" se het han trong 72 gio toi.',
      'Ban co the gia han them mot dot de tiep tuc nhan ung vien senior.',
    ],
    isRead: false,
    createdAt: new Date('2026-05-14T07:50:00+07:00'),
    metadata: {
      companyName: 'CloudVerse Labs',
      jobTitle: 'Site Reliability Engineer',
      source: 'seed-demo',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000017',
    userId: PRODUCT_RECRUITER_USER_ID,
    type: NotificationType.RECRUITER_JOB_APPROVED,
    contents: [
      'Tin "AI Product Manager" da duoc admin phe duyet va san sang hien thi tren candidate portal.',
      'Ban co the chay campaign sourcing ngay trong hom nay.',
    ],
    isRead: false,
    createdAt: new Date('2026-05-14T12:25:00+07:00'),
    metadata: {
      companyName: 'ProductForge Asia',
      jobTitle: 'AI Product Manager',
      source: 'seed-demo',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000018',
    userId: RECRUITER_USER_ID,
    type: NotificationType.RECRUITER_JOB_EXPIRED,
    contents: [
      'Tin "Full Stack Developer" da het han tuyen dung va duoc chuyen sang trang thai dong.',
      'Neu van can ung vien, ban co the sao chep bai dang va mo dot tuyen moi.',
    ],
    isRead: true,
    readAt: new Date('2026-05-13T09:15:00+07:00'),
    createdAt: new Date('2026-05-13T08:50:00+07:00'),
    metadata: {
      companyName: 'Tech Corp Vietnam',
      jobTitle: 'Full Stack Developer',
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
