import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BatchEntity } from '../entities/batch.entity';
import { ProductEntity } from '../entities/product.entity';
import { StockLevelEntity } from '../entities/stock-level.entity';
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
