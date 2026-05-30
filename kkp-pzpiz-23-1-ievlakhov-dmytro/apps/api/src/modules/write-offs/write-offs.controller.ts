import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser, JwtUser } from '../../core/auth/decorators';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
import { CreateWriteOffDto, WriteOffFilterDto } from './dto/write-off.dto';
import { WriteOffsService } from './write-offs.service';

@ApiTags('write-offs')
@ApiBearerAuth()
@Controller('write-offs')
export class WriteOffsController {
  constructor(private readonly writeOffs: WriteOffsService) {}

  @Post()
  post(
    @Body() body: CreateWriteOffDto,
    @CurrentUser() user: JwtUser,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ) {
    return this.writeOffs.post(body, user.id, idempotencyKey);
  }

  @Get()
  list(@Query() page: PaginationQueryDto, @Query() f: WriteOffFilterDto) {
    return this.writeOffs.list(page, f);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.writeOffs.getById(id);
  }

  @Post(':id/reverse')
  reverse(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.writeOffs.reverse(id, user.id);
  }
}
