import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentNumberService } from '../common/numbering/document-number.service';
import { WriteOffDocumentEntity } from '../entities/write-off-document.entity';
import { WriteOffLineEntity } from '../entities/write-off-line.entity';
import { StockModule } from '../stock/stock.module';
import { WriteOffsController } from './write-offs.controller';
import { WriteOffsService } from './write-offs.service';

@Module({
  imports: [TypeOrmModule.forFeature([WriteOffDocumentEntity, WriteOffLineEntity]), StockModule],
  controllers: [WriteOffsController],
  providers: [WriteOffsService, DocumentNumberService],
})
export class WriteOffsModule {}
