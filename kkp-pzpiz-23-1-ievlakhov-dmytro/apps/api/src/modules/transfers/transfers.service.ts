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
import { TransferDocumentEntity } from '../../core/database/entities/transfer-document.entity';
import { TransferLineEntity } from '../../core/database/entities/transfer-line.entity';
import { StockService } from '../stock/stock.service';
import { CreateTransferDto, TransferFilterDto } from './dto/transfer.dto';

@Injectable()
export class TransfersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly numbers: DocumentNumberService,
    private readonly stock: StockService,
    @InjectRepository(TransferDocumentEntity)
    private readonly docs: Repository<TransferDocumentEntity>,
  ) {}

  async post(
    dto: CreateTransferDto,
    userId: string,
    idempotencyKey?: string,
  ): Promise<TransferDocumentEntity> {
    if (dto.fromLocationId === dto.toLocationId) {
      throw new AppException(ErrorCode.VALIDATION, 'from and to locations must differ');
    }
    if (idempotencyKey) {
      const existing = await this.docs.findOne({
        where: { clientUuid: idempotencyKey },
        relations: { lines: true },
      });
      if (existing) return existing;
    }

    return this.dataSource.transaction(async (manager) => {
      await this.assertActiveLocation(manager, dto.fromLocationId);
      await this.assertActiveLocation(manager, dto.toLocationId);

      const number = await this.numbers.next(manager, 'transfer_number_seq', 'TRF');
      const docRepo = manager.getRepository(TransferDocumentEntity);
      const doc = await docRepo.save(
        docRepo.create({
          number,
          fromLocationId: dto.fromLocationId,
          toLocationId: dto.toLocationId,
          date: dto.date,
          userId,
          status: DocumentStatus.POSTED,
          reversesId: null,
          clientUuid: idempotencyKey ?? null,
        }),
      );

      for (const line of dto.lines) {
        const batch = await manager
          .getRepository(BatchEntity)
          .findOne({ where: { id: line.batchId } });
        if (!batch)
          throw new AppException(ErrorCode.NOT_FOUND, 'Batch not found', { batchId: line.batchId });
        const lineRepo = manager.getRepository(TransferLineEntity);
        await lineRepo.save(
          lineRepo.create({
            transferId: doc.id,
            batchId: line.batchId,
            quantity: line.quantity,
          }),
        );
        await this.stock.applyDelta(manager, line.batchId, dto.fromLocationId, -line.quantity);
        await this.stock.applyDelta(manager, line.batchId, dto.toLocationId, line.quantity);
      }

      return this.loadWithLines(manager.getRepository(TransferDocumentEntity), doc.id);
    });
  }

  async reverse(id: string, userId: string): Promise<TransferDocumentEntity> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(TransferDocumentEntity);
      const original = await repo.findOne({ where: { id }, relations: { lines: true } });
      if (!original) throw new AppException(ErrorCode.NOT_FOUND, 'Transfer not found');
      if (original.status === DocumentStatus.REVERSED) {
        throw new AppException(ErrorCode.CONFLICT, 'Transfer already reversed');
      }

      const number = await this.numbers.next(manager, 'transfer_number_seq', 'TRF');
      const reversal = await repo.save(
        repo.create({
          number,
          fromLocationId: original.fromLocationId,
          toLocationId: original.toLocationId,
          date: original.date,
          userId,
          status: DocumentStatus.POSTED,
          reversesId: original.id,
          clientUuid: null,
        }),
      );

      const lineRepo = manager.getRepository(TransferLineEntity);
      for (const line of original.lines) {
        await lineRepo.save(
          lineRepo.create({
            transferId: reversal.id,
            batchId: line.batchId,
            quantity: line.quantity,
          }),
        );
        await this.stock.applyDelta(manager, line.batchId, original.toLocationId, -line.quantity);
        await this.stock.applyDelta(manager, line.batchId, original.fromLocationId, line.quantity);
      }

      original.status = DocumentStatus.REVERSED;
      await repo.save(original);
      return this.loadWithLines(repo, reversal.id);
    });
  }

  async list(q: PaginationQueryDto, f: TransferFilterDto) {
    const qb = this.docs
      .createQueryBuilder('t')
      .orderBy('t.date', 'DESC')
      .addOrderBy('t.created_at', 'DESC');
    if (f.from) qb.andWhere('t.date >= :from', { from: f.from });
    if (f.to) qb.andWhere('t.date <= :to', { to: f.to });
    if (f.locationId)
      qb.andWhere('(t.from_location_id = :loc OR t.to_location_id = :loc)', { loc: f.locationId });
    if (f.status) qb.andWhere('t.status = :status', { status: f.status });
    qb.skip((q.page - 1) * q.limit).take(q.limit);
    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, q);
  }

  getById(id: string): Promise<TransferDocumentEntity> {
    return this.loadWithLines(this.docs, id);
  }

  private async loadWithLines(
    repo: Repository<TransferDocumentEntity>,
    id: string,
  ): Promise<TransferDocumentEntity> {
    const doc = await repo.findOne({ where: { id }, relations: { lines: true } });
    if (!doc) throw new AppException(ErrorCode.NOT_FOUND, 'Transfer not found');
    return doc;
  }

  private async assertActiveLocation(manager: EntityManager, locationId: string): Promise<void> {
    const location = await manager
      .getRepository(StorageLocationEntity)
      .findOne({ where: { id: locationId } });
    if (!location)
      throw new AppException(ErrorCode.NOT_FOUND, 'Location not found', { locationId });
    if (!location.isActive)
      throw new AppException(ErrorCode.BUSINESS_RULE, 'Location is archived', { locationId });
  }
}
