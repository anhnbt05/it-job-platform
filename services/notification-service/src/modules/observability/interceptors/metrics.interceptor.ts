import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram, Counter } from 'prom-client';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly service = 'notification-service';

  constructor(
    @InjectMetric('http_requests_total')
    private readonly requestCounter: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly requestDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const method = req.method;
    const route = req.route?.path || req.url;

    return next.handle().pipe(
      tap(() => {
        const status = res.statusCode.toString();
        const duration = (Date.now() - start) / 1000;

        this.requestCounter.inc({
          service: this.service,
          method,
          route,
          status,
        });

        this.requestDuration.observe(
          {
            service: this.service,
            method,
            route,
            status,
          },
          duration,
        );
      }),
    );
  }
}
