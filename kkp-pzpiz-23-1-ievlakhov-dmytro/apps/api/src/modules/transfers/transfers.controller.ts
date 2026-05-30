import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser, JwtUser } from '../../core/auth/decorators';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
import { CreateTransferDto, TransferFilterDto } from './dto/transfer.dto';
import { TransfersService } from './transfers.service';

@ApiTags('transfers')
@ApiBearerAuth()
@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfers: TransfersService) {}

  @Post()
  post(
    @Body() body: CreateTransferDto,
    @CurrentUser() user: JwtUser,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ) {
    return this.transfers.post(body, user.id, idempotencyKey);
  }

  @Get()
  list(@Query() page: PaginationQueryDto, @Query() f: TransferFilterDto) {
    return this.transfers.list(page, f);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.transfers.getById(id);
  }

  @Post(':id/reverse')
  reverse(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.transfers.reverse(id, user.id);
  }
}
