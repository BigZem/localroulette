import { DEFAULT_FILTERS, type Filters } from './types.ts';

export const FILTER_KEY = 'localroulette:filters';
const MIGRATION_KEY = 'localroulette:expanded-discovery-v1';

export function loadSavedFilters(storage: Storage): Filters {
  try {
    const saved = JSON.parse(storage.getItem(FILTER_KEY) || 'null') as Partial<Filters> | null;
    const previousDefault = saved?.location === 'Middlesbrough' && saved.radius === 10 && saved.budget === 'any'
      && saved.audience === 'friends' && saved.category === 'surprise' && saved.when === 'today'
      && saved.demo === false && saved.lat === undefined && saved.lon === undefined;
    const migrate = !storage.getItem(MIGRATION_KEY) && previousDefault;
    storage.setItem(MIGRATION_KEY, '1');
    return migrate ? DEFAULT_FILTERS : { ...DEFAULT_FILTERS, ...saved };
  } catch { return DEFAULT_FILTERS; }
}
