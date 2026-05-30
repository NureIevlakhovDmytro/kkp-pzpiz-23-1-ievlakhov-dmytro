import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BatchEntity } from '../../core/database/entities/batch.entity';
import { ProductEntity } from '../../core/database/entities/product.entity';
import { StockLevelEntity } from '../../core/database/entities/stock-level.entity';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [TypeOrmModule.forFeature([StockLevelEntity, BatchEntity, ProductEntity])],
  controllers: [StockController, BatchesController],
  providers: [StockService, BatchesService],
  exports: [StockService],
})
export class StockModule {}
