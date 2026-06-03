/** Live discrepancy for the count sheet: actual − expected, or null when actual is blank. */
export function discrepancy(actual: string | undefined, expected: number): number | null {
  if (actual === '' || actual === undefined) return null;
  return Number(actual) - expected;
}
