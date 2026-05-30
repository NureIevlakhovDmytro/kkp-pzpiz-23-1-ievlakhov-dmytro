import { Role } from '@app/shared';
import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { Response } from 'express';

import { Roles } from '../../core/auth/decorators';
import { DataExchangeService } from './data-exchange.service';

class ExportQueryDto {
  @IsString() entity: string;
  @IsOptional() @IsIn(['json', 'csv']) format?: 'json' | 'csv';
}

class ImportBodyDto {
  @IsString() entity: string;
  @IsOptional() @IsIn(['json', 'csv']) format?: 'json' | 'csv';
  @IsString() payload: string;
}

@ApiTags('admin-data-exchange')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class DataExchangeController {
  constructor(private readonly exchange: DataExchangeService) {}

  @Get('export')
  async export(@Query() q: ExportQueryDto, @Res() res: Response) {
    const { contentType, body } = await this.exchange.export(q.entity, q.format ?? 'json');
    res.setHeader('Content-Type', contentType);
    res.send(body);
  }

  @Post('import')
  import(@Body() body: ImportBodyDto) {
    return this.exchange.import(body.entity, body.format ?? 'json', body.payload);
  }
}
