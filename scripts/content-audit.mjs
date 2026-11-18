import { demoActivities } from '../lib/providers/demo.ts';
import { curatedActivities } from '../lib/providers/curated.ts';
import { distanceMiles } from '../lib/domain.ts';
import { TOWNS } from '../lib/providers/geo.ts';

console.log('LocalRoulette stored content audit');
console.log(`Demonstration ideas: ${demoActivities.length} (examples only)`);
console.log(`Verified curated places/events: ${curatedActivities.length}`);
console.log('Persistent real activity database: none');
console.log('Live OSM/Ticketmaster counts: request-time only; not stored');
for (const name of ['middlesbrough', 'stockton', 'redcar', 'hartlepool', 'yarm']) {
  const coords = TOWNS[name];
  if (!coords) continue;
  console.log(`${name}: ${demoActivities.filter(item => distanceMiles(coords[0], coords[1], item.lat, item.lon) <= 5).length} demonstration ideas within 5 miles`);
}
