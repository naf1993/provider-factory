

export function dedupeByKey<T>(
  items: T[],
  getKey: (item: T) => string,
): T[] {
  const map =
    new Map<string, T>();

  for (const item of items) {
    map.set(
      getKey(item),
      item,
    );
  }

  return Array.from(
    map.values(),
  );
}