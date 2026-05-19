import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const start = Date.now();
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const method = req.method;
    const path = req.originalUrl || req.url;
    const route = req.route?.path || req.originalUrl || req.url;
    const userId = req.user?.id ?? null;

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log({
            event: 'http_request',
            outcome: 'completed',
            method,
            path,
            route,
            status: res.statusCode,
            duration_ms: Date.now() - start,
            user_id: userId,
          });
        },
        error: (error) => {
          this.logger.error(
            {
              event: 'http_request',
              outcome: 'failed',
              method,
              path,
              route,
              status: error?.status ?? error?.statusCode ?? 500,
              duration_ms: Date.now() - start,
              user_id: userId,
              error_name: error?.name,
            },
            error?.stack,
            LoggingInterceptor.name,
          );
        },
      }),
    );
  }
}
