import type { Activity, Category } from '../types.ts';
import { cached, remember, timedFetch } from './http.ts';

interface OsmElement { type: 'node' | 'way' | 'relation'; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }
let lastCall = 0;

function categoryFor(tags: Record<string, string>): Category | null {
  if (['restaurant', 'cafe', 'fast_food'].includes(tags.amenity ?? '')) return 'food';
  if (['pub', 'bar'].includes(tags.amenity ?? '')) return 'nightlife';
  if (['cinema', 'theatre', 'arts_centre'].includes(tags.amenity ?? '')) return 'entertainment';
  if (['museum', 'gallery'].includes(tags.tourism ?? '')) return 'culture';
  if (['attraction', 'viewpoint'].includes(tags.tourism ?? '')) return 'hidden';
  if (['park', 'nature_reserve', 'garden'].includes(tags.leisure ?? '')) return 'outdoor';
  if (['sports_centre', 'fitness_centre', 'stadium'].includes(tags.leisure ?? '')) return 'sport';
  if (tags.leisure === 'playground') return 'family';
  return null;
}

export function normaliseOsm(element: OsmElement): Activity | null {
  const tags = element.tags ?? {};
  const lat = element.lat ?? element.center?.lat, lon = element.lon ?? element.center?.lon;
  const category = categoryFor(tags);
  if (!tags.name || !category || lat === undefined || lon === undefined) return null;
  const family = category === 'family' || ['yes', 'designated'].includes(tags.child_friendly ?? '') || ['yes', 'designated'].includes(tags.kids_area ?? '');
  const address = [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']].filter(Boolean).join(' ');
  return {
    id: `osm-${element.type}-${element.id}`, name: tags.name,
    description: tags.description || `A ${category} place listed by OpenStreetMap contributors. Check details before visiting.`,
    category, lat, lon, town: tags['addr:city'] || tags['addr:town'] || tags['addr:suburb'] || 'Nearby',
    address: address || undefined, openingHours: tags.opening_hours,
    audiences: family ? ['solo', 'couple', 'friends', 'family', 'group'] : ['solo', 'couple', 'friends', 'group'],
    pricePence: tags.fee === 'no' ? 0 : undefined,
    priceNote: tags.fee === 'no' ? 'OSM lists no entry fee; confirm on site' : undefined,
    source: 'osm', sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`, demo: false,
  };
}

export async function searchOsm(lat: number, lon: number, miles: number): Promise<Activity[]> {
  const key = `osm:${lat.toFixed(2)}:${lon.toFixed(2)}:${miles}`;
  const hit = cached<Activity[]>(key);
  if (hit) return hit;
  if (Date.now() - lastCall < 1500) throw new Error('OpenStreetMap is busy. Retry shortly.');
  lastCall = Date.now();
  const radius = Math.round(miles * 1609.344);
  const query = `[out:json][timeout:15];(nwr(around:${radius},${lat},${lon})[name][amenity~"restaurant|cafe|fast_food|pub|bar|cinema|theatre|arts_centre"];nwr(around:${radius},${lat},${lon})[name][tourism~"museum|gallery|attraction|viewpoint"];nwr(around:${radius},${lat},${lon})[name][leisure~"park|nature_reserve|garden|sports_centre|fitness_centre|stadium|playground"];);out center 250;`;
  const res = await timedFetch('https://overpass.kumi.systems/api/interpreter', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `data=${encodeURIComponent(query)}`,
  }, 18000);
  if (!res.ok) throw new Error(res.status === 429 ? 'OpenStreetMap rate limit reached.' : 'OpenStreetMap places are temporarily unavailable.');
  const data = await res.json() as { elements?: OsmElement[] };
  const items = (data.elements ?? []).map(normaliseOsm).filter((item): item is Activity => item !== null);
  return remember(key, items, 20 * 60000);
}

export async function getOsm(id: string): Promise<Activity | null> {
  const match = /^osm-(node|way|relation)-(\d+)$/.exec(id);
  if (!match) return null;
  const query = `[out:json][timeout:10];${match[1]}(${match[2]});out center;`;
  const res = await timedFetch('https://overpass.kumi.systems/api/interpreter', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `data=${encodeURIComponent(query)}`,
  }, 12000);
  if (!res.ok) return null;
  const data = await res.json() as { elements?: OsmElement[] };
  return data.elements?.[0] ? normaliseOsm(data.elements[0]) : null;
}
