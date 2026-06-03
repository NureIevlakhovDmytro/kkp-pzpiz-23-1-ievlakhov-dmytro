import type { FefoSuggestionDto } from '@app/shared';
import type { WriteOffLineInput } from './write-offs.api';

export function fefoToLines(suggestion: FefoSuggestionDto, locationId: string): WriteOffLineInput[] {
  return suggestion.allocations.map((a) => ({ batchId: a.batchId, locationId, quantity: a.allocated }));
}
