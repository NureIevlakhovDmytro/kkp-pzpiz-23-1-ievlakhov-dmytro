import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser, JwtUser } from '../auth/decorators';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateReceiptDto, ReceiptFilterDto } from './dto/receipt.dto';
import { ReceiptsService } from './receipts.service';

@ApiTags('receipts')
@ApiBearerAuth()
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receipts: ReceiptsService) {}

  @Post()
  post(
    @Body() body: CreateReceiptDto,
    @CurrentUser() user: JwtUser,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ) {
    return this.receipts.post(body, user.id, idempotencyKey);
  }

  @Get()
  list(@Query() page: PaginationQueryDto, @Query() f: ReceiptFilterDto) {
    return this.receipts.list(page, f);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.receipts.getById(id);
  }

  @Post(':id/reverse')
  reverse(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.receipts.reverse(id, user.id);
  }
}
