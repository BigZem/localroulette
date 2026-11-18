import type { Activity, Category } from '../types.ts';
import { cached, remember, timedFetch } from './http.ts';

interface TicketmasterEvent {
  id: string; name: string; url?: string; info?: string;
  dates?: { start?: { dateTime?: string }; end?: { dateTime?: string } };
  priceRanges?: Array<{ min?: number; currency?: string }>;
  classifications?: Array<{ segment?: { name?: string }; genre?: { name?: string } }>;
  promoter?: { name?: string };
  _embedded?: { venues?: Array<{ name?: string; location?: { latitude?: string; longitude?: string }; city?: { name?: string }; address?: { line1?: string } }> };
}

export function normaliseTicketmaster(event: TicketmasterEvent): Activity | null {
  const venue = event._embedded?.venues?.[0];
  const lat = Number(venue?.location?.latitude), lon = Number(venue?.location?.longitude);
  const startsAt = event.dates?.start?.dateTime;
  if (!event.id || !event.name || !Number.isFinite(lat) || !Number.isFinite(lon) || !startsAt) return null;
  const segment = event.classifications?.[0]?.segment?.name?.toLowerCase() ?? '';
  const genre = event.classifications?.[0]?.genre?.name?.toLowerCase() ?? '';
  const category: Category = segment.includes('sport') ? 'sport' : genre.includes('family') ? 'family' : 'events';
  const range = event.priceRanges?.find(item => item.currency === 'GBP' && typeof item.min === 'number');
  return {
    id: `tm-${event.id}`, name: event.name,
    description: event.info?.slice(0, 400) || 'A live event listed by Ticketmaster. Confirm details with the organiser.',
    category, lat, lon, town: venue?.city?.name || 'Nearby', address: venue?.address?.line1,
    venue: venue?.name, organiser: event.promoter?.name, startsAt, endsAt: event.dates?.end?.dateTime,
    pricePence: range ? Math.round((range.min ?? 0) * 100) : undefined,
    priceNote: range ? 'Provider listed price; fees and availability may change' : undefined,
    audiences: category === 'family' ? ['solo', 'couple', 'friends', 'family', 'group'] : ['solo', 'couple', 'friends', 'group'],
    source: 'ticketmaster', sourceUrl: event.url?.startsWith('https://') ? event.url : undefined, demo: false,
  };
}

export async function searchTicketmaster(lat: number, lon: number, miles: number, apiKey: string): Promise<Activity[]> {
  const key = `tm:${lat.toFixed(2)}:${lon.toFixed(2)}:${miles}`;
  const hit = cached<Activity[]>(key);
  if (hit) return hit;
  const params = new URLSearchParams({ apikey: apiKey, latlong: `${lat},${lon}`, radius: String(miles), unit: 'miles', countryCode: 'GB', size: '100', sort: 'date,asc' });
  const res = await timedFetch(`https://app.ticketmaster.com/discovery/v2/events.json?${params}`, {}, 8000);
  if (!res.ok) throw new Error(res.status === 429 ? 'Ticketmaster rate limit reached.' : 'Ticketmaster events are temporarily unavailable.');
  const data = await res.json() as { _embedded?: { events?: TicketmasterEvent[] } };
  return remember(key, (data._embedded?.events ?? []).map(normaliseTicketmaster).filter((item): item is Activity => item !== null), 10 * 60000);
}

export async function getTicketmaster(id: string, apiKey: string): Promise<Activity | null> {
  const eventId = id.startsWith('tm-') ? id.slice(3) : '';
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(eventId)) return null;
  const url = `https://app.ticketmaster.com/discovery/v2/events/${encodeURIComponent(eventId)}.json?apikey=${encodeURIComponent(apiKey)}`;
  const res = await timedFetch(url, {}, 8000);
  return res.ok ? normaliseTicketmaster(await res.json() as TicketmasterEvent) : null;
}
