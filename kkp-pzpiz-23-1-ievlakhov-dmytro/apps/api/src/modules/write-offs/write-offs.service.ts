import { DocumentStatus, ErrorCode } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { DataSource, Repository } from 'typeorm';

import { AppException } from '../../core/common/api-exception';
import { paginate, PaginationQueryDto } from '../../core/common/dto/pagination.dto';
import { DocumentNumberService } from '../../core/common/numbering/document-number.service';
import { BatchEntity } from '../../core/database/entities/batch.entity';
import { StorageLocationEntity } from '../../core/database/entities/storage-location.entity';
import { WriteOffDocumentEntity } from '../../core/database/entities/write-off-document.entity';
import { WriteOffLineEntity } from '../../core/database/entities/write-off-line.entity';
import { WriteOffReasonEntity } from '../../core/database/entities/write-off-reason.entity';
import { StockService } from '../stock/stock.service';
import { CreateWriteOffDto, WriteOffFilterDto } from './dto/write-off.dto';

@Injectable()
export class WriteOffsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly numbers: DocumentNumberService,
    private readonly stock: StockService,
    @InjectRepository(WriteOffDocumentEntity)
    private readonly docs: Repository<WriteOffDocumentEntity>,
  ) {}

  async post(
    dto: CreateWriteOffDto,
    userId: string,
    idempotencyKey?: string,
  ): Promise<WriteOffDocumentEntity> {
    if (idempotencyKey) {
      const existing = await this.docs.findOne({
        where: { clientUuid: idempotencyKey },
        relations: { lines: true },
      });
      if (existing) return existing;
    }

    return this.dataSource.transaction(async (manager) => {
      const reason = await manager
        .getRepository(WriteOffReasonEntity)
        .findOne({ where: { id: dto.reasonId } });
      if (!reason) throw new AppException(ErrorCode.NOT_FOUND, 'Write-off reason not found');

      const number = await this.numbers.next(manager, 'write_off_number_seq', 'WO');
      const doc = await manager.getRepository(WriteOffDocumentEntity).save(
        manager.getRepository(WriteOffDocumentEntity).create({
          number,
          date: dto.date,
          userId,
          reasonId: dto.reasonId,
          comment: dto.comment ?? null,
          status: DocumentStatus.POSTED,
          reversesId: null,
          clientUuid: idempotencyKey ?? null,
        }),
      );

      for (const line of dto.lines) {
        await this.assertBatchAndActiveLocation(manager, line.batchId, line.locationId);
        await manager.getRepository(WriteOffLineEntity).save(
          manager.getRepository(WriteOffLineEntity).create({
            writeOffId: doc.id,
            batchId: line.batchId,
            locationId: line.locationId,
            quantity: line.quantity,
          }),
        );
        // Remove stock; applyDelta throws CONFLICT(409) if it would go below zero.
        await this.stock.applyDelta(manager, line.batchId, line.locationId, -line.quantity);
      }

      return this.loadWithLines(manager.getRepository(WriteOffDocumentEntity), doc.id);
    });
  }

  async reverse(id: string, userId: string): Promise<WriteOffDocumentEntity> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(WriteOffDocumentEntity);
      const original = await repo.findOne({ where: { id }, relations: { lines: true } });
      if (!original) throw new AppException(ErrorCode.NOT_FOUND, 'Write-off not found');
      if (original.status === DocumentStatus.REVERSED) {
        throw new AppException(ErrorCode.CONFLICT, 'Write-off already reversed');
      }

      const number = await this.numbers.next(manager, 'write_off_number_seq', 'WO');
      const reversal = await repo.save(
        repo.create({
          number,
          date: original.date,
          userId,
          reasonId: original.reasonId,
          comment: `Reversal of ${original.number}`,
          status: DocumentStatus.POSTED,
          reversesId: original.id,
          clientUuid: null,
        }),
      );

      for (const line of original.lines) {
        await manager.getRepository(WriteOffLineEntity).save(
          manager.getRepository(WriteOffLineEntity).create({
            writeOffId: reversal.id,
            batchId: line.batchId,
            locationId: line.locationId,
            quantity: line.quantity,
          }),
        );
        // Put the written-off stock back.
        await this.stock.applyDelta(manager, line.batchId, line.locationId, line.quantity);
      }

      original.status = DocumentStatus.REVERSED;
      await repo.save(original);
      return this.loadWithLines(repo, reversal.id);
    });
  }

  async list(q: PaginationQueryDto, f: WriteOffFilterDto) {
    const qb = this.docs
      .createQueryBuilder('w')
      .orderBy('w.date', 'DESC')
      .addOrderBy('w.created_at', 'DESC');
    if (f.from) qb.andWhere('w.date >= :from', { from: f.from });
    if (f.to) qb.andWhere('w.date <= :to', { to: f.to });
    if (f.reasonId) qb.andWhere('w.reason_id = :reasonId', { reasonId: f.reasonId });
    if (f.status) qb.andWhere('w.status = :status', { status: f.status });
    qb.skip((q.page - 1) * q.limit).take(q.limit);
    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, q);
  }

  getById(id: string): Promise<WriteOffDocumentEntity> {
    return this.loadWithLines(this.docs, id);
  }

  private async loadWithLines(
    repo: Repository<WriteOffDocumentEntity>,
    id: string,
  ): Promise<WriteOffDocumentEntity> {
    const doc = await repo.findOne({ where: { id }, relations: { lines: true } });
    if (!doc) throw new AppException(ErrorCode.NOT_FOUND, 'Write-off not found');
    return doc;
  }

  private async assertBatchAndActiveLocation(
    manager: EntityManager,
    batchId: string,
    locationId: string,
  ): Promise<void> {
    const batch = await manager.getRepository(BatchEntity).findOne({ where: { id: batchId } });
    if (!batch) throw new AppException(ErrorCode.NOT_FOUND, 'Batch not found');
    const location = await manager
      .getRepository(StorageLocationEntity)
      .findOne({ where: { id: locationId } });
    if (!location) throw new AppException(ErrorCode.NOT_FOUND, 'Location not found');
    if (!location.isActive) throw new AppException(ErrorCode.BUSINESS_RULE, 'Location is archived');
  }
}
