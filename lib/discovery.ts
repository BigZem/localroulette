import { dedupe, distanceMiles, eligible } from './domain.ts';
import type { Activity, Filters } from './types.ts';
import { curatedActivities } from './providers/curated.ts';
import { demoActivities } from './providers/demo.ts';
import { resolveLocation } from './providers/geo.ts';
import { getOsm, searchOsm } from './providers/osm.ts';
import { getTicketmaster, searchTicketmaster } from './providers/ticketmaster.ts';

const recent = new Map<string, Activity>();
export interface DiscoveryResult { activities: Activity[]; count: number; demo: boolean; warnings: string[]; searchedFrom: { lat: number; lon: number } }

export async function discover(filters: Filters): Promise<DiscoveryResult> {
  const [lat, lon] = await resolveLocation(filters);
  let items: Activity[] = filters.demo ? [...demoActivities] : [...curatedActivities];
  const warnings: string[] = [];
  if (filters.demo) warnings.push('Demonstration ideas are examples. Their opening times and dates are not verified, so check details before going.');
  if (!filters.demo) {
    const providers: Array<Promise<Activity[]>> = filters.category === 'events' ? [] : [searchOsm(lat, lon, filters.radius, filters.category)];
    const key = process.env.TICKETMASTER_API_KEY;
    const wantsEvents = ['surprise', 'events', 'sport', 'family'].includes(filters.category);
    if (wantsEvents && key) providers.push(searchTicketmaster(lat, lon, filters.radius, key));
    else if (wantsEvents) warnings.push(filters.category === 'events'
      ? 'Live event search requires the optional Ticketmaster API key.'
      : 'Live events require the optional Ticketmaster API key. OpenStreetMap places can still load.');
    for (const result of await Promise.allSettled(providers)) {
      if (result.status === 'fulfilled') items.push(...result.value);
      else warnings.push(result.reason instanceof Error ? result.reason.message : 'A discovery provider failed.');
    }
  }
  items = dedupe(items.map(item => ({ ...item, distanceMiles: Math.round(distanceMiles(lat, lon, item.lat, item.lon) * 10) / 10 })));
  items = eligible(items, filters);
  for (const item of items) recent.set(item.id, item);
  if (recent.size > 1000) recent.clear();
  return { activities: items.slice(0, 250), count: items.length, demo: filters.demo, warnings, searchedFrom: { lat, lon } };
}

export async function getActivity(id: string): Promise<Activity | null> {
  if (!/^[a-zA-Z0-9_-]{1,110}$/.test(id)) return null;
  if (id.startsWith('demo-')) return demoActivities.find(item => item.id === id) ?? null;
  if (id.startsWith('curated-')) return curatedActivities.find(item => item.id === id) ?? null;
  if (recent.has(id)) return recent.get(id) ?? null;
  if (id.startsWith('osm-')) return getOsm(id);
  if (id.startsWith('tm-') && process.env.TICKETMASTER_API_KEY) return getTicketmaster(id, process.env.TICKETMASTER_API_KEY);
  return null;
}
