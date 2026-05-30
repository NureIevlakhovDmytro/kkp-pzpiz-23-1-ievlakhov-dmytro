import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { InventoryService } from './inventory.service';

@ApiTags('stock-adjustments')
@ApiBearerAuth()
@Controller('stock-adjustments')
export class StockAdjustmentsController {
  constructor(private readonly inventory: InventoryService) {}

  @Get(':id')
  get(@Param('id') id: string) {
    return this.inventory.getAdjustment(id);
  }
}
