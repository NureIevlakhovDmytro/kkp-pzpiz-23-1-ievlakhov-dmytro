import { ErrorCode } from '@app/shared';
import type { DeepPartial, FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';

import { AppException } from '../api-exception';
import type { PaginationQueryDto } from '../dto/pagination.dto';
import { paginate } from '../dto/pagination.dto';
import type { SoftDeletable } from './soft-delete.entity';

export abstract class SoftDeleteCrudService<T extends SoftDeletable> {
  constructor(
    protected readonly repo: Repository<T>,
    protected readonly entityName: string,
  ) {}

  async list(q: PaginationQueryDto, includeInactive: boolean) {
    const [items, total] = await this.repo.findAndCount({
      where: includeInactive ? {} : ({ isActive: true } as FindOptionsWhere<T>),
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      order: { id: 'ASC' } as FindOptionsOrder<T>,
    });
    return paginate(items, total, q);
  }

  async getById(id: string): Promise<T> {
    const e = await this.repo.findOne({ where: { id } as FindOptionsWhere<T> });
    if (!e) throw new AppException(ErrorCode.NOT_FOUND, `${this.entityName} not found`);
    return e;
  }

  async create(data: Partial<T>): Promise<T> {
    return this.saveUnique(this.repo.create(data as DeepPartial<T>));
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const e = await this.getById(id);
    Object.assign(e, data);
    return this.saveUnique(e);
  }

  async archive(id: string): Promise<void> {
    const e = await this.getById(id);
    await this.assertArchivable(e);
    (e as SoftDeletable).isActive = false;
    await this.saveUnique(e);
  }

  /** Override to block archiving when the entity is still referenced (→ 409). */
  protected assertArchivable(_e: T): Promise<void> {
    return Promise.resolve();
  }

  private async saveUnique(entity: DeepPartial<T>): Promise<T> {
    try {
      return await this.repo.save(entity);
    } catch (err) {
      if (err && typeof err === 'object' && (err as { code?: string }).code === '23505') {
        throw new AppException(ErrorCode.CONFLICT, `${this.entityName} already exists`);
      }
      throw err;
    }
  }
}
