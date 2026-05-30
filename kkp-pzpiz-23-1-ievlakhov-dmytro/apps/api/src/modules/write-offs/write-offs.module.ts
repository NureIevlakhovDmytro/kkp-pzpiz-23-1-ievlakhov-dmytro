import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentNumberService } from '../../core/common/numbering/document-number.service';
import { WriteOffDocumentEntity } from '../../core/database/entities/write-off-document.entity';
import { WriteOffLineEntity } from '../../core/database/entities/write-off-line.entity';
import { StockModule } from '../stock/stock.module';
import { WriteOffsController } from './write-offs.controller';
import { WriteOffsService } from './write-offs.service';

@Module({
  imports: [TypeOrmModule.forFeature([WriteOffDocumentEntity, WriteOffLineEntity]), StockModule],
  controllers: [WriteOffsController],
  providers: [WriteOffsService, DocumentNumberService],
})
export class WriteOffsModule {}
