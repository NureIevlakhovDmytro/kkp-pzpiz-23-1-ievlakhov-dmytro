import { ErrorCode, FefoSuggestionDto, LowStockDto, StockLevelDto } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { Repository } from 'typeorm';

import { AppException } from '../common/api-exception';
import { BatchEntity } from '../entities/batch.entity';
import { ProductEntity } from '../entities/product.entity';
import { StockLevelEntity } from '../entities/stock-level.entity';
import { allocateFefo, FefoBatch } from './fefo';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockLevelEntity) private readonly stock: Repository<StockLevelEntity>,
    @InjectRepository(BatchEntity) private readonly batches: Repository<BatchEntity>,
    @InjectRepository(ProductEntity) private readonly products: Repository<ProductEntity>,
  ) {}

  /** Apply a signed delta to a (batch, location) stock row inside a transaction, under a row lock. Enforces quantity >= 0. */
  async applyDelta(manager: EntityManager, batchId: string, locationId: string, delta: number): Promise<void> {
    const repo = manager.getRepository(StockLevelEntity);
    let level = await repo.findOne({ where: { batchId, locationId }, lock: { mode: 'pessimistic_write' } });
    if (!level) {
      if (delta < 0) {
        throw new AppException(ErrorCode.CONFLICT, 'Insufficient stock', { batchId, locationId, available: 0, requested: -delta });
      }
      level = repo.create({ batchId, locationId, quantity: 0 });
    }
    const next = level.quantity + delta;
    if (next < 0) {
      throw new AppException(ErrorCode.CONFLICT, 'Insufficient stock', { batchId, locationId, available: level.quantity, requested: -delta });
    }
    level.quantity = next;
    await repo.save(level);
  }

  /** Set a (batch, location) stock row to an absolute target under a row lock; returns the applied delta (target − current). */
  async setQuantity(manager: EntityManager, batchId: string, locationId: string, target: number): Promise<number> {
    const repo = manager.getRepository(StockLevelEntity);
    let level = await repo.findOne({ where: { batchId, locationId }, lock: { mode: 'pessimistic_write' } });
    const current = level ? level.quantity : 0;
    level ??= repo.create({ batchId, locationId, quantity: 0 });
    level.quantity = target;
    await repo.save(level);
    return target - current;
  }

  async totalQuantityAtLocation(locationId: string): Promise<number> {
    const row = (await this.stock
      .createQueryBuilder('s')
      .select('COALESCE(SUM(s.quantity), 0)', 'total')
      .where('s.location_id = :locationId', { locationId })
      .getRawOne<{ total: string }>()) ?? { total: '0' };
    return Number(row.total);
  }

  async listStock(productId?: string, locationId?: string, expired?: boolean): Promise<StockLevelDto[]> {
    const qb = this.stock
      .createQueryBuilder('s')
      .innerJoin(BatchEntity, 'b', 'b.id = s.batch_id')
      .select([
        's.batch_id AS "batchId"',
        's.location_id AS "locationId"',
        'b.product_id AS "productId"',
        's.quantity AS "quantity"',
        'b.expiry_date AS "expiryDate"',
        '(b.expiry_date IS NOT NULL AND b.expiry_date < CURRENT_DATE) AS "isExpired"',
      ])
      .where('s.quantity > 0');
    if (productId) qb.andWhere('b.product_id = :productId', { productId });
    if (locationId) qb.andWhere('s.location_id = :locationId', { locationId });
    if (expired === true) qb.andWhere('b.expiry_date IS NOT NULL AND b.expiry_date < CURRENT_DATE');
    if (expired === false) qb.andWhere('(b.expiry_date IS NULL OR b.expiry_date >= CURRENT_DATE)');
    const rows = await qb.getRawMany<StockLevelDto & { quantity: string }>();
    return rows.map((r) => ({ ...r, quantity: Number(r.quantity), isExpired: Boolean(r.isExpired) }));
  }

  async lowStock(): Promise<LowStockDto[]> {
    const rows = await this.products
      .createQueryBuilder('p')
      .leftJoin(BatchEntity, 'b', 'b.product_id = p.id')
      .leftJoin(StockLevelEntity, 's', 's.batch_id = b.id')
      .select([
        'p.id AS "productId"',
        'p.name AS "productName"',
        'COALESCE(SUM(s.quantity), 0) AS "totalQuantity"',
        'p.min_stock AS "minStock"',
      ])
      .where('p.is_active = true')
      .groupBy('p.id')
      .addGroupBy('p.name')
      .addGroupBy('p.min_stock')
      .having('COALESCE(SUM(s.quantity), 0) < p.min_stock')
      .getRawMany<{ productId: string; productName: string; totalQuantity: string; minStock: string }>();
    return rows.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      totalQuantity: Number(r.totalQuantity),
      minStock: Number(r.minStock),
    }));
  }

  async fefoSuggestion(productId: string, locationId: string, quantity: number): Promise<FefoSuggestionDto> {
    const rows = await this.stock
      .createQueryBuilder('s')
      .innerJoin(BatchEntity, 'b', 'b.id = s.batch_id')
      .select([
        's.batch_id AS "batchId"',
        's.quantity AS "available"',
        'b.expiry_date AS "expiryDate"',
        'b.received_date AS "receivedDate"',
      ])
      .where('b.product_id = :productId', { productId })
      .andWhere('s.location_id = :locationId', { locationId })
      .andWhere('s.quantity > 0')
      .getRawMany<{ batchId: string; available: string; expiryDate: string | null; receivedDate: string }>();

    const candidates: FefoBatch[] = rows.map((r) => ({
      batchId: r.batchId,
      available: Number(r.available),
      expiryDate: r.expiryDate,
      receivedDate: r.receivedDate,
    }));
    const result = allocateFefo(candidates, quantity);
    return { productId, locationId, ...result };
  }
}
