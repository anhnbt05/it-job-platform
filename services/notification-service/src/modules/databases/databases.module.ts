import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbPoolMax = configService.get<number>('db_pool_max', 10);
        const dbPoolIdleTimeoutMs = configService.get<number>(
          'db_pool_idle_timeout_ms',
          30000,
        );
        const dbPoolConnectionTimeoutMs = configService.get<number>(
          'db_pool_connection_timeout_ms',
          5000,
        );

        return {
          type: 'postgres',
          url: configService.get<string>('database_url', ''),
          autoLoadEntities: true,
          synchronize: false,
          migrations: [
            __dirname + '/src/modules/databases/migrations/*{.ts,.js}',
          ],
          migrationsRun: false,
          logging: false,
          retryAttempts: 10,
          retryDelay: 3000,
          namingStrategy: new SnakeNamingStrategy(),
          extra: {
            max: dbPoolMax,
            idleTimeoutMillis: dbPoolIdleTimeoutMs,
            connectionTimeoutMillis: dbPoolConnectionTimeoutMs,
            keepAlive: true,
          },
        };
      },
    }),
  ],
})
export class DatabasesModule {}
