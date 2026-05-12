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
    name: 'auth_events_total',
    help: 'Tổng số sự kiện xác thực nghiệp vụ',
    labelNames: ['action', 'outcome', 'service'],
  }),
];
