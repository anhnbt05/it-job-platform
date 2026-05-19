import { Public } from '@/common/decorators';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { URL } from 'url';

@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get()
  @Public()
  async getHealth() {
    const timestamp = new Date().toISOString();
    const workerSchema = this.configService.get<string>(
      'graphile_worker_schema',
      'graphile_worker',
    );
    const appDatabaseUrl = this.configService.get<string>('database_url', '');
    const workerDatabaseUrl = this.configService.get<string>(
      'graphile_worker_database_url',
      appDatabaseUrl,
    );
    const sharedWorkerDatabase = this.isSameConnectionTarget(
      appDatabaseUrl,
      workerDatabaseUrl,
    );

    try {
      await this.dataSource.query('SELECT 1');

      let graphileWorkerSchemaStatus:
        | 'ok'
        | 'missing'
        | 'not_checked' = 'not_checked';

      if (sharedWorkerDatabase) {
        const result = await this.dataSource.query(
          'SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = $1) AS exists',
          [workerSchema],
        );

        graphileWorkerSchemaStatus = result?.[0]?.exists ? 'ok' : 'missing';
      }

      if (graphileWorkerSchemaStatus === 'missing') {
        throw new ServiceUnavailableException({
          status: 'error',
          service: 'notification-service',
          timestamp,
          dependencies: {
            database: 'ok',
            graphile_worker: {
              database: 'shared',
              schema: 'missing',
              schema_name: workerSchema,
            },
          },
        });
      }

      return {
        status: 'ok',
        service: 'notification-service',
        timestamp,
        dependencies: {
          database: 'ok',
          graphile_worker: {
            database: sharedWorkerDatabase ? 'shared' : 'separate',
            schema: graphileWorkerSchemaStatus,
            schema_name: workerSchema,
          },
        },
      };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new ServiceUnavailableException({
        status: 'error',
        service: 'notification-service',
        timestamp,
        dependencies: {
          database: 'error',
        },
      });
    }
  }

  private isSameConnectionTarget(left: string, right: string) {
    try {
      const leftUrl = new URL(left);
      const rightUrl = new URL(right);

      return (
        leftUrl.protocol === rightUrl.protocol &&
        leftUrl.hostname === rightUrl.hostname &&
        leftUrl.port === rightUrl.port &&
        leftUrl.username === rightUrl.username &&
        leftUrl.pathname === rightUrl.pathname
      );
    } catch {
      return left === right;
    }
  }
}
