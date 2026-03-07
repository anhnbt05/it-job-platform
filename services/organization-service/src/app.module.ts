import envConfig from '@/config/env.config';
import { BranchesModule } from '@/modules/branches/branches.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { CompaniesModule } from '@/modules/companies/companies.module';
import { DatabasesModule } from '@/modules/databases/databases.module';
import { KafkaModule } from '@/modules/kafka/kafka.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    KafkaModule,
    CompaniesModule,
    DatabasesModule,
    BranchesModule,
    CategoriesModule,
  ],
})
export class AppModule {}
