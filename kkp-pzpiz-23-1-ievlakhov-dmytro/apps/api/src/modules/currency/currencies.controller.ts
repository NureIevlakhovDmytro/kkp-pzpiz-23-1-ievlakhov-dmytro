import { Role } from '@app/shared';
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../core/auth/decorators';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto, UpdateCurrencyDto } from './dto/currency.dto';

@ApiTags('currencies')
@ApiBearerAuth()
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly svc: CurrenciesService) {}

  @Get()
  list(@Query() page: PaginationQueryDto) {
    return this.svc.list(page);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.getById(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: CreateCurrencyDto) {
    return this.svc.create(body);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateCurrencyDto) {
    return this.svc.update(id, body);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
