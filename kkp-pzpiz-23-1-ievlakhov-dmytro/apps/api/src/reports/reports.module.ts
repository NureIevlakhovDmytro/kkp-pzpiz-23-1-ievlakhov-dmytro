import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CurrencyModule } from '../currency/currency.module';
import { BatchEntity } from '../entities/batch.entity';
import { InventoryCountEntity } from '../entities/inventory-count.entity';
import { StockAdjustmentEntity } from '../entities/stock-adjustment.entity';
import { WriteOffReasonEntity } from '../entities/write-off-reason.entity';
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
