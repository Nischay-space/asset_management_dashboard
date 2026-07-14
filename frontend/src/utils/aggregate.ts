export function countBy<T>(items: T[], getKey: (item: T) => string | null): { name: string; count: number }[] {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item) ?? 'Unknown';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
export function countRelated<T>(items: T[], getName: (item: T) => string, getCount: (item: T) => number): { name: string; count: number }[] {
  return items
    .map((item) => ({ name: getName(item), count: getCount(item) }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count);
}