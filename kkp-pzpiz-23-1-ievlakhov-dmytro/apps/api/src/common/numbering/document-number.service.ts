import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

/** Generates human-readable document numbers from a Postgres sequence, inside the caller's transaction. */
@Injectable()
export class DocumentNumberService {
  async next(manager: EntityManager, sequence: string, prefix: string): Promise<string> {
    const rows: { value: string }[] = await manager.query(`SELECT nextval($1) AS value`, [sequence]);
    return `${prefix}-${String(rows[0].value).padStart(6, '0')}`;
  }
}
