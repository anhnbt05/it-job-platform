import envConfig from '@/config/env.config';
import { validateEnvConfig } from '@/config/env.validation';
import { HealthController } from '@/health.controller';
import { AuthModule } from '@/modules/auth/auth.module';
import { CompaniesModule } from '@/modules/companies/companies.module';
import { KafkaModule } from '@/modules/kafka/kafka.module';
import { MetricsModule } from '@/modules/observability/metrics.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { UploadsModule } from '@/modules/uploads/uploads.module';
import { UsersModule } from '@/modules/users/users.module';
import { WorkExperiencesModule } from '@/modules/work-experiences/work-experiences.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
      validate: validateEnvConfig,
    }),
    PrismaModule,
    AuthModule,
    WorkExperiencesModule,
    UsersModule,
    UploadsModule,
    KafkaModule,
    CompaniesModule,
    MetricsModule,
  ],
})
export class AppModule {}
