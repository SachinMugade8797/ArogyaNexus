export function vitalRangeStart(range: '30d' | '90d' | '1y', now = Date.now()): Date {
  const days = range === '30d' ? 30 : range === '90d' ? 90 : 365;
  return new Date(now - days * 86400000);
}
export function recordCategoryFilter(category: string): string | undefined {
  return category === 'ALL' ? undefined : category;
}
