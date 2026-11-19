import { randomIndex } from './wheel.ts';

export const HISTORY_LIMIT = 500;

function key(id: string): string {
  // The same Geoapify place can appear under different activity categories.
  return id.replace(/^geo-(?:food|entertainment|outdoor|family|sport|culture|nightlife|hidden)-/, 'geo-');
}

export function normaliseHistory(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const unique = new Set<string>();
  const newestFirst: string[] = [];
  for (let index = value.length - 1; index >= 0 && newestFirst.length < HISTORY_LIMIT; index--) {
    const id = value[index];
    if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,110}$/.test(id)) continue;
    const itemKey = key(id);
    if (!unique.has(itemKey)) { unique.add(itemKey); newestFirst.push(itemKey); }
  }
  return newestFirst.reverse();
}

export function rememberPick(history: readonly string[], id: string): string[] {
  return normaliseHistory([...history, id]);
}

// Prefer a place that has never appeared on this device. When every eligible
// place has appeared, use the least recently shown one instead of restarting
// at random and immediately repeating the previous spin.
export function pickActivity<T extends { id: string }>(items: readonly T[], history: readonly string[], random: () => number = Math.random): T {
  if (!items.length) throw new Error('No choices');
  const ranks = new Map(history.map((id, index) => [id, index]));
  const fresh = items.filter(item => !ranks.has(key(item.id)));
  if (fresh.length) return fresh[randomIndex(fresh.length, random)]!;
  const oldestRank = Math.min(...items.map(item => ranks.get(key(item.id)) ?? -1));
  const oldest = items.filter(item => ranks.get(key(item.id)) === oldestRank);
  return oldest[randomIndex(oldest.length, random)]!;
}
