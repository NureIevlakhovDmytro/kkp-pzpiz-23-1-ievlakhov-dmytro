import { formatDate, formatQty } from './format';

describe('formatQty', () => {
  it('formats with up to 3 decimals, trimming trailing zeros', () => {
    expect(formatQty(12)).toBe('12');
    expect(formatQty(12.5)).toBe('12.5');
    expect(formatQty(12.50000001)).toBe('12.5');
    expect(formatQty(0.125)).toBe('0.125');
  });
});

describe('formatDate', () => {
  it('renders an ISO date as YYYY-MM-DD', () => {
    expect(formatDate('2026-05-31T10:00:00.000Z')).toBe('2026-05-31');
  });
  it('returns a dash for null', () => {
    expect(formatDate(null)).toBe('—');
  });
});
