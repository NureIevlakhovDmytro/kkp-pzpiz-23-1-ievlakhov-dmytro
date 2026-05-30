import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BatchEntity } from '../../core/database/entities/batch.entity';
import { InventoryCountEntity } from '../../core/database/entities/inventory-count.entity';
import { StockAdjustmentEntity } from '../../core/database/entities/stock-adjustment.entity';
import { WriteOffReasonEntity } from '../../core/database/entities/write-off-reason.entity';
import { CurrencyModule } from '../currency/currency.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WriteOffReasonEntity,
      InventoryCountEntity,
      StockAdjustmentEntity,
      BatchEntity,
    ]),
    CurrencyModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
