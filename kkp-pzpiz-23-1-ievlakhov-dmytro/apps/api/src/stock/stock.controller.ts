import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { FefoSuggestionQueryDto, StockQueryDto } from './dto/stock-query.dto';
import { StockService } from './stock.service';

@ApiTags('stock')
@ApiBearerAuth()
@Controller('stock')
export class StockController {
  constructor(private readonly stock: StockService) {}

  @Get()
  list(@Query() q: StockQueryDto) {
    return this.stock.listStock(q.productId, q.locationId, q.expired);
  }

  @Get('low')
  low() {
    return this.stock.lowStock();
  }

  @Get('fefo-suggestion')
  fefo(@Query() q: FefoSuggestionQueryDto) {
    return this.stock.fefoSuggestion(q.productId, q.locationId, q.quantity);
  }
}
