import { Role } from '@app/shared';
import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../core/auth/decorators';
import { BackupService } from './backup.service';

@ApiTags('admin-backup')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/backup')
export class BackupController {
  constructor(private readonly backup: BackupService) {}

  @Post()
  create() {
    return this.backup.createBackup();
  }
}
