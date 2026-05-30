import { allocateFefo, type FefoBatch } from './fefo';

const b = (batchId: string, available: number, expiryDate: string | null, receivedDate = '2026-01-01'): FefoBatch => ({
  batchId,
  available,
  expiryDate,
  receivedDate,
});

describe('allocateFefo', () => {
  it('takes from the earliest-expiring batch first', () => {
    const r = allocateFefo([b('late', 10, '2026-12-01'), b('early', 10, '2026-06-01')], 5);
    expect(r.allocations).toEqual([{ batchId: 'early', allocated: 5 }]);
    expect(r).toMatchObject({ requested: 5, allocated: 5, shortfall: 0 });
  });

  it('splits across batches in expiry order', () => {
    const r = allocateFefo([b('a', 3, '2026-06-01'), b('b', 10, '2026-07-01')], 8);
    expect(r.allocations).toEqual([
      { batchId: 'a', allocated: 3 },
      { batchId: 'b', allocated: 5 },
    ]);
    expect(r.allocated).toBe(8);
    expect(r.shortfall).toBe(0);
  });

  it('orders null expiry LAST', () => {
    const r = allocateFefo([b('noexp', 10, null), b('exp', 10, '2026-06-01')], 5);
    expect(r.allocations).toEqual([{ batchId: 'exp', allocated: 5 }]);
  });

  it('reports shortfall when stock is insufficient (no silent truncation to success)', () => {
    const r = allocateFefo([b('a', 2, '2026-06-01')], 5);
    expect(r.allocations).toEqual([{ batchId: 'a', allocated: 2 }]);
    expect(r).toMatchObject({ requested: 5, allocated: 2, shortfall: 3 });
  });

  it('breaks ties by receivedDate then batchId (deterministic)', () => {
    const r = allocateFefo(
      [b('z', 5, '2026-06-01', '2026-02-01'), b('a', 5, '2026-06-01', '2026-01-01')],
      3,
    );
    expect(r.allocations).toEqual([{ batchId: 'a', allocated: 3 }]);
  });
});
