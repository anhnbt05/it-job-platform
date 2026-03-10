import { NotificationType } from '@/common/enums';

export const notificationMockData: Array<{
  title: string;
  type: NotificationType;
}> = [
  {
    title: 'Nhà tuyển dụng vừa đăng tin mới',
    type: NotificationType.ADMIN_NEW_JOB_POST,
  },
  {
    title: 'Đơn ứng tuyển của bạn đã được chấp nhận',
    type: NotificationType.CANDIDATE_APPLICATION_APPROVED,
  },
  {
    title: 'Đơn ứng tuyển của bạn đã bị từ chối',
    type: NotificationType.CANDIDATE_APPLICATION_REJECTED,
  },
  {
    title: 'Tin tuyển dụng của bạn đã được duyệt',
    type: NotificationType.RECRUITER_JOB_APPROVED,
  },
  {
    title: 'Tin tuyển dụng của bạn đã bị từ chối',
    type: NotificationType.RECRUITER_JOB_REJECTED,
  },
  {
    title: 'Có ứng viên mới ứng tuyển bài đăng của bạn',
    type: NotificationType.RECRUITER_NEW_APPLICATION,
  },
  {
    title: 'Tin tuyển dụng của bạn sắp hết hạn',
    type: NotificationType.RECRUITER_JOB_EXPIRING_SOON,
  },
  {
    title: 'Tin tuyển dụng của bạn đã hết hạn',
    type: NotificationType.RECRUITER_JOB_EXPIRED,
  },
  {
    title: 'Công việc bạn đã ứng tuyển hiện không còn hoạt động',
    type: NotificationType.CANDIDATE_JOB_CLOSED,
  },
];
