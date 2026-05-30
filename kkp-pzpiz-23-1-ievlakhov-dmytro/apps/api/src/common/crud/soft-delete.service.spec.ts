import { SoftDeleteCrudService } from './soft-delete.service';
import { AppException } from '../api-exception';
import { ErrorCode } from '@app/shared';
import { PaginationQueryDto } from '../dto/pagination.dto';

interface Row { id: string; isActive: boolean; name: string; }

function fakeRepo(rows: Row[]) {
  return {
    findAndCount: jest.fn(async (opts: any) => {
      const all = opts.where && opts.where.isActive ? rows.filter((r) => r.isActive) : rows;
      return [all.slice(opts.skip, opts.skip + opts.take), all.length];
    }),
    findOne: jest.fn(async (opts: any) => rows.find((r) => r.id === opts.where.id) ?? null),
    create: jest.fn((d: any) => ({ ...d })),
    save: jest.fn(async (e: any) => { if (!e.id) e.id = 'new'; const i = rows.findIndex((r) => r.id === e.id); if (i >= 0) rows[i] = e; else rows.push(e); return e; }),
  } as any;
}

class Svc extends SoftDeleteCrudService<Row> {}

describe('SoftDeleteCrudService', () => {
  const q = Object.assign(new PaginationQueryDto(), { page: 1, limit: 20 });

  it('list() hides inactive by default and includes them when asked', async () => {
    const rows: Row[] = [{ id: 'a', isActive: true, name: 'A' }, { id: 'b', isActive: false, name: 'B' }];
    const svc = new Svc(fakeRepo(rows), 'Row');
    expect((await svc.list(q, false)).total).toBe(1);
    expect((await svc.list(q, true)).total).toBe(2);
  });

  it('getById() throws NOT_FOUND for missing id', async () => {
    const svc = new Svc(fakeRepo([]), 'Row');
    await expect(svc.getById('x')).rejects.toBeInstanceOf(AppException);
  });

  it('archive() sets isActive=false', async () => {
    const rows: Row[] = [{ id: 'a', isActive: true, name: 'A' }];
    const svc = new Svc(fakeRepo(rows), 'Row');
    await svc.archive('a');
    expect(rows[0].isActive).toBe(false);
  });

  it('maps unique-violation (23505) on save to CONFLICT', async () => {
    const repo = fakeRepo([]);
    repo.save = jest.fn(async () => { const e: any = new Error('dup'); e.code = '23505'; throw e; });
    const svc = new Svc(repo, 'Row');
    await expect(svc.create({ name: 'A', isActive: true } as any)).rejects.toMatchObject({ code: ErrorCode.CONFLICT });
  });
});
