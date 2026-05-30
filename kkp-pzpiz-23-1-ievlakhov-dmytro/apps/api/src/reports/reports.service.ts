import {
  DocumentStatus,
  ErrorCode,
  InventoryReportDto,
  LossStructureReportDto,
  LossStructureRowDto,
} from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppException } from '../common/api-exception';
import { CurrencyConverterService } from '../currency/currency-converter.service';
import { BatchEntity } from '../entities/batch.entity';
import { InventoryCountEntity } from '../entities/inventory-count.entity';
import { StockAdjustmentEntity } from '../entities/stock-adjustment.entity';
import { WriteOffReasonEntity } from '../entities/write-off-reason.entity';

interface LossLine {
  reasonId: string;
  amount: number; // quantity * unit_cost, in the batch currency
  currencyId: string;
  date: string;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly converter: CurrencyConverterService,
    @InjectRepository(WriteOffReasonEntity)
    private readonly reasons: Repository<WriteOffReasonEntity>,
    @InjectRepository(InventoryCountEntity)
    private readonly counts: Repository<InventoryCountEntity>,
    @InjectRepository(StockAdjustmentEntity)
    private readonly adjustments: Repository<StockAdjustmentEntity>,
    @InjectRepository(BatchEntity) private readonly batches: Repository<BatchEntity>,
  ) {}

  async lossStructure(from: string, to: string): Promise<LossStructureReportDto> {
    const baseCurrencyId = await this.converter.baseCurrencyId();

    // Posted, non-reversed write-off lines in range: amount = quantity * batch.unit_cost, reason = document reason.
    const writeOffLines = await this.batches.manager
      .createQueryBuilder()
      .select([
        'd.reason_id AS "reasonId"',
        '(l.quantity * b.unit_cost) AS "amount"',
        'b.currency_id AS "currencyId"',
        'd.date AS "date"',
      ])
      .from('write_off_lines', 'l')
      .innerJoin('write_off_documents', 'd', 'd.id = l.write_off_id')
      .innerJoin('batches', 'b', 'b.id = l.batch_id')
      .where('d.status = :posted', { posted: DocumentStatus.POSTED })
      .andWhere('d.reverses_id IS NULL')
      .andWhere('d.date BETWEEN :from AND :to', { from, to })
      .getRawMany<LossLine>();

    // Inventory shortages (delta < 0, reason = SHORTAGE) in range: amount = |delta| * batch.unit_cost.
    const shortageLines = await this.batches.manager
      .createQueryBuilder()
      .select([
        'al.reason_id AS "reasonId"',
        '(-al.delta * b.unit_cost) AS "amount"',
        'b.currency_id AS "currencyId"',
        'a.date AS "date"',
      ])
      .from('stock_adjustment_lines', 'al')
      .innerJoin('stock_adjustments', 'a', 'a.id = al.adjustment_id')
      .innerJoin('batches', 'b', 'b.id = al.batch_id')
      .where('al.delta < 0')
      .andWhere('al.reason_id IS NOT NULL')
      .andWhere('a.date BETWEEN :from AND :to', { from, to })
      .getRawMany<LossLine>();

    const all = [...writeOffLines, ...shortageLines];
    const reasons = await this.reasons.find();
    const byReason = new Map<string, number>();
    let rateMissing = false;

    for (const line of all) {
      const { base, rateMissing: missing } = await this.converter.convert(
        Number(line.amount),
        line.currencyId,
        line.date,
        baseCurrencyId,
      );
      if (missing) rateMissing = true;
      byReason.set(line.reasonId, (byReason.get(line.reasonId) ?? 0) + base);
    }

    const rows: LossStructureRowDto[] = reasons
      .filter((r) => byReason.has(r.id))
      .map((r) => ({
        reasonId: r.id,
        reasonCode: r.code,
        nameUk: r.nameUk,
        nameEn: r.nameEn,
        totalBase: round2(byReason.get(r.id) ?? 0),
      }))
      .sort((a, b) => b.totalBase - a.totalBase);

    return {
      from,
      to,
      baseCurrencyId,
      rows,
      total: round2(rows.reduce((s, r) => s + r.totalBase, 0)),
      rateMissing,
    };
  }

  async inventoryReport(inventoryId: string): Promise<InventoryReportDto> {
    const count = await this.counts.findOne({ where: { id: inventoryId } });
    if (!count) throw new AppException(ErrorCode.NOT_FOUND, 'Inventory not found');
    const baseCurrencyId = await this.converter.baseCurrencyId();

    const adjustment = await this.adjustments.findOne({
      where: { inventoryId },
      relations: { lines: true },
    });
    let shortageCount = 0;
    let surplusCount = 0;
    let shortageTotalBase = 0;
    let surplusTotalBase = 0;
    let rateMissing = false;

    if (adjustment) {
      for (const line of adjustment.lines) {
        const batch = await this.batches.findOne({ where: { id: line.batchId } });
        const unitCost = batch ? batch.unitCost : 0;
        const currencyId = batch ? batch.currencyId : baseCurrencyId;
        const { base, rateMissing: missing } = await this.converter.convert(
          Math.abs(line.delta) * unitCost,
          currencyId,
          count.date,
          baseCurrencyId,
        );
        if (missing) rateMissing = true;
        if (line.delta < 0) {
          shortageCount += 1;
          shortageTotalBase += base;
        } else {
          surplusCount += 1;
          surplusTotalBase += base;
        }
      }
    }

    return {
      inventoryId,
      number: count.number,
      locationId: count.locationId,
      date: count.date,
      status: count.status,
      shortageCount,
      surplusCount,
      shortageTotalBase: round2(shortageTotalBase),
      surplusTotalBase: round2(surplusTotalBase),
      rateMissing,
    };
  }
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
