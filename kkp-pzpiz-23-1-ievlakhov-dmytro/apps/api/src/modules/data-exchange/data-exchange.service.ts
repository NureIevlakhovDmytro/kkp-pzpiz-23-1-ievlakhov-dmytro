import { ErrorCode, ExportEntity, ImportResultDto } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { AppException } from '../../core/common/api-exception';
import { fromCsv, toCsv } from './csv';
import { EXPORT_REGISTRY } from './data-exchange.registry';

@Injectable()
export class DataExchangeService {
  constructor(private readonly dataSource: DataSource) {}

  private spec(entity: string) {
    const spec = EXPORT_REGISTRY[entity as ExportEntity];
    if (!spec) {
      throw new AppException(ErrorCode.VALIDATION, `Unknown export entity: ${entity}`, {
        allowed: Object.keys(EXPORT_REGISTRY),
      });
    }
    return spec;
  }

  async export(
    entity: string,
    format: 'json' | 'csv',
  ): Promise<{ contentType: string; body: string }> {
    const spec = this.spec(entity);
    const rows = await this.dataSource.getRepository(spec.entity).find();
    const projected = rows.map((r) =>
      Object.fromEntries(spec.fields.map((f) => [f, r[f] ?? null])),
    );
    if (format === 'csv') {
      return { contentType: 'text/csv', body: toCsv(projected, spec.fields) };
    }
    return { contentType: 'application/json', body: JSON.stringify(projected) };
  }

  /** Upsert by natural key, in one transaction; returns per-row error report. */
  async import(entity: string, format: 'json' | 'csv', payload: string): Promise<ImportResultDto> {
    const spec = this.spec(entity);
    let rows: Record<string, unknown>[];
    try {
      rows =
        format === 'csv' ? fromCsv(payload) : (JSON.parse(payload) as Record<string, unknown>[]);
    } catch (err) {
      throw new AppException(ErrorCode.VALIDATION, `Invalid ${format} payload: ${String(err)}`);
    }
    if (!Array.isArray(rows))
      throw new AppException(ErrorCode.VALIDATION, 'Payload must be an array');

    const result: ImportResultDto = {
      entity: entity as ExportEntity,
      created: 0,
      updated: 0,
      errors: [],
    };

    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(spec.entity);
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const keyValue = row[spec.naturalKey];
        if (keyValue === undefined || keyValue === null || keyValue === '') {
          result.errors.push({ row: i, message: `Missing natural key "${spec.naturalKey}"` });
          continue;
        }
        const existing = await repo.findOne({
          where: { [spec.naturalKey]: keyValue },
        });
        const data = Object.fromEntries(
          spec.fields.filter((f) => f in row).map((f) => [f, row[f]]),
        );
        if (existing) {
          await repo.update({ [spec.naturalKey]: keyValue }, data);
          result.updated += 1;
        } else {
          await repo.save(repo.create(data));
          result.created += 1;
        }
      }
    });

    return result;
  }
}
