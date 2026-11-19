import { discover } from '../lib/discovery.ts';
import { DEFAULT_FILTERS } from '../lib/types.ts';

console.log(`Live content audit — Middlesbrough, ${DEFAULT_FILTERS.radius} miles, ${DEFAULT_FILTERS.when}, friends, any budget`);
console.log('Counts are request-time matches among bounded provider samples; they are not stored database totals.');
console.log(`Place provider: ${process.env.GEOAPIFY_API_KEY ? 'Geoapify' : process.env.ENABLE_PUBLIC_OVERPASS === 'true' ? 'public Overpass (diagnostic)' : 'none configured'}`);

for (const category of ['food', 'outdoor', 'surprise']) {
  const result = await discover({ ...DEFAULT_FILTERS, category, demo: false });
  const providerFailed = result.warnings.some(warning => /^(Geoapify|OpenStreetMap|Live place search)/.test(warning));
  console.log(providerFailed ? `${category}: provider unavailable` : `${category}: ${result.count} eligible places`);
  for (const warning of result.warnings) console.log(`  Provider note: ${warning}`);
}
