import { fromCsv, toCsv } from './csv';

describe('csv', () => {
  it('round-trips rows', () => {
    const rows = [
      { code: 'kg', name: 'Kilogram' },
      { code: 'l', name: 'Litre' },
    ];
    const csv = toCsv(rows, ['code', 'name']);
    expect(csv.split('\n')[0]).toBe('code,name');
    expect(fromCsv(csv)).toEqual([
      { code: 'kg', name: 'Kilogram' },
      { code: 'l', name: 'Litre' },
    ]);
  });

  it('parses an empty body to an empty array', () => {
    expect(fromCsv('code,name\n')).toEqual([]);
  });
});
