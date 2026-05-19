import '@/modules/observability/tracing/tracing';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { JsonConsoleLogger } from '@/common/providers/json-console.logger';
import { createKafkaConfig } from '@/config/kafka.config';
import {
  LoggingInterceptor,
  MetricsInterceptor,
} from '@/modules/observability/interceptors';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { WorkerService } from 'nestjs-graphile-worker';
import { AppModule } from './app.module';

function redactConnectionString(value: string) {
  try {
    const url = new URL(value);
    const database = url.pathname.replace(/^\//, '');

    return `${url.protocol}//${url.username || '<empty>'}:***@${url.hostname}:${url.port || '<default>'}/${database}`;
  } catch {
    return '<invalid>';
  }
}

function isSameConnectionTarget(left: string, right: string) {
  try {
    const leftUrl = new URL(left);
    const rightUrl = new URL(right);

    return (
      leftUrl.protocol === rightUrl.protocol &&
      leftUrl.hostname === rightUrl.hostname &&
      leftUrl.port === rightUrl.port &&
      leftUrl.username === rightUrl.username &&
      leftUrl.pathname === rightUrl.pathname
    );
  } catch {
    return left === right;
  }
}

async function bootstrap() {
  const logger = new JsonConsoleLogger('notification-service');
  const app = await NestFactory.create(AppModule, { logger });

  const reflector = new Reflector();

  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  app.useGlobalInterceptors(
    app.get(LoggingInterceptor),
    app.get(MetricsInterceptor),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const appDatabaseUrl = configService.get<string>('database_url', '');
  const workerDatabaseUrl = configService.get<string>(
    'graphile_worker_database_url',
    appDatabaseUrl,
  );
  const workerSchema = configService.get<string>(
    'graphile_worker_schema',
    'graphile_worker',
  );

  const PORT = process.env.PORT || configService.get<number>('port', 3003);

  app.connectMicroservice(createKafkaConfig(configService));

  await app.startAllMicroservices();

  logger.log(
    {
      event: 'worker_config',
      app_database: redactConnectionString(appDatabaseUrl),
      worker_database: redactConnectionString(workerDatabaseUrl),
      worker_schema: workerSchema,
      shared_database: isSameConnectionTarget(appDatabaseUrl, workerDatabaseUrl),
    },
    'Bootstrap',
  );

  await app.get(WorkerService).run();

  await app.listen(PORT);
  logger.log(
    `Server is running at: 'http://localhost:${PORT}'`,
    'Bootstrap',
  );
}
bootstrap();
