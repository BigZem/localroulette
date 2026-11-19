import type { Activity, Category, CategoryChoice } from '../types.ts';
import { cached, remember, timedFetch } from './http.ts';

type PlaceCategory = Exclude<Category, 'events'>;
interface GeoFeature {
  geometry?: { coordinates?: number[] };
  properties?: {
    place_id?: string; name?: string; lat?: number; lon?: number; categories?: string[];
    city?: string; town?: string; suburb?: string; formatted?: string; description?: string;
    opening_hours?: string; website?: string; operator?: string;
    datasource?: { url?: string; raw?: Record<string, unknown> };
  };
}

const CATEGORY_KEYS: Record<PlaceCategory, string[]> = {
  food: ['catering.restaurant', 'catering.cafe', 'catering.fast_food'],
  nightlife: ['catering.pub', 'catering.bar'],
  entertainment: ['entertainment.cinema', 'entertainment.culture.theatre', 'entertainment.culture.arts_centre', 'entertainment.bowling_alley', 'entertainment.escape_game'],
  culture: ['entertainment.museum', 'entertainment.culture.gallery'],
  outdoor: ['leisure.park'],
  family: ['leisure.playground', 'entertainment.zoo', 'entertainment.aquarium', 'entertainment.theme_park'],
  sport: ['sport.sports_centre', 'sport.fitness', 'sport.swimming_pool'],
  hidden: ['tourism.attraction.viewpoint', 'tourism.sights.castle', 'tourism.sights.ruines'],
};
const CATEGORY_ORDER: PlaceCategory[] = ['family', 'food', 'nightlife', 'culture', 'entertainment', 'outdoor', 'sport', 'hidden'];
let nextCall = 0;

function safeHttps(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : undefined; }
  catch { return undefined; }
}
function matches(categories: string[], category: PlaceCategory): boolean {
  return CATEGORY_KEYS[category].some(prefix => categories.some(value => value === prefix || value.startsWith(`${prefix}.`)));
}
export function geoapifyCategories(category: Exclude<CategoryChoice, 'events'>): string {
  return (category === 'surprise' ? CATEGORY_ORDER.flatMap(value => CATEGORY_KEYS[value]) : CATEGORY_KEYS[category]).join(',');
}

export function normaliseGeoapify(feature: GeoFeature, selected: CategoryChoice = 'surprise'): Activity | null {
  const properties = feature.properties;
  if (!properties?.name || !properties.place_id || !/^[a-zA-Z0-9_-]{1,90}$/.test(properties.place_id)) return null;
  const categories = Array.isArray(properties.categories) ? properties.categories.filter(value => typeof value === 'string') : [];
  const category = selected !== 'surprise' && selected !== 'events' && matches(categories, selected)
    ? selected : CATEGORY_ORDER.find(value => matches(categories, value));
  if (!category) return null;
  const lat = properties.lat ?? feature.geometry?.coordinates?.[1];
  const lon = properties.lon ?? feature.geometry?.coordinates?.[0];
  if (lat === undefined || lon === undefined || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  const raw = properties.datasource?.raw ?? {};
  const childFriendly = category === 'family' || raw.child_friendly === 'yes' || raw.kids_area === 'yes';
  const openingHours = typeof properties.opening_hours === 'string' ? properties.opening_hours
    : typeof raw.opening_hours === 'string' ? raw.opening_hours : undefined;
  const freeEntry = raw.fee === 'no';
  return {
    id: `geo-${category}-${properties.place_id}`, name: properties.name,
    description: properties.description || 'A place listed by Geoapify using OpenStreetMap data. Confirm details before visiting.',
    category, lat, lon, town: properties.city || properties.town || properties.suburb || 'Nearby',
    address: properties.formatted, organiser: properties.operator, openingHours,
    pricePence: freeEntry ? 0 : undefined,
    priceNote: freeEntry ? 'Source lists no entry fee; confirm with the venue' : undefined,
    audiences: childFriendly ? ['solo', 'couple', 'friends', 'family', 'group'] : ['solo', 'couple', 'friends', 'group'],
    source: 'geoapify', sourceUrl: safeHttps(properties.website) ?? safeHttps(properties.datasource?.url), demo: false,
  };
}

export async function searchGeoapify(lat: number, lon: number, miles: number, category: CategoryChoice, apiKey: string): Promise<Activity[]> {
  if (category === 'events') return [];
  const key = `geoapify:${lat.toFixed(4)}:${lon.toFixed(4)}:${miles}:${category}`;
  const hit = cached<Activity[]>(key);
  if (hit) return hit;
  const startAt = Math.max(Date.now(), nextCall);
  nextCall = startAt + 1000;
  if (startAt > Date.now()) await new Promise(resolve => setTimeout(resolve, startAt - Date.now()));
  const radius = Math.round(miles * 1609.344);
  const params = new URLSearchParams({ categories: geoapifyCategories(category), filter: `circle:${lon},${lat},${radius}`,
    bias: `proximity:${lon},${lat}`, limit: '200', apiKey });
  const response = await timedFetch(`https://api.geoapify.com/v2/places?${params}`, {}, 9000);
  if (!response.ok) throw new Error(response.status === 429 ? 'Geoapify rate limit reached.' : 'Geoapify places are temporarily unavailable.');
  const data = await response.json() as { features?: GeoFeature[] };
  const items = (data.features ?? []).map(feature => normaliseGeoapify(feature, category)).filter((item): item is Activity => item !== null);
  return remember(key, items, 20 * 60000);
}

export async function getGeoapify(id: string, apiKey: string): Promise<Activity | null> {
  const match = /^geo-(food|entertainment|outdoor|family|sport|culture|nightlife|hidden)-([a-zA-Z0-9_-]{1,90})$/.exec(id);
  if (!match) return null;
  const params = new URLSearchParams({ id: match[2]!, apiKey });
  const response = await timedFetch(`https://api.geoapify.com/v2/place-details?${params}`, {}, 8000);
  if (!response.ok) return null;
  const data = await response.json() as { features?: GeoFeature[] };
  const item = data.features?.[0] ? normaliseGeoapify(data.features[0], match[1] as PlaceCategory) : null;
  // Geoapify can return an updated place_id for the same place. Keep the
  // originally shared ID stable across result cards, favourites and detail URLs.
  return item ? { ...item, id } : null;
}
