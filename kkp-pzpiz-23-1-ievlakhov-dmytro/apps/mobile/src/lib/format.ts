/** Quantities are numeric(14,3); show up to 3 decimals without trailing zeros. */
export function formatQty(value: number): string {
  return Number(value.toFixed(3)).toString();
}

/** ISO datetime/date -> YYYY-MM-DD; null -> em dash. */
export function formatDate(value: string | null): string {
  if (!value) return '—';
  return value.slice(0, 10);
}
