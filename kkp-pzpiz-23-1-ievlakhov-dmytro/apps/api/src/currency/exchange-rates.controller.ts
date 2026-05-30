import { Role } from '@app/shared';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { Roles } from '../auth/decorators';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateExchangeRateDto, UpdateExchangeRateDto } from './dto/exchange-rate.dto';
import { ExchangeRatesService } from './exchange-rates.service';

class RateFilterDto {
  @IsOptional() @IsUUID() currencyId?: string;
}

@ApiTags('exchange-rates')
@ApiBearerAuth()
@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly svc: ExchangeRatesService) {}

  @Get()
  list(@Query() page: PaginationQueryDto, @Query() f: RateFilterDto) {
    return this.svc.list(page, f.currencyId);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: CreateExchangeRateDto) {
    return this.svc.create(body);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateExchangeRateDto) {
    return this.svc.update(id, body);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.svc.remove(id);
    return { status: 'deleted' };
  }
}
