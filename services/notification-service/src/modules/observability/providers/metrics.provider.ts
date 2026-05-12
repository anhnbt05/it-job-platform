import {
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

export const metricsProviders = [
  makeCounterProvider({
    name: 'http_requests_total',
    help: 'Tổng số lượng HTTP request được xử lý bởi service',
    labelNames: ['method', 'route', 'status', 'service'],
  }),
  makeHistogramProvider({
    name: 'http_request_duration_seconds',
    help: 'Thời gian xử lý HTTP request (tính bằng giây)',
    labelNames: ['method', 'route', 'status', 'service'],
  }),
  makeCounterProvider({
    name: 'email_jobs_total',
    help: 'Tổng số job gửi email theo trạng thái xử lý',
    labelNames: ['type', 'status', 'service'],
  }),
  makeCounterProvider({
    name: 'notifications_created_total',
    help: 'Tổng số thông báo được tạo theo loại',
    labelNames: ['type', 'service'],
  }),
];
