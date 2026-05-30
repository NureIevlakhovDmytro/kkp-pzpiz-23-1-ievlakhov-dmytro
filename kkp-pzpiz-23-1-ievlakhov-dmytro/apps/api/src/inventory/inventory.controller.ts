import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser, JwtUser } from '../auth/decorators';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateInventoryDto, InventoryFilterDto, PatchInventoryDto } from './dto/inventory.dto';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory-counts')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Post()
  create(@Body() body: CreateInventoryDto, @CurrentUser() user: JwtUser) {
    return this.inventory.create(body, user.id);
  }

  @Get()
  list(@Query() page: PaginationQueryDto, @Query() f: InventoryFilterDto) {
    return this.inventory.list(page, f.locationId, f.status);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.inventory.load(id);
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() body: PatchInventoryDto) {
    return this.inventory.patch(id, body);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.inventory.complete(id, user.id);
  }
}
