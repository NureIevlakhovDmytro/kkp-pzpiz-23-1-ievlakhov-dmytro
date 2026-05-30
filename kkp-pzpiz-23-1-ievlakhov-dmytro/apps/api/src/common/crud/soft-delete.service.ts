import { Repository } from 'typeorm';
import { AppException } from '../api-exception';
import { ErrorCode } from '@app/shared';
import { PaginationQueryDto, paginate } from '../dto/pagination.dto';
import { SoftDeletable } from './soft-delete.entity';

export abstract class SoftDeleteCrudService<T extends SoftDeletable> {
  constructor(
    protected readonly repo: Repository<T>,
    protected readonly entityName: string,
  ) {}

  async list(q: PaginationQueryDto, includeInactive: boolean) {
    const [items, total] = await this.repo.findAndCount({
      where: includeInactive ? {} : ({ isActive: true } as any),
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      order: { id: 'ASC' } as any,
    });
    return paginate(items, total, q);
  }

  async getById(id: string): Promise<T> {
    const e = await this.repo.findOne({ where: { id } as any });
    if (!e) throw new AppException(ErrorCode.NOT_FOUND, `${this.entityName} not found`);
    return e;
  }

  async create(data: Partial<T>): Promise<T> {
    return this.saveUnique(this.repo.create(data as any));
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
    await this.repo.save(e as any);
  }

  /** Override to block archiving when the entity is still referenced (→ 409). */
  protected async assertArchivable(_e: T): Promise<void> {}

  private async saveUnique(entity: any): Promise<T> {
    try {
      return await this.repo.save(entity);
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new AppException(ErrorCode.CONFLICT, `${this.entityName} already exists`);
      }
      throw err;
    }
  }
}
