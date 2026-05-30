import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentNumberService } from '../common/numbering/document-number.service';
import { BatchEntity } from '../entities/batch.entity';
import { InventoryCountEntity } from '../entities/inventory-count.entity';
import { InventoryCountLineEntity } from '../entities/inventory-count-line.entity';
import { StockAdjustmentEntity } from '../entities/stock-adjustment.entity';
import { StockAdjustmentLineEntity } from '../entities/stock-adjustment-line.entity';
import { StockLevelEntity } from '../entities/stock-level.entity';
import { StorageLocationEntity } from '../entities/storage-location.entity';
import { WriteOffReasonEntity } from '../entities/write-off-reason.entity';
import { StockModule } from '../stock/stock.module';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { StockAdjustmentsController } from './stock-adjustments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryCountEntity,
      InventoryCountLineEntity,
      StockAdjustmentEntity,
      StockAdjustmentLineEntity,
      StockLevelEntity,
      StorageLocationEntity,
      BatchEntity,
      WriteOffReasonEntity,
    ]),
    StockModule,
  ],
  controllers: [InventoryController, StockAdjustmentsController],
  providers: [InventoryService, DocumentNumberService],
  exports: [InventoryService],
})
export class InventoryModule {}
