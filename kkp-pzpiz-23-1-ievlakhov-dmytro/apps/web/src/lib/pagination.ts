export const LIST_LIMIT = 200;

export function listQuery(extra?: Record<string, string | undefined>): string {
  const params = new URLSearchParams({ page: '1', limit: String(LIST_LIMIT) });
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v) params.set(k, v);
    }
  }
  return `?${params.toString()}`;
}
