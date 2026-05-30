import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@app/shared';
import { Roles } from '../auth/decorators';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/settings.dto';

@ApiTags('admin-settings')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/settings')
export class SettingsController {
  constructor(private readonly svc: SettingsService) {}

  @Get()
  get() { return this.svc.get(); }

  @Patch()
  update(@Body() body: UpdateSettingsDto) { return this.svc.update(body); }
}
