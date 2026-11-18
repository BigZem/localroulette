export function randomIndex(length: number, random: () => number = Math.random): number {
  if (!Number.isInteger(length) || length < 1) throw new Error('No choices');
  return Math.min(length - 1, Math.floor(random() * length));
}

// Conic-gradient starts at 12 o'clock; stop at the centre of the chosen slice.
export function wheelStop(previous: number, index: number, count: number): number {
  if (!Number.isInteger(count) || count < 1 || !Number.isInteger(index) || index < 0 || index >= count) throw new Error('Invalid segment');
  const target = (360 - (index + 0.5) * 360 / count + 360) % 360;
  const current = ((previous % 360) + 360) % 360;
  return previous + 360 * 5 + (target - current + 360) % 360;
}
