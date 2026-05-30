import { ErrorCode, NotificationType } from '@app/shared';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { AppException } from '../../core/common/api-exception';
import { paginate, PaginationQueryDto } from '../../core/common/dto/pagination.dto';
import { AppSettingsEntity } from '../../core/database/entities/app-settings.entity';
import { NotificationEntity } from '../../core/database/entities/notification.entity';
import { BatchesService } from '../stock/batches.service';
import { StockService } from '../stock/stock.service';

const COOLDOWN_MS = 60 * 60 * 1000; // do not re-create the same notification within 1h of a prior one

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationEntity) private readonly repo: Repository<NotificationEntity>,
    @InjectRepository(AppSettingsEntity) private readonly settings: Repository<AppSettingsEntity>,
    private readonly stock: StockService,
    private readonly batches: BatchesService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async scheduledRun(): Promise<void> {
    try {
      await this.runChecks();
    } catch (err) {
      this.logger.warn(`Notification check failed: ${String(err)}`);
    }
  }

  /** Scan low-stock and near-expiry conditions, upsert active notifications, auto-resolve cleared ones. */
  async runChecks(now: Date = new Date()): Promise<void> {
    const appSettings = await this.settings.findOne({ where: { id: 1 } });

    if (appSettings?.lowStockCheckEnabled) {
      const low = await this.stock.lowStock();
      const activeProductIds = new Set(low.map((l) => l.productId));
      for (const l of low) {
        await this.upsert(
          NotificationType.LOW_STOCK,
          { productId: l.productId },
          l as unknown as Record<string, unknown>,
          now,
        );
      }
      await this.autoResolve(NotificationType.LOW_STOCK, 'productId', activeProductIds, now);
    }

    if (appSettings?.nearExpiryCheckEnabled) {
      const expiring = await this.batches.expiring(appSettings.nearExpiryDays);
      const activeBatchIds = new Set(expiring.map((b) => b.id));
      for (const b of expiring) {
        await this.upsert(
          NotificationType.NEAR_EXPIRY,
          { batchId: b.id },
          { batchId: b.id, productId: b.productId, expiryDate: b.expiryDate },
          now,
        );
      }
      await this.autoResolve(NotificationType.NEAR_EXPIRY, 'batchId', activeBatchIds, now);
    }
  }

  private async upsert(
    type: NotificationType,
    key: { productId?: string; batchId?: string },
    payload: Record<string, unknown>,
    now: Date,
  ): Promise<void> {
    const active = await this.repo.findOne({
      where: { type, ...key, isRead: false, resolvedAt: IsNull() },
    });
    if (active) {
      active.payload = payload;
      await this.repo.save(active);
      return;
    }
    // cooldown: skip re-creating if the most recent notification for this key was updated within the window
    const latest = await this.repo.findOne({
      where: { type, ...key },
      order: { updatedAt: 'DESC' },
    });
    if (latest && now.getTime() - latest.updatedAt.getTime() < COOLDOWN_MS) return;

    await this.repo.save(
      this.repo.create({
        type,
        productId: key.productId ?? null,
        batchId: key.batchId ?? null,
        payload,
        isRead: false,
        resolvedAt: null,
      }),
    );
  }

  private async autoResolve(
    type: NotificationType,
    keyField: 'productId' | 'batchId',
    activeKeys: Set<string>,
    now: Date,
  ): Promise<void> {
    const actives = await this.repo.find({ where: { type, isRead: false, resolvedAt: IsNull() } });
    for (const n of actives) {
      const key = n[keyField];
      if (!key || !activeKeys.has(key)) {
        n.resolvedAt = now;
        await this.repo.save(n);
      }
    }
  }

  async list(q: PaginationQueryDto, type?: string, isRead?: boolean) {
    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead;
    const [items, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    });
    return paginate(items, total, q);
  }

  async markRead(id: string): Promise<NotificationEntity> {
    const n = await this.repo.findOne({ where: { id } });
    if (!n) throw new AppException(ErrorCode.NOT_FOUND, 'Notification not found');
    n.isRead = true;
    return this.repo.save(n);
  }

  async markAllRead(): Promise<{ updated: number }> {
    const res = await this.repo.update({ isRead: false }, { isRead: true });
    return { updated: res.affected ?? 0 };
  }
}
