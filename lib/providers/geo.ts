import type { Filters } from '../types.ts';
import { cached, remember, timedFetch } from './http.ts';

export const TOWNS: Record<string, [number, number]> = {
  middlesbrough: [54.5742, -1.2350], stockton: [54.5682, -1.3144], 'stockton-on-tees': [54.5682, -1.3144],
  redcar: [54.6160, -1.0670], hartlepool: [54.6857, -1.2129], yarm: [54.5036, -1.3579],
  billingham: [54.6079, -1.2910], guisborough: [54.5359, -1.0549], 'saltburn-by-the-sea': [54.5827, -0.9736],
  darlington: [54.5236, -1.5595], stokesley: [54.4708, -1.1934], thornaby: [54.5590, -1.2690],
  newcastle: [54.9783, -1.6178], york: [53.9591, -1.0815],
};
let lastLookup = 0;

export async function resolveLocation(filters: Filters): Promise<[number, number]> {
  if (filters.lat !== undefined && filters.lon !== undefined) return [filters.lat, filters.lon];
  const query = filters.location.toLocaleLowerCase('en-GB').trim();
  const town = TOWNS[query];
  if (town) return town;
  const key = `geo:${query}`;
  const hit = cached<[number, number]>(key);
  if (hit) return hit;
  if (/^[a-z]{1,2}\d[a-z\d]?\s*\d[a-z]{2}$/i.test(query)) {
    const res = await timedFetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(query.replace(/\s/g, ''))}`, {}, 6000);
    if (res.ok) {
      const data = await res.json() as { result?: { latitude?: number; longitude?: number } };
      if (typeof data.result?.latitude === 'number' && typeof data.result.longitude === 'number')
        return remember(key, [data.result.latitude, data.result.longitude], 86400000);
    }
  }
  if (Date.now() - lastLookup < 1200) throw new Error('Location lookup is busy. Please retry in a moment.');
  lastLookup = Date.now();
  const params = new URLSearchParams({ q: `${filters.location}, United Kingdom`, format: 'jsonv2', limit: '1', countrycodes: 'gb' });
  const res = await timedFetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { 'User-Agent': 'LocalRoulette/0.2 (Teesside discovery app)', Accept: 'application/json' } });
  if (!res.ok) throw new Error('Location lookup is unavailable. Try a Teesside town or full postcode.');
  const data = await res.json() as Array<{ lat: string; lon: string }>;
  if (!data[0]) throw new Error('Location not found. Try a nearby town or full postcode.');
  const coords: [number, number] = [Number(data[0].lat), Number(data[0].lon)];
  if (!coords.every(Number.isFinite)) throw new Error('Location lookup returned an invalid result.');
  return remember(key, coords, 86400000);
}
