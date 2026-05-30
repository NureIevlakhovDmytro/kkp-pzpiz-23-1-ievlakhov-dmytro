import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentNumberService } from '../../core/common/numbering/document-number.service';
import { TransferDocumentEntity } from '../../core/database/entities/transfer-document.entity';
import { TransferLineEntity } from '../../core/database/entities/transfer-line.entity';
import { StockModule } from '../stock/stock.module';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransferDocumentEntity, TransferLineEntity]), StockModule],
  controllers: [TransfersController],
  providers: [TransfersService, DocumentNumberService],
})
export class TransfersModule {}
