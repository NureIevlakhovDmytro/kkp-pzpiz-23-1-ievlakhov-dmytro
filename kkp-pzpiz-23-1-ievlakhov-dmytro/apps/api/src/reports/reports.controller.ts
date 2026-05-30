import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

import { ReportsService } from './reports.service';

class LossStructureQueryDto {
  @IsDateString() from: string;
  @IsDateString() to: string;
}

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
}
