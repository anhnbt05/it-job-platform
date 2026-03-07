import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { createKafkaConfig } from '@/config/kafka.config';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const reflector = new Reflector();

  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  const configService = app.get(ConfigService);

  const PORT = process.env.PORT || configService.get<number>('port', 3001);

  app.connectMicroservice(createKafkaConfig(configService));

  await app.startAllMicroservices();

  await app.listen(PORT, () => {
    console.log(`Server is running at: 'http://localhost:${PORT}'`);
  });
}
bootstrap();
