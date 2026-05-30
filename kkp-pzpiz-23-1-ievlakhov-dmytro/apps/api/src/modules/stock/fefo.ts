export interface FefoBatch {
  batchId: string;
  available: number;
  expiryDate: string | null;
  receivedDate: string;
}

export interface FefoAllocation {
  batchId: string;
  allocated: number;
}

export interface FefoResult {
  allocations: FefoAllocation[];
  requested: number;
  allocated: number;
  shortfall: number;
}

const NO_EXPIRY = '9999-12-31';

/** First-Expired-First-Out allocation. Pure + deterministic: expiry ASC (NULLS LAST), then receivedDate ASC, then batchId ASC. */
export function allocateFefo(batches: FefoBatch[], quantity: number): FefoResult {
  const sorted = [...batches].sort((a, c) => {
    const ae = a.expiryDate ?? NO_EXPIRY;
    const ce = c.expiryDate ?? NO_EXPIRY;
    if (ae !== ce) return ae < ce ? -1 : 1;
    if (a.receivedDate !== c.receivedDate) return a.receivedDate < c.receivedDate ? -1 : 1;
    return a.batchId < c.batchId ? -1 : a.batchId > c.batchId ? 1 : 0;
  });

  const allocations: FefoAllocation[] = [];
  let remaining = quantity;
  for (const batch of sorted) {
    if (remaining <= 0) break;
    const take = Math.min(batch.available, remaining);
    if (take > 0) {
      allocations.push({ batchId: batch.batchId, allocated: take });
      remaining -= take;
    }
  }

  return {
    allocations,
    requested: quantity,
    allocated: quantity - remaining,
    shortfall: Math.max(0, remaining),
  };
}
