import { NextResponse } from 'next/server';
import { discover, SURPRISE_PLACE_CATEGORIES } from '@/lib/discovery.ts';
import { dedupe } from '@/lib/domain.ts';
import { searchGeoapify } from '@/lib/providers/geoapify.ts';
import { DEFAULT_FILTERS, type CategoryChoice } from '@/lib/types.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const CATEGORIES = new Set(['surprise', 'food', 'outdoor', 'entertainment', 'family', 'sport', 'culture', 'nightlife', 'hidden']);

export async function GET(request: Request): Promise<NextResponse> {
  const category = new URL(request.url).searchParams.get('category') ?? 'food';
  if (!CATEGORIES.has(category))
    return NextResponse.json({ error: 'Choose a place category or surprise.' }, { status: 400 });
  try {
    const result = await discover({ ...DEFAULT_FILTERS, location: 'Middlesbrough', radius: 10,
      budget: 'any', audience: 'friends', when: 'today', category: category as CategoryChoice, demo: false });
    const providerAvailable = !result.warnings.some(warning => /^(Geoapify|OpenStreetMap|Live place search)/.test(warning));
    const candidateCategories = category === 'surprise' ? SURPRISE_PLACE_CATEGORIES : [category as Exclude<CategoryChoice, 'events' | 'surprise'>];
    const candidates = providerAvailable && process.env.GEOAPIFY_API_KEY
      ? dedupe((await Promise.all(candidateCategories.map(value => searchGeoapify(result.searchedFrom.lat, result.searchedFrom.lon, 10, value, process.env.GEOAPIFY_API_KEY!)))).flat())
      : null;
    return NextResponse.json({
      location: 'Middlesbrough', radiusMiles: 10, category, when: 'today',
      providerAvailable, eligibleCount: providerAvailable ? result.count : null,
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
