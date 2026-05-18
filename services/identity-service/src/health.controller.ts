import { Public } from '@/common/decorators';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';

@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  @Public()
  async getHealth() {
    const timestamp = new Date().toISOString();

    try {
      await this.prismaService.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        service: 'identity-service',
        timestamp,
        dependencies: {
          database: 'ok',
        },
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        service: 'identity-service',
        timestamp,
        dependencies: {
          database: 'error',
        },
      });
    }
  }
}
