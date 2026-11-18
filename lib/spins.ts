import { ukDate } from './domain.ts';

// Browser-only free tier. Replace with server entitlements before billing.
export const FREE_DAILY_SPINS = 3;
export interface SpinRecord { day: string; count: number }
export function spinsLeft(record: SpinRecord | null, now = new Date()): number {
  return Math.max(0, FREE_DAILY_SPINS - (record?.day === ukDate(now) ? Math.max(0, Math.floor(record.count)) : 0));
}
export function takeSpin(record: SpinRecord | null, now = new Date()): SpinRecord | null {
  if (spinsLeft(record, now) === 0) return null;
  return { day: ukDate(now), count: (record?.day === ukDate(now) ? record.count : 0) + 1 };
}
