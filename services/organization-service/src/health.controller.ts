import { Public } from '@/common/decorators';
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  getHealth() {
    return {
      status: 'ok',
      service: 'organization-service',
      timestamp: new Date().toISOString(),
    };
  }
}
