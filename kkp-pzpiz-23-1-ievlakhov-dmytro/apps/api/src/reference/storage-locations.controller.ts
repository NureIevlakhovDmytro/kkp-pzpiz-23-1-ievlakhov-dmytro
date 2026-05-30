import { Role } from '@app/shared';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../auth/decorators';
import { IncludeInactiveQuery } from '../common/crud/dto/reference.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateLocationDto, UpdateLocationDto } from './dto/storage-location.dto';
import { StorageLocationsService } from './storage-locations.service';

@ApiTags('storage-locations')
@ApiBearerAuth()
@Controller('storage-locations')
export class StorageLocationsController {
  constructor(private readonly svc: StorageLocationsService) {}

  @Get()
  list(@Query() page: PaginationQueryDto, @Query() inc: IncludeInactiveQuery) {
    return this.svc.list(page, inc.includeInactive);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.getById(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: CreateLocationDto) {
    return this.svc.create({ name: body.name, description: body.description ?? null });
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateLocationDto) {
    return this.svc.update(id, body);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async archive(@Param('id') id: string) {
    await this.svc.archive(id);
    return { status: 'archived' };
  }
}
