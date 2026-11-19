import { setTimeout as delay } from 'node:timers/promises';
import { discover } from '../lib/discovery.ts';
import { DEFAULT_FILTERS } from '../lib/types.ts';

console.log('Live content audit — Middlesbrough, 10 miles, today, friends, any budget');
console.log('Counts are request-time matches among up to 250 provider records per category; they are not stored database totals.');

for (const category of ['food', 'outdoor']) {
  const result = await discover({ ...DEFAULT_FILTERS, category, demo: false });
  const providerFailed = result.warnings.some(warning => warning.includes('OpenStreetMap'));
  console.log(`${category}: ${providerFailed ? 'unavailable' : result.count} eligible places`);
  for (const warning of result.warnings) console.log(`  Provider note: ${warning}`);
  await delay(1600); // Respect the per-instance Overpass request interval.
}
