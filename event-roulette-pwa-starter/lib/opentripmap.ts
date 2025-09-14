export async function fetchSuggestions(lat:number, lon:number, radiusM:number, category:string) {
  const key = process.env.OPENTRIPMAP_API_KEY;
  if (!key) return [];
  const radius = Math.max(1000, radiusM || 3000);
  const url = new URL('https://api.opentripmap.com/0.1/en/places/radius');
  url.searchParams.set('radius', String(radius));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('apikey', key);
  url.searchParams.set('limit', '50');
  const catMap: Record<string,string> = {
    'nightlife': 'adult',
    'family': 'amusement',
    'activities': 'sport',
    'outdoors': 'natural',
    'culture': 'cultural',
    'cinema': 'cinema',
    'live_music': 'theatre',
    'food_drink': 'foods'
  };
  const otmCat = catMap[category?.toLowerCase() || ''] || '';
  if (otmCat) url.searchParams.set('kinds', otmCat);

  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.features || []).map((f:any) => ({
    id: f.id || f.properties?.xid || 'otm_' + Math.random().toString(36).slice(2),
    name: f.properties?.name || 'Nearby place',
    lat: f.geometry?.coordinates?.[1],
    lon: f.geometry?.coordinates?.[0],
    category: category || 'misc',
    price_band: '£',
    source_url: f.properties?.osm || undefined
  })).filter((x:any) => !!x.name);
}
