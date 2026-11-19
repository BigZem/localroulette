import { demoActivities } from '../lib/providers/demo.ts';
import { curatedActivities } from '../lib/providers/curated.ts';
import { distanceMiles } from '../lib/domain.ts';
import { TOWNS } from '../lib/providers/geo.ts';

console.log('LocalRoulette stored content audit');
console.log(`Demonstration ideas: ${demoActivities.length} (examples only)`);
console.log(`Reviewed curated places: ${curatedActivities.length}`);
console.log('Persistent real activity database: none');
console.log('Live Geoapify/Ticketmaster counts: request-time only; not stored');
for (const name of ['middlesbrough', 'stockton', 'redcar', 'hartlepool', 'yarm']) {
  const coords = TOWNS[name];
  if (!coords) continue;
  const nearby = items => items.filter(item => distanceMiles(coords[0], coords[1], item.lat, item.lon) <= 5).length;
  console.log(`${name}: ${nearby(curatedActivities)} reviewed places and ${nearby(demoActivities)} demonstration ideas within 5 miles`);
}
