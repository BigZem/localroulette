import type { Activity } from './types.ts';

export function priceLabel(item: Activity): string {
  if (item.pricePence === undefined) return 'Price unknown';
  if (item.pricePence === 0) return item.demo ? 'Free idea' : 'Free entry listed';
  return `From £${(item.pricePence / 100).toFixed(2)}`;
}
export function whenLabel(item: Activity): string {
  if (item.startsAt) return new Date(item.startsAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/London' });
  if (item.openingHours) return `Listed hours: ${item.openingHours}`;
  return 'Opening / availability unknown';
}
export function directionsUrl(item: Activity): string {
  return item.demo ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.town)}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.source === 'curated' && item.address ? item.address : `${item.lat},${item.lon}`)}`;
}
export function safeExternal(url?: string): string | null {
  if (!url) return null;
  try { const parsed = new URL(url); return parsed.protocol === 'https:' ? parsed.href : null; } catch { return null; }
}
