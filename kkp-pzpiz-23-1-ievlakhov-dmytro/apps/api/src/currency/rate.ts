export interface Rate {
  rateToBase: number;
  effectiveDate: string;
}

/** Latest rate with effectiveDate <= date, or null if none (caller must surface "rate missing", never substitute 0). */
export function pickRate(rates: Rate[], date: string): number | null {
  let best: Rate | null = null;
  for (const rate of rates) {
    if (rate.effectiveDate <= date && (best === null || rate.effectiveDate > best.effectiveDate)) {
      best = rate;
    }
  }
  return best ? best.rateToBase : null;
}
