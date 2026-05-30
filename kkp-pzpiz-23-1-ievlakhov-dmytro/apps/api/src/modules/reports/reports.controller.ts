import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { LossStructureQueryDto } from './dto/loss-structure.dto';
import { StockMovementQueryDto } from './dto/stock-movement.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('loss-structure')
  lossStructure(@Query() q: LossStructureQueryDto) {
    return this.reports.lossStructure(q.from, q.to);
  }

  @Get('inventory/:id')
  inventory(@Param('id') id: string) {
    return this.reports.inventoryReport(id);
  }

  @Get('stock-movement')
  stockMovement(@Query() q: StockMovementQueryDto) {
    return this.reports.stockMovement(q.from, q.to, q.productId, q.locationId);
  }
}
