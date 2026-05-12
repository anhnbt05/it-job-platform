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
    name: 'organization_mutations_total',
    help: 'Tổng số thao tác ghi trên dữ liệu tổ chức',
    labelNames: ['entity', 'action', 'service'],
  }),
];
