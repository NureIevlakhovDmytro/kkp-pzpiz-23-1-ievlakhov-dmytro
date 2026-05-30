import { pickRate, type Rate } from './rate';

const r = (rateToBase: number, effectiveDate: string): Rate => ({ rateToBase, effectiveDate });

describe('pickRate', () => {
  it('returns the latest rate effective on or before the date', () => {
    const rates = [r(40, '2026-01-01'), r(41, '2026-03-01'), r(42, '2026-06-01')];
    expect(pickRate(rates, '2026-05-30')).toBe(41);
  });

  it('uses an exact-date rate', () => {
    expect(pickRate([r(40, '2026-01-01'), r(41, '2026-05-30')], '2026-05-30')).toBe(41);
  });

  it('returns null when no rate is effective yet (no silent zero)', () => {
    expect(pickRate([r(41, '2026-06-01')], '2026-05-30')).toBeNull();
  });

  it('returns null for an empty rate set', () => {
    expect(pickRate([], '2026-05-30')).toBeNull();
  });
});
