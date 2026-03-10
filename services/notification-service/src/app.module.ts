import { JwtStrategy, RtStrategy } from '@/common/providers/passport';
import envConfig from '@/config/env.config';
import { DatabasesModule } from '@/modules/databases/databases.module';
import { EmailsModule } from '@/modules/emails/emails.module';
import { JobsModule } from '@/modules/jobs/jobs.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { MetricsModule } from '@/modules/observability/metrics.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt_secret'),
        signOptions: {
          expiresIn: configService.get('jwt_expiration_time'),
        },
      }),
    }),
    EmailsModule,
    DatabasesModule,
    JobsModule,
    NotificationsModule,
    MetricsModule,
  ],
  providers: [RtStrategy, JwtStrategy],
})
export class AppModule {}
