import envConfig from '@/config/env.config';
import { AuthModule } from '@/modules/auth/auth.module';
import { EmailsModule } from '@/modules/emails/emails.module';
import { KafkaModule } from '@/modules/kafka/kafka.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { UploadsModule } from '@/modules/uploads/uploads.module';
import { UsersModule } from '@/modules/users/users.module';
import { WorkExperiencesModule } from '@/modules/work-experiences/work-experiences.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    PrismaModule,
    AuthModule,
    WorkExperiencesModule,
    UsersModule,
    UploadsModule,
    EmailsModule,
    KafkaModule,
  ],
})
export class AppModule {}
