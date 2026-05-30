import { ErrorCode, InventoryStatus, WriteOffReasonCode } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { AppException } from '../common/api-exception';
import { paginate, PaginationQueryDto } from '../common/dto/pagination.dto';
import { DocumentNumberService } from '../common/numbering/document-number.service';
import { BatchEntity } from '../entities/batch.entity';
import { InventoryCountEntity } from '../entities/inventory-count.entity';
import { InventoryCountLineEntity } from '../entities/inventory-count-line.entity';
import { StockAdjustmentEntity } from '../entities/stock-adjustment.entity';
import { StockAdjustmentLineEntity } from '../entities/stock-adjustment-line.entity';
import { StockLevelEntity } from '../entities/stock-level.entity';
import { StorageLocationEntity } from '../entities/storage-location.entity';
import { WriteOffReasonEntity } from '../entities/write-off-reason.entity';
import { StockService } from '../stock/stock.service';
import { CreateInventoryDto, PatchInventoryDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly numbers: DocumentNumberService,
    private readonly stock: StockService,
    @InjectRepository(InventoryCountEntity) private readonly counts: Repository<InventoryCountEntity>,
    @InjectRepository(InventoryCountLineEntity) private readonly lines: Repository<InventoryCountLineEntity>,
    @InjectRepository(StockAdjustmentEntity) private readonly adjustments: Repository<StockAdjustmentEntity>,
  ) {}

  async create(dto: CreateInventoryDto, userId: string): Promise<InventoryCountEntity> {
    return this.dataSource.transaction(async (manager) => {
      const location = await manager.getRepository(StorageLocationEntity).findOne({ where: { id: dto.locationId } });
      if (!location) throw new AppException(ErrorCode.NOT_FOUND, 'Location not found');
      if (!location.isActive) throw new AppException(ErrorCode.BUSINESS_RULE, 'Location is archived');

      const open = await manager.getRepository(InventoryCountEntity).findOne({
        where: { locationId: dto.locationId, status: InventoryStatus.DRAFT },
      });
      if (open) throw new AppException(ErrorCode.CONFLICT, 'An open inventory already exists for this location', { inventoryId: open.id });

      const number = await this.numbers.next(manager, 'inventory_number_seq', 'INV');
      const count = await manager.getRepository(InventoryCountEntity).save(
        manager.getRepository(InventoryCountEntity).create({
          number,
          locationId: dto.locationId,
          date: dto.date,
          userId,
          status: InventoryStatus.DRAFT,
        }),
      );

      // Snapshot: every batch with positive stock at this location.
      const snapshot = await manager
        .getRepository(StockLevelEntity)
        .createQueryBuilder('s')
        .select(['s.batch_id AS "batchId"', 's.quantity AS "quantity"'])
        .where('s.location_id = :locationId', { locationId: dto.locationId })
        .andWhere('s.quantity > 0')
        .getRawMany<{ batchId: string; quantity: string }>();

      for (const row of snapshot) {
        await manager.getRepository(InventoryCountLineEntity).save(
          manager.getRepository(InventoryCountLineEntity).create({
            inventoryId: count.id,
            batchId: row.batchId,
            expectedQty: Number(row.quantity),
            actualQty: null,
            discrepancy: null,
          }),
        );
      }

      return this.loadInTx(manager, count.id);
    });
  }

  async patch(id: string, dto: PatchInventoryDto): Promise<InventoryCountEntity> {
    return this.dataSource.transaction(async (manager) => {
      const count = await manager.getRepository(InventoryCountEntity).findOne({ where: { id } });
      if (!count) throw new AppException(ErrorCode.NOT_FOUND, 'Inventory not found');
      if (count.status !== InventoryStatus.DRAFT) {
        throw new AppException(ErrorCode.CONFLICT, 'Inventory is not in DRAFT');
      }

      for (const entry of dto.counts) {
        const batch = await manager.getRepository(BatchEntity).findOne({ where: { id: entry.batchId } });
        if (!batch) throw new AppException(ErrorCode.NOT_FOUND, 'Batch not found', { batchId: entry.batchId });

        let line = await manager.getRepository(InventoryCountLineEntity).findOne({
          where: { inventoryId: id, batchId: entry.batchId },
        });
        if (!line) {
          // A batch found at the location but absent from the snapshot (e.g. a surplus): expected = current book qty (or 0).
          const level = await manager.getRepository(StockLevelEntity).findOne({ where: { batchId: entry.batchId, locationId: count.locationId } });
          const expected = level ? level.quantity : 0;
          line = manager.getRepository(InventoryCountLineEntity).create({
            inventoryId: id,
            batchId: entry.batchId,
            expectedQty: expected,
            actualQty: entry.actualQty,
            discrepancy: entry.actualQty - expected,
          });
        } else {
          line.actualQty = entry.actualQty;
          line.discrepancy = entry.actualQty - line.expectedQty;
        }
        await manager.getRepository(InventoryCountLineEntity).save(line);
      }

      return this.loadInTx(manager, id);
    });
  }

  async complete(id: string, userId: string): Promise<InventoryCountEntity> {
    return this.dataSource.transaction(async (manager) => {
      const count = await manager.getRepository(InventoryCountEntity).findOne({ where: { id }, relations: { lines: true } });
      if (!count) throw new AppException(ErrorCode.NOT_FOUND, 'Inventory not found');
      if (count.status !== InventoryStatus.DRAFT) {
        throw new AppException(ErrorCode.CONFLICT, 'Inventory already completed');
      }
      const uncounted = count.lines.filter((l) => l.actualQty === null);
      if (uncounted.length > 0) {
        throw new AppException(ErrorCode.CONFLICT, 'Some lines are not counted', { uncountedBatchIds: uncounted.map((l) => l.batchId) });
      }

      const shortageReason = await manager.getRepository(WriteOffReasonEntity).findOne({ where: { code: WriteOffReasonCode.SHORTAGE } });
      if (!shortageReason) throw new AppException(ErrorCode.NOT_FOUND, 'SHORTAGE reason not seeded');

      const number = await this.numbers.next(manager, 'adjustment_number_seq', 'ADJ');
      const adjustment = await manager.getRepository(StockAdjustmentEntity).save(
        manager.getRepository(StockAdjustmentEntity).create({
          number,
          date: count.date,
          userId,
          inventoryId: count.id,
          comment: null,
        }),
      );

      for (const line of count.lines) {
        const target = line.actualQty!;
        // Re-read current under lock and set to actual; appliedDelta = actual − current (NOT actual − expected_snapshot).
        const appliedDelta = await this.stock.setQuantity(manager, line.batchId, count.locationId, target);
        line.discrepancy = target - line.expectedQty; // analytical figure vs the snapshot
        await manager.getRepository(InventoryCountLineEntity).save(line);
        if (appliedDelta !== 0) {
          await manager.getRepository(StockAdjustmentLineEntity).save(
            manager.getRepository(StockAdjustmentLineEntity).create({
              adjustmentId: adjustment.id,
              batchId: line.batchId,
              locationId: count.locationId,
              delta: appliedDelta,
              reasonId: appliedDelta < 0 ? shortageReason.id : null,
            }),
          );
        }
      }

      count.status = InventoryStatus.COMPLETED;
      await manager.getRepository(InventoryCountEntity).save(count);
      return this.loadInTx(manager, count.id);
    });
  }

  async list(q: PaginationQueryDto, locationId?: string, status?: string) {
    const qb = this.counts.createQueryBuilder('i').orderBy('i.date', 'DESC').addOrderBy('i.created_at', 'DESC');
    if (locationId) qb.andWhere('i.location_id = :locationId', { locationId });
    if (status) qb.andWhere('i.status = :status', { status });
    qb.skip((q.page - 1) * q.limit).take(q.limit);
    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, q);
  }

  load(id: string): Promise<InventoryCountEntity> {
    return this.counts.findOne({ where: { id }, relations: { lines: true } }).then((c) => {
      if (!c) throw new AppException(ErrorCode.NOT_FOUND, 'Inventory not found');
      return c;
    });
  }

  private async loadInTx(manager: EntityManager, id: string): Promise<InventoryCountEntity> {
    const c = await manager.getRepository(InventoryCountEntity).findOne({ where: { id }, relations: { lines: true } });
    if (!c) throw new AppException(ErrorCode.NOT_FOUND, 'Inventory not found');
    return c;
  }

  async adjustmentByInventory(inventoryId: string): Promise<StockAdjustmentEntity | null> {
    return this.adjustments.findOne({ where: { inventoryId }, relations: { lines: true } });
  }

  getAdjustment(id: string): Promise<StockAdjustmentEntity> {
    return this.adjustments.findOne({ where: { id }, relations: { lines: true } }).then((a) => {
      if (!a) throw new AppException(ErrorCode.NOT_FOUND, 'Stock adjustment not found');
      return a;
    });
  }
}
