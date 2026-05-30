import { DocumentStatus, ErrorCode } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { DataSource, Repository } from 'typeorm';

import { AppException } from '../common/api-exception';
import { paginate,PaginationQueryDto } from '../common/dto/pagination.dto';
import { DocumentNumberService } from '../common/numbering/document-number.service';
import { BatchEntity } from '../entities/batch.entity';
import { CurrencyEntity } from '../entities/currency.entity';
import { ProductEntity } from '../entities/product.entity';
import { ReceiptDocumentEntity } from '../entities/receipt-document.entity';
import { ReceiptLineEntity } from '../entities/receipt-line.entity';
import { StorageLocationEntity } from '../entities/storage-location.entity';
import { SupplierEntity } from '../entities/supplier.entity';
import { StockService } from '../stock/stock.service';
import { CreateReceiptDto, ReceiptFilterDto } from './dto/receipt.dto';

@Injectable()
export class ReceiptsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly numbers: DocumentNumberService,
    private readonly stock: StockService,
    @InjectRepository(ReceiptDocumentEntity) private readonly receipts: Repository<ReceiptDocumentEntity>,
  ) {}

  async post(dto: CreateReceiptDto, userId: string, idempotencyKey?: string): Promise<ReceiptDocumentEntity> {
    if (idempotencyKey) {
      const existing = await this.receipts.findOne({
        where: { clientUuid: idempotencyKey },
        relations: { lines: true },
      });
      if (existing) return existing;
    }

    return this.dataSource.transaction(async (manager) => {
      await this.validateLocation(manager, dto.locationId);
      if (dto.supplierId) await this.validateSupplier(manager, dto.supplierId);

      const number = await this.numbers.next(manager, 'receipt_number_seq', 'REC');
      const docRepo = manager.getRepository(ReceiptDocumentEntity);
      const doc = await docRepo.save(
        docRepo.create({
          number,
          supplierId: dto.supplierId ?? null,
          locationId: dto.locationId,
          date: dto.date,
          userId,
          status: DocumentStatus.POSTED,
          reversesId: null,
          clientUuid: idempotencyKey ?? null,
        }),
      );

      for (const line of dto.lines) {
        await this.validateProduct(manager, line.productId);
        await this.validateCurrency(manager, line.currencyId);

        const batchRepo = manager.getRepository(BatchEntity);
        const batch = await batchRepo.save(
          batchRepo.create({
            productId: line.productId,
            batchNumber: line.batchNumber,
            expiryDate: line.expiryDate ?? null,
            receivedDate: dto.date,
            unitCost: line.unitCost,
            currencyId: line.currencyId,
            supplierId: dto.supplierId ?? null,
          }),
        );

        const lineRepo = manager.getRepository(ReceiptLineEntity);
        await lineRepo.save(
          lineRepo.create({
            receiptId: doc.id,
            productId: line.productId,
            batchId: batch.id,
            batchNumber: line.batchNumber,
            expiryDate: line.expiryDate ?? null,
            quantity: line.quantity,
            unitCost: line.unitCost,
            currencyId: line.currencyId,
          }),
        );

        await this.stock.applyDelta(manager, batch.id, dto.locationId, line.quantity);
      }

      return this.loadWithLines(manager.getRepository(ReceiptDocumentEntity), doc.id);
    });
  }

  async reverse(id: string, userId: string): Promise<ReceiptDocumentEntity> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ReceiptDocumentEntity);
      const original = await repo.findOne({ where: { id }, relations: { lines: true } });
      if (!original) throw new AppException(ErrorCode.NOT_FOUND, 'Receipt not found');
      if (original.status === DocumentStatus.REVERSED) {
        throw new AppException(ErrorCode.CONFLICT, 'Receipt already reversed');
      }

      const number = await this.numbers.next(manager, 'receipt_number_seq', 'REC');
      const reversal = await repo.save(
        repo.create({
          number,
          supplierId: original.supplierId,
          locationId: original.locationId,
          date: original.date,
          userId,
          status: DocumentStatus.POSTED,
          reversesId: original.id,
          clientUuid: null,
        }),
      );

      const lineRepo = manager.getRepository(ReceiptLineEntity);
      for (const line of original.lines) {
        await this.stock.applyDelta(manager, line.batchId, original.locationId, -line.quantity);
        await lineRepo.save(
          lineRepo.create({
            receiptId: reversal.id,
            productId: line.productId,
            batchId: line.batchId,
            batchNumber: line.batchNumber,
            expiryDate: line.expiryDate,
            quantity: line.quantity,
            unitCost: line.unitCost,
            currencyId: line.currencyId,
          }),
        );
      }

      original.status = DocumentStatus.REVERSED;
      await repo.save(original);
      return this.loadWithLines(repo, reversal.id);
    });
  }

  async list(q: PaginationQueryDto, f: ReceiptFilterDto) {
    const qb = this.receipts.createQueryBuilder('r').orderBy('r.date', 'DESC').addOrderBy('r.created_at', 'DESC');
    if (f.from) qb.andWhere('r.date >= :from', { from: f.from });
    if (f.to) qb.andWhere('r.date <= :to', { to: f.to });
    if (f.supplierId) qb.andWhere('r.supplier_id = :supplierId', { supplierId: f.supplierId });
    if (f.locationId) qb.andWhere('r.location_id = :locationId', { locationId: f.locationId });
    if (f.status) qb.andWhere('r.status = :status', { status: f.status });
    qb.skip((q.page - 1) * q.limit).take(q.limit);
    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, q);
  }

  async getById(id: string): Promise<ReceiptDocumentEntity> {
    return this.loadWithLines(this.receipts, id);
  }

  private async loadWithLines(repo: Repository<ReceiptDocumentEntity>, id: string): Promise<ReceiptDocumentEntity> {
    const doc = await repo.findOne({ where: { id }, relations: { lines: true } });
    if (!doc) throw new AppException(ErrorCode.NOT_FOUND, 'Receipt not found');
    return doc;
  }

  private async validateLocation(manager: EntityManager, locationId: string): Promise<void> {
    const location = await manager.getRepository(StorageLocationEntity).findOne({ where: { id: locationId } });
    if (!location) throw new AppException(ErrorCode.NOT_FOUND, 'Location not found');
    if (!location.isActive) throw new AppException(ErrorCode.BUSINESS_RULE, 'Location is archived');
  }

  private async validateSupplier(manager: EntityManager, supplierId: string): Promise<void> {
    const supplier = await manager.getRepository(SupplierEntity).findOne({ where: { id: supplierId } });
    if (!supplier) throw new AppException(ErrorCode.NOT_FOUND, 'Supplier not found');
    if (!supplier.isActive) throw new AppException(ErrorCode.BUSINESS_RULE, 'Supplier is archived');
  }

  private async validateProduct(manager: EntityManager, productId: string): Promise<void> {
    const product = await manager.getRepository(ProductEntity).findOne({ where: { id: productId } });
    if (!product) throw new AppException(ErrorCode.NOT_FOUND, 'Product not found');
    if (!product.isActive) throw new AppException(ErrorCode.BUSINESS_RULE, 'Product is archived');
  }

  private async validateCurrency(manager: EntityManager, currencyId: string): Promise<void> {
    const currency = await manager.getRepository(CurrencyEntity).findOne({ where: { id: currencyId } });
    if (!currency) throw new AppException(ErrorCode.NOT_FOUND, 'Currency not found');
  }
}
