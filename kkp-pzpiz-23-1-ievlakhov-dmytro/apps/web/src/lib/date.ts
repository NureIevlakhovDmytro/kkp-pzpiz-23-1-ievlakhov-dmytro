function localISODate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const tzMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzMs).toISOString().slice(0, 10);
}

export const today = (): string => localISODate(0);
export const daysAgo = (n: number): string => localISODate(n);
