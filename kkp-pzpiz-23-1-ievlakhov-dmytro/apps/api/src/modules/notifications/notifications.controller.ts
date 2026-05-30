import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
import { NotificationService } from './notification.service';

class NotificationFilterDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined ? undefined : value === 'true' || value === '1' || value === true,
  )
  @IsBoolean()
  isRead?: boolean;
}

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationService) {}

  @Get()
  list(@Query() page: PaginationQueryDto, @Query() f: NotificationFilterDto) {
    return this.notifications.list(page, f.type, f.isRead);
  }

  @Patch('read-all')
  readAll() {
    return this.notifications.markAllRead();
  }

  @Patch(':id/read')
  read(@Param('id') id: string) {
    return this.notifications.markRead(id);
  }
}
