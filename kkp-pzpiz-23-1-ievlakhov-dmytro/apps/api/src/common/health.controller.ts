import { Controller, Get, SetMetadata } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @SetMetadata('isPublic', true)
  @Get()
  check(): { status: string } {
    return { status: 'ok' };
  }
}
