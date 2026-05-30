import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { BatchesService } from './batches.service';
import { ExpiringQueryDto } from './dto/stock-query.dto';

class BatchFilterDto {
  @IsOptional() @IsUUID() productId?: string;
  @IsOptional() @IsUUID() supplierId?: string;
  @IsOptional() expiryFrom?: string;
  @IsOptional() expiryTo?: string;
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1' || value === true)
  @IsBoolean()
  expired?: boolean;
}

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
