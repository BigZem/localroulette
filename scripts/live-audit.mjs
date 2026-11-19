import { setTimeout as delay } from 'node:timers/promises';
import { discover } from '../lib/discovery.ts';
import { osmQuery } from '../lib/providers/osm.ts';
import { DEFAULT_FILTERS } from '../lib/types.ts';

console.log('Live content audit — Middlesbrough, 10 miles, today, friends, any budget');
console.log('Counts are request-time matches among up to 250 provider records per category; they are not stored database totals.');

for (const category of ['food', 'outdoor']) {
  const result = await discover({ ...DEFAULT_FILTERS, category, demo: false });
  const providerFailed = result.warnings.some(warning => warning.includes('OpenStreetMap'));
  console.log(providerFailed ? `${category}: provider unavailable` : `${category}: ${result.count} eligible places`);
  for (const warning of result.warnings) console.log(`  Provider note: ${warning}`);
  await delay(1600); // Respect the per-instance Overpass request interval.
}

for (const [name, query] of [
  ['minimal GET', '[out:json][timeout:5];node(1);out;'],
  ['food GET', osmQuery(54.5742, -1.235, 10, 'food')],
]) {
  try {
    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(10000) });
    console.log(`Official Overpass ${name}: HTTP ${response.status}`);
    if (response.ok) console.log(`  Elements: ${(await response.json()).elements?.length ?? 0}`);
    else console.log(`  Detail: ${(await response.text()).replace(/\s+/g, ' ').slice(0, 100)}`);
  } catch (error) { console.log(`Official Overpass ${name}: ${error instanceof Error ? error.name : 'request failed'}`); }
}
