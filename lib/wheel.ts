export const WHEEL_SEGMENTS = 12;

export function randomIndex(length: number, random: () => number = Math.random): number {
  if (!Number.isInteger(length) || length < 1) throw new Error('No choices');
  return Math.min(length - 1, Math.floor(random() * length));
}

// The chosen activity is picked uniformly from every eligible result before
// sampling the other names. Small result sets keep one slice per activity.
export function wheelPool<T extends { id: string }>(items: readonly T[], chosen: T, random: () => number = Math.random): T[] {
  if (!items.some(item => item.id === chosen.id)) throw new Error('Chosen activity is not eligible');
  const others = items.filter(item => item.id !== chosen.id);
  const pool = [chosen];
  while (pool.length < Math.min(WHEEL_SEGMENTS, items.length)) pool.push(others.splice(randomIndex(others.length, random), 1)[0]!);
  for (let index = pool.length - 1; index > 0; index--) {
    const other = randomIndex(index + 1, random);
    [pool[index], pool[other]] = [pool[other]!, pool[index]!];
  }
  return pool;
}

// Conic-gradient starts at 12 o'clock; stop at the centre of the chosen slice.
export function wheelStop(previous: number, index: number, count: number): number {
  if (!Number.isInteger(count) || count < 1 || !Number.isInteger(index) || index < 0 || index >= count) throw new Error('Invalid segment');
  const target = (360 - (index + 0.5) * 360 / count + 360) % 360;
  const current = ((previous % 360) + 360) % 360;
  return previous + 360 * 5 + (target - current + 360) % 360;
}
