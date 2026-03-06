import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const reflector = new Reflector();

  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  const configService = app.get(ConfigService);

  const PORT = process.env.PORT || configService.get<number>('port', 3001);

  await app.listen(PORT, () => {
    console.log(`Server is running at: 'http://localhost:${PORT}'`);
  });
}
bootstrap();
