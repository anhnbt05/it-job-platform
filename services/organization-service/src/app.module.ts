import { JwtStrategy, RtStrategy } from '@/common/providers/passport';
import envConfig from '@/config/env.config';
import { BranchesModule } from '@/modules/branches/branches.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { CompaniesModule } from '@/modules/companies/companies.module';
import { DatabasesModule } from '@/modules/databases/databases.module';
import { KafkaModule } from '@/modules/kafka/kafka.module';
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
    KafkaModule,
    CompaniesModule,
    DatabasesModule,
    BranchesModule,
    CategoriesModule,
    MetricsModule,
  ],
  providers: [RtStrategy, JwtStrategy],
})
export class AppModule {}
