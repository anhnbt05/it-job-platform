import { NotificationType } from '@/common/enums';
import { format } from 'date-fns';

export const generateNotificationContents = (
  type: NotificationType,
  metadata: Record<string, any>,
) => {
  switch (type) {
    case NotificationType.ADMIN_NEW_JOB_POST: {
      const createdAt = format(new Date(), 'dd/MM/yyyy hh:mm:ss a');

      return [
        `Bài tuyển dụng mới: ${metadata.jobTitle}`,
        `Tạo bởi: ${metadata.companyName || 'N/A'}`,
        `Vào lúc: ${createdAt}`,
      ];
    }

    case NotificationType.CANDIDATE_APPLICATION_APPROVED:
      return [
        `Chúc mừng! Đơn ứng tuyển của bạn cho công việc ${metadata.jobTitle || 'không rõ'} đã được chấp nhận.`,
        `Bạn sẽ sớm được liên hệ từ nhà tuyển dụng. Hãy kiểm tra email hoặc ứng dụng thường xuyên!`,
      ];

    case NotificationType.CANDIDATE_APPLICATION_REJECTED:
      return [
        `Rất tiếc! Đơn ứng tuyển của bạn cho công việc ${metadata.jobTitle || 'không rõ'} đã không được chọn.`,
        `Đừng nản lòng, bạn có thể tiếp tục tìm kiếm những cơ hội phù hợp khác trong hệ thống.`,
      ];

    case NotificationType.RECRUITER_JOB_APPROVED:
      return [
        `Bài đăng ${metadata.jobTitle || 'không rõ'} của bạn đã được quản trị viên duyệt.`,
        `Bài đăng sẽ bắt đầu hiển thị với ứng viên từ bây giờ.`,
      ];

    case NotificationType.RECRUITER_JOB_REJECTED:
      return [
        `Bài đăng ${metadata.jobTitle || 'không rõ'} của bạn đã bị quản trị viên từ chối.`,
        metadata.reason
          ? `Lý do từ chối: ${metadata.reason}`
          : `Vui lòng kiểm tra lại nội dung bài đăng và gửi lại.`,
      ];

    case NotificationType.RECRUITER_NEW_APPLICATION: {
      const createdAt = format(new Date(), 'dd/MM/yyyy hh:mm:ss a');

      return [
        `Ứng viên ${metadata.candidateName || 'N/A'} đã ứng tuyển vào công việc ${metadata.jobTitle || 'không rõ'}.`,
        `Vào lúc: ${createdAt}.`,
      ];
    }

    case NotificationType.ADMIN_NEW_APPLICATION: {
      const createdAt = format(new Date(), 'dd/MM/yyyy hh:mm:ss a');

      return [
        `Ứng viên ${metadata.candidateName || 'N/A'} vừa nộp đơn ứng tuyển vào công việc ${metadata.jobTitle || 'không rõ'}.`,
        `Vào lúc: ${createdAt}.`,
      ];
    }

    case NotificationType.RECRUITER_JOB_EXPIRING_SOON: {
      const expiredAtFormatted = metadata.jobExpiredAt
        ? format(new Date(metadata.jobExpiredAt as string), 'dd/MM/yyyy')
        : 'không xác định';

      return [
        `Công việc "${metadata.jobTitle || 'không rõ'}" của bạn sẽ hết hạn vào ngày ${expiredAtFormatted}.`,
        `Bạn có thể kéo dài thêm thời gian hết hạn hoặc đóng công việc lại nếu cần thiết.`,
      ];
    }

    case NotificationType.RECRUITER_JOB_EXPIRED: {
      return [
        `Công việc "${metadata.jobTitle || 'không rõ'}" của bạn đã bị đóng do hết hạn đăng tuyển.`,
        `Bạn có thể cân nhắc xoá công việc này nếu cần thiết.`,
      ];
    }

    case NotificationType.CANDIDATE_JOB_CLOSED: {
      return [
        `Công việc "${metadata.jobTitle || 'không rõ'}" mà bạn đã ứng tuyển hiện đã ngừng hiển thị do đã tuyển đủ số lượng ứng viên.`,
        `Bạn có thể khám phá thêm các công việc khác phù hợp trên hệ thống.`,
      ];
    }

    default:
      return [
        'Bạn có một thông báo mới, vui lòng kiểm tra để biết thêm chi tiết.',
      ];
  }
};
