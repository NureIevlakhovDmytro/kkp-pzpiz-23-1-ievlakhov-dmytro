import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
import { BatchesService } from './batches.service';
import { BatchFilterDto, ExpiringQueryDto } from './dto/stock-query.dto';

@ApiTags('batches')
@ApiBearerAuth()
@Controller('batches')
export class BatchesController {
  constructor(private readonly batches: BatchesService) {}

  @Get()
  list(@Query() page: PaginationQueryDto, @Query() f: BatchFilterDto) {
    return this.batches.list(page, f);
  }

  @Get('expiring')
  expiring(@Query() q: ExpiringQueryDto) {
    return this.batches.expiring(q.days);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.batches.getById(id);
  }
}
