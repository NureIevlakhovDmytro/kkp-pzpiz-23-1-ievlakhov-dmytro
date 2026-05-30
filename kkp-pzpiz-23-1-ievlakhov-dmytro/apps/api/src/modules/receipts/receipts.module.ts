import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentNumberService } from '../../core/common/numbering/document-number.service';
import { ReceiptDocumentEntity } from '../../core/database/entities/receipt-document.entity';
import { ReceiptLineEntity } from '../../core/database/entities/receipt-line.entity';
import { StockModule } from '../stock/stock.module';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReceiptDocumentEntity, ReceiptLineEntity]), StockModule],
  controllers: [ReceiptsController],
  providers: [ReceiptsService, DocumentNumberService],
})
export class ReceiptsModule {}
