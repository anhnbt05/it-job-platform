import { Public } from '@/common/decorators';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get()
  @Public()
  async getHealth() {
    const timestamp = new Date().toISOString();

    try {
      await this.dataSource.query('SELECT 1');

      return {
        status: 'ok',
        service: 'notification-service',
        timestamp,
        dependencies: {
          database: 'ok',
        },
      };
    } catch {
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
}
