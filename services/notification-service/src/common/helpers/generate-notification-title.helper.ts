import { NotificationType } from '@/common/enums';

export const generateNotificationTitle = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.ADMIN_NEW_JOB_POST:
      return 'Nhà tuyển dụng vừa đăng tin mới';
    case NotificationType.CANDIDATE_APPLICATION_APPROVED:
      return 'Đơn ứng tuyển của bạn đã được chấp nhận';
    case NotificationType.CANDIDATE_APPLICATION_REJECTED:
      return 'Đơn ứng tuyển của bạn đã bị từ chối';
    case NotificationType.CANDIDATE_JOB_CLOSED:
      return 'Công việc bạn đã ứng tuyển hiện không còn hoạt động';
    case NotificationType.RECRUITER_JOB_APPROVED:
      return 'Tin tuyển dụng của bạn đã được duyệt';
    case NotificationType.RECRUITER_JOB_EXPIRED:
      return 'Tin tuyển dụng của bạn đã hết hạn';
    case NotificationType.RECRUITER_JOB_EXPIRING_SOON:
      return 'Tin tuyển dụng của bạn sắp hết hạn';
    case NotificationType.RECRUITER_JOB_REJECTED:
      return 'Tin tuyển dụng của bạn đã bị từ chối';
    case NotificationType.RECRUITER_NEW_APPLICATION:
      return 'Có ứng viên mới ứng tuyển bài đăng của bạn';
    case NotificationType.ADMIN_NEW_APPLICATION:
      return 'Có đơn ứng tuyển mới trong hệ thống';
    default: {
      return 'Thông báo mới';
    }
  }
};
