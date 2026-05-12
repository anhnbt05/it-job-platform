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
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new JsonConsoleLogger('organization-service');
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

  const PORT = process.env.PORT || configService.get<number>('port', 3002);

  app.connectMicroservice(createKafkaConfig(configService));

  await app.startAllMicroservices();

  await app.listen(PORT);
  logger.log(`Server is running at: 'http://localhost:${PORT}'`, 'Bootstrap');
}
bootstrap();
