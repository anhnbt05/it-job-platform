import { AppModule } from '@/app.module';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { seedNotification } from './notification.seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  await seedNotification(dataSource);
  await app.close();
}

bootstrap();
