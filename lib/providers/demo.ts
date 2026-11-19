import type { Activity, Audience, Category } from '../types.ts';

const everyone: Audience[] = ['solo', 'couple', 'friends', 'family', 'group'];
const adults: Audience[] = ['solo', 'couple', 'friends', 'group'];
const ideas: Array<[string, Category, number, number, string, string, number | undefined, Audience[]]> = [
  ['Riverside wander', 'outdoor', 54.5682, -1.3144, 'Stockton-on-Tees', 'An example idea for a relaxed walk by the Tees. Plan a route and check conditions.', 0, everyone],
  ['Coastal photo walk', 'outdoor', 54.6160, -1.0670, 'Redcar', 'An example idea for sea air and photos. Check weather, tides and access first.', 0, everyone],
  ['Park picnic', 'family', 54.5742, -1.2350, 'Middlesbrough', 'An example family idea. Bring your own food and check facilities before travelling.', 0, everyone],
  ['Independent café crawl', 'food', 54.5036, -1.3579, 'Yarm', 'An example food idea. Choose real cafés and check their menus and opening hours.', undefined, adults],
  ['Gallery afternoon', 'culture', 54.5742, -1.2350, 'Middlesbrough', 'An example culture idea. Check current exhibitions and entry information.', undefined, everyone],
  ['Comedy night search', 'entertainment', 54.6857, -1.2129, 'Hartlepool', 'An example plan: find a confirmed local comedy show before heading out.', undefined, adults],
  ['Waterside run', 'sport', 54.5682, -1.3144, 'Stockton-on-Tees', 'An example fitness idea. Choose a route for your ability and conditions.', 0, adults],
  ['Date night dinner', 'food', 54.5742, -1.2350, 'Middlesbrough', 'An example date idea. Pick a restaurant and verify its menu and booking first.', undefined, ['couple']],
  ['Evening music search', 'nightlife', 54.5742, -1.2350, 'Middlesbrough', 'An example plan: find a confirmed music venue or event for your evening.', undefined, adults],
  ['Local market browse', 'hidden', 54.5036, -1.3579, 'Yarm', 'An example discovery idea. Confirm that a market is scheduled before travelling.', undefined, everyone],
  ['Family museum visit', 'family', 54.5682, -1.3144, 'Stockton-on-Tees', 'An example family plan. Check a museum’s exhibitions and admission.', undefined, everyone],
  ['Live event hunt', 'events', 54.5742, -1.2350, 'Middlesbrough', 'An example prompt to browse confirmed local events. This is not an actual event listing.', undefined, adults],
];

export const demoActivities: Activity[] = ideas.map(([name, category, lat, lon, town, description, pricePence, audiences], index) => ({
  id: `demo-${index + 1}`, name, category, lat, lon, town, description, pricePence, audiences,
  priceNote: pricePence === 0 ? 'Free idea; personal costs may be extra' : undefined,
  source: 'demo', demo: true,
}));
