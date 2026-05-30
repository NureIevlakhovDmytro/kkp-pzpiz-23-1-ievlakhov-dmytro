import { AuditAction } from '@app/shared';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditLogEntity } from '../database/entities/audit-log.entity';

export interface AuditEntry {
  userId: string | null;
  action: AuditAction;
  entity: string | null;
  entityId: string | null;
  details: Record<string, unknown> | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLogEntity) private readonly repo: Repository<AuditLogEntity>,
  ) {}

  /** Append an audit entry. Best-effort: a failure here must never break the audited request. */
  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.repo.save(this.repo.create(entry));
    } catch (err) {
      this.logger.warn(`Failed to write audit log: ${String(err)}`);
    }
  }

  async list(
    filter: { userId?: string; action?: string; from?: string; to?: string },
    page: number,
    limit: number,
  ) {
    const qb = this.repo.createQueryBuilder('a').orderBy('a.created_at', 'DESC');
    if (filter.userId) qb.andWhere('a.user_id = :userId', { userId: filter.userId });
    if (filter.action) qb.andWhere('a.action = :action', { action: filter.action });
    if (filter.from) qb.andWhere('a.created_at >= :from', { from: filter.from });
    if (filter.to) qb.andWhere('a.created_at <= :to', { to: filter.to });
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }
}
