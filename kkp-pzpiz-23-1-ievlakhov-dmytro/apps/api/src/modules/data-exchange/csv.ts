/** Minimal CSV for simple reference data (no embedded commas/quotes/newlines). Documented limitation. */
export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(',');
  const lines = rows.map((r) =>
    columns
      .map((c) => String((r[c] as string | boolean | number | null | undefined) ?? ''))
      .join(','),
  );
  return [header, ...lines].join('\n');
}

export function fromCsv(csv: string): Record<string, string>[] {
  const lines = csv
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];
  const columns = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const cells = line.split(',');
    const row: Record<string, string> = {};
    columns.forEach((c, i) => (row[c] = cells[i] ?? ''));
    return row;
  });
}
