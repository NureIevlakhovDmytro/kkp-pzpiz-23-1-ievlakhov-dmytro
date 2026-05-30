import { Controller, Delete, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UsersService } from '../users/users.service';
import { CurrentUser, JwtUser } from './decorators';

@ApiTags('me')
@ApiBearerAuth()
@Controller('me')
export class MeController {
  constructor(private readonly users: UsersService) {}

  @Get('export')
  async export(@CurrentUser() user: JwtUser) {
    return this.users.exportData(await this.users.getUser(user.id));
  }

  @Delete()
  async erase(@CurrentUser() user: JwtUser) {
    await this.users.anonymize(user.id);
    return { status: 'erased' };
  }
}
