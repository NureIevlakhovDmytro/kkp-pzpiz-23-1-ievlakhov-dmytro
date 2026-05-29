import { ValueTransformer } from 'typeorm';

/** Maps PostgreSQL numeric (string) <-> JS number. Reused by all decimal columns. */
export class ColumnNumericTransformer implements ValueTransformer {
  to(value: number | null): number | null {
    return value;
  }
  from(value: string | null): number | null {
    return value === null ? null : Number(value);
  }
}
