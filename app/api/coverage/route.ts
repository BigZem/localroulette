import { NextResponse } from 'next/server';
import { discover, SURPRISE_PLACE_GROUPS } from '@/lib/discovery.ts';
import { dedupe } from '@/lib/domain.ts';
import { searchGeoapify } from '@/lib/providers/geoapify.ts';
import { DEFAULT_FILTERS, RADIUS_CHOICES, type CategoryChoice, type When } from '@/lib/types.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const CATEGORIES = new Set(['surprise', 'food', 'outdoor', 'entertainment', 'family', 'sport', 'culture', 'nightlife', 'hidden']);

export async function GET(request: Request): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  const category = params.get('category') ?? 'surprise';
  const radius = Number(params.get('radius') ?? 20);
  const when = params.get('when') ?? 'anytime';
  if (!CATEGORIES.has(category))
    return NextResponse.json({ error: 'Choose a place category or surprise.' }, { status: 400 });
  if (!RADIUS_CHOICES.includes(radius as typeof RADIUS_CHOICES[number]) || !['anytime', 'today', 'daytime', 'tonight'].includes(when))
    return NextResponse.json({ error: 'Choose a supported radius and time.' }, { status: 400 });
  try {
    const result = await discover({ ...DEFAULT_FILTERS, location: 'Middlesbrough', radius: radius as typeof RADIUS_CHOICES[number],
      budget: 'any', audience: 'friends', when: when as When, category: category as CategoryChoice, demo: false });
    const providerAvailable = !result.warnings.some(warning => /^(Geoapify|OpenStreetMap|Live place search)/.test(warning));
    const candidateGroups = category === 'surprise' ? SURPRISE_PLACE_GROUPS : [[category as Exclude<CategoryChoice, 'events' | 'surprise'>]];
    const candidates = providerAvailable && process.env.GEOAPIFY_API_KEY
      ? dedupe((await Promise.all(candidateGroups.map(group => searchGeoapify(result.searchedFrom.lat, result.searchedFrom.lon, radius, group, process.env.GEOAPIFY_API_KEY!)))).flat())
      : null;
    const byCategory = Object.fromEntries([...new Set(result.activities.map(item => item.category))]
      .map(value => [value, result.activities.filter(item => item.category === value).length]));
    return NextResponse.json({
      location: 'Middlesbrough', radiusMiles: radius, category, when,
      providerAvailable, eligibleCount: providerAvailable ? result.count : null,
      eligibleCuratedCount: result.activities.filter(item => item.source === 'curated').length,
      eligibleProviderCount: result.activities.filter(item => item.source !== 'curated').length,
      withListedHours: result.activities.filter(item => item.openingHours || item.startsAt).length,
      byCategory,
      candidateCount: candidates?.length ?? null,
      candidatesWithOpeningHours: candidates?.filter(item => item.openingHours).length ?? null,
      samples: providerAvailable ? result.activities.slice(0, 5).map(item => ({ id: item.id, name: item.name, town: item.town, source: item.source })) : [],
      warnings: result.warnings, checkedAt: new Date().toISOString(),
      note: 'Request-time matches, not a stored database inventory. Details may change.',
    }, { headers: { 'Cache-Control': providerAvailable ? 'public, s-maxage=600, stale-while-revalidate=300' : 'no-store' } });
  } catch {
    return NextResponse.json({ providerAvailable: false, eligibleCount: null, error: 'Coverage check is temporarily unavailable.' }, { status: 503 });
  }
}
