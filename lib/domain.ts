import { AUDIENCE_CHOICES, BUDGET_CHOICES, CATEGORY_CHOICES, RADIUS_CHOICES, WHEN_CHOICES, type Activity, type Filters } from './types.ts';

export function parseFilters(value: unknown): Filters | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  const location = typeof v.location === 'string' ? v.location.trim().slice(0, 100) : '';
  const lat = typeof v.lat === 'number' && Number.isFinite(v.lat) && Math.abs(v.lat) <= 90 ? v.lat : undefined;
  const lon = typeof v.lon === 'number' && Number.isFinite(v.lon) && Math.abs(v.lon) <= 180 ? v.lon : undefined;
  if (!location && (lat === undefined || lon === undefined)) return null;
  if ((lat === undefined) !== (lon === undefined)) return null;
  if (!RADIUS_CHOICES.includes(v.radius as Filters['radius'])) return null;
  if (!BUDGET_CHOICES.includes(v.budget as Filters['budget'])) return null;
  if (!AUDIENCE_CHOICES.includes(v.audience as Filters['audience'])) return null;
  if (!CATEGORY_CHOICES.includes(v.category as Filters['category'])) return null;
  if (!WHEN_CHOICES.includes(v.when as Filters['when'])) return null;
  const date = typeof v.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.date) ? v.date : undefined;
  if (v.when === 'date' && !date) return null;
  return { location, lat, lon, radius: v.radius as Filters['radius'], budget: v.budget as Filters['budget'],
    audience: v.audience as Filters['audience'], category: v.category as Filters['category'], when: v.when as Filters['when'], date, demo: v.demo === true };
}

export function distanceMiles(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const rad = Math.PI / 180;
  const a = Math.sin((bLat - aLat) * rad / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin((bLon - aLon) * rad / 2) ** 2;
  return 3958.76 * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function ukDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function ukMinutes(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? 0);
  return get('hour') * 60 + get('minute');
}
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
function listedIntervals(hours: string, date: string): Array<[number, number]> {
  if (hours.trim() === '24/7') return [[0, 1440]];
  const day = DAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];
  const result: Array<[number, number]> = [];
  for (const rule of hours.split(';')) {
    const match = /^\s*([A-Za-z,-]*)\s*(\d{2}:\d{2}(?:-\d{2}:\d{2})(?:,\d{2}:\d{2}-\d{2}:\d{2})*)\s*$/.exec(rule);
    if (!match) continue; // Do not guess at holidays or complex OSM opening_hours syntax.
    const spec = match[1] || 'Su-Sa';
    const allowed = new Set<string>();
    for (const part of spec.split(',')) {
      const [from, to = from] = part.split('-');
      if (!from || !DAYS.includes(from) || !DAYS.includes(to)) continue;
      let i = DAYS.indexOf(from);
      while (true) { allowed.add(DAYS[i]!); if (DAYS[i] === to) break; i = (i + 1) % 7; }
    }
    if (!day || !allowed.has(day)) continue;
    for (const period of (match[2] || '').split(',')) {
      const [start, end] = period.split('-');
      if (!start || !end) continue;
      const minute = (text: string) => { const [h, m] = text.split(':').map(Number); return (h ?? 0) * 60 + (m ?? 0); };
      const a = minute(start), b = minute(end);
      if (a >= 0 && a < 1440 && b >= 0 && b <= 1440) result.push([a, b <= a ? b + 1440 : b]);
    }
  }
  return result;
}

function periodsOnDate(hours: string, date: string): Array<[number, number]> {
  const previous = new Date(`${date}T12:00:00Z`);
  previous.setUTCDate(previous.getUTCDate() - 1);
  const previousDate = previous.toISOString().slice(0, 10);
  const afterMidnight = listedIntervals(hours, previousDate).filter(([, end]) => end > 1440)
    .map(([start, end]): [number, number] => [start - 1440, end - 1440]);
  return [...afterMidnight, ...listedIntervals(hours, date)];
}

function matchesTime(activity: Activity, filters: Filters, now: Date): boolean {
  if (activity.demo) return true; // Example ideas never claim venue availability.
  const today = ukDate(now);
  if (activity.startsAt) {
    const start = new Date(activity.startsAt);
    if (Number.isNaN(start.getTime())) return false;
    const end = activity.endsAt ? new Date(activity.endsAt) : null;
    if (!(start > now || (end && end > now))) return false;
    const date = ukDate(start);
    if (filters.when === 'date') return date === filters.date;
    if (filters.when === 'today') return date === today;
    if (filters.when === 'now') return start <= now && end !== null && end > now;
    if (filters.when === 'tonight') return date === today && ukMinutes(start) >= 1080;
    const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
    const saturday = new Date(`${today}T12:00:00Z`);
    saturday.setUTCDate(saturday.getUTCDate() + (6 - weekday + 7) % 7);
    const sunday = new Date(saturday); sunday.setUTCDate(sunday.getUTCDate() + 1);
    return date === ukDate(saturday) || date === ukDate(sunday);
  }
  if (!activity.openingHours) return false;
  if (filters.when === 'date' && filters.date) return periodsOnDate(activity.openingHours, filters.date).length > 0;
  if (filters.when === 'weekend') {
    const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
    const saturday = new Date(`${today}T12:00:00Z`); saturday.setUTCDate(saturday.getUTCDate() + (6 - weekday + 7) % 7);
    const sunday = new Date(saturday); sunday.setUTCDate(sunday.getUTCDate() + 1);
    return periodsOnDate(activity.openingHours, ukDate(saturday)).length > 0 || periodsOnDate(activity.openingHours, ukDate(sunday)).length > 0;
  }
  const periods = periodsOnDate(activity.openingHours, today);
  const minute = ukMinutes(now);
  if (activity.lastAdmissionAt && filters.when !== 'date') {
    const match = /^(\d{2}):(\d{2})$/.exec(activity.lastAdmissionAt);
    if (match && minute >= Number(match[1]) * 60 + Number(match[2])) return false;
  }
  if (filters.when === 'now') return periods.some(([a, b]) => a <= minute && b > minute);
  if (filters.when === 'today') return periods.some(([, b]) => b > minute);
  return periods.some(([a, b]) => a < 1440 && b > Math.max(1080, minute));
}

function matchesBudget(activity: Activity, budget: Filters['budget']): boolean {
  if (budget === 'any') return true;
  const price = activity.pricePence;
  if (price === undefined) return false;
  if (budget === 'free') return price === 0;
  if (budget === 'under10') return price < 1000;
  if (budget === 'under25') return price < 2500;
  if (budget === 'under50') return price < 5000;
  return price >= 5000;
}

export function eligible(items: Activity[], filters: Filters, now = new Date()): Activity[] {
  return items.filter(item => item.demo === filters.demo && (item.distanceMiles === undefined || item.distanceMiles <= filters.radius)
    && (filters.category === 'surprise' || item.category === filters.category)
    && item.audiences.includes(filters.audience) && matchesBudget(item, filters.budget) && matchesTime(item, filters, now));
}

export function dedupe(items: Activity[]): Activity[] {
  const result: Activity[] = [];
  for (const item of items) {
    const name = item.name.toLocaleLowerCase('en-GB').replace(/[^a-z0-9]/g, '');
    if (!result.some(existing => existing.name.toLocaleLowerCase('en-GB').replace(/[^a-z0-9]/g, '') === name
      && distanceMiles(existing.lat, existing.lon, item.lat, item.lon) < 0.1)) result.push(item);
  }
  return result;
}
