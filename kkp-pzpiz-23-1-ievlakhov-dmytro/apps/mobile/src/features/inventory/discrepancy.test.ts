import { discrepancy } from './discrepancy';

describe('discrepancy', () => {
  it('returns null for empty / undefined actual', () => {
    expect(discrepancy('', 10)).toBeNull();
    expect(discrepancy(undefined, 10)).toBeNull();
  });
  it('computes actual minus expected', () => {
    expect(discrepancy('8', 10)).toBe(-2);
    expect(discrepancy('12', 10)).toBe(2);
    expect(discrepancy('10', 10)).toBe(0);
  });
});
