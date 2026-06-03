import type { FefoSuggestionDto } from '@app/shared';
import { fefoToLines } from './fefo-prefill';

const suggestion: FefoSuggestionDto = {
  productId: 'p1',
  locationId: 'loc1',
  requested: 12,
  allocated: 10,
  shortfall: 2,
  allocations: [
    { batchId: 'b1', allocated: 7 },
    { batchId: 'b2', allocated: 3 },
  ],
};

describe('fefoToLines', () => {
  it('maps allocations to write-off lines at the requested location', () => {
    expect(fefoToLines(suggestion, 'loc1')).toEqual([
      { batchId: 'b1', locationId: 'loc1', quantity: 7 },
      { batchId: 'b2', locationId: 'loc1', quantity: 3 },
    ]);
  });
  it('returns empty when nothing was allocated', () => {
    expect(fefoToLines({ ...suggestion, allocations: [] }, 'loc1')).toEqual([]);
  });
});
