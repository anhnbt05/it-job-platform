import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database_url', ''),
        autoLoadEntities: true,
        synchronize: false,
        migrations: [
          __dirname + '/src/modules/databases/migrations/*{.ts,.js}',
        ],
        migrationsRun: false,
        logging: false,
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
  ],
})
export class DatabasesModule {}
