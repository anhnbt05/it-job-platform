import { JwtStrategy, RtStrategy } from '@/common/providers/passport';
import { MetricsModule } from '@/modules/observability/metrics.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PassportModule.register({
      session: true,
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt_secret'),
        signOptions: {
          expiresIn: configService.get('jwt_expiration_time'),
        },
      }),
    }),
    MetricsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, RtStrategy, JwtStrategy],
})
export class AuthModule {}
