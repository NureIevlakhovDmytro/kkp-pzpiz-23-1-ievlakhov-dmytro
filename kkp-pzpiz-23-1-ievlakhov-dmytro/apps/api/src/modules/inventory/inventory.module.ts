import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentNumberService } from '../../core/common/numbering/document-number.service';
import { BatchEntity } from '../../core/database/entities/batch.entity';
import { InventoryCountEntity } from '../../core/database/entities/inventory-count.entity';
import { InventoryCountLineEntity } from '../../core/database/entities/inventory-count-line.entity';
import { StockAdjustmentEntity } from '../../core/database/entities/stock-adjustment.entity';
import { StockAdjustmentLineEntity } from '../../core/database/entities/stock-adjustment-line.entity';
import { StockLevelEntity } from '../../core/database/entities/stock-level.entity';
import { StorageLocationEntity } from '../../core/database/entities/storage-location.entity';
import { WriteOffReasonEntity } from '../../core/database/entities/write-off-reason.entity';
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
