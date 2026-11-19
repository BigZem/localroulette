import { NextResponse } from 'next/server';
import { discover } from '@/lib/discovery.ts';
import { DEFAULT_FILTERS } from '@/lib/types.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const category = new URL(request.url).searchParams.get('category') ?? 'food';
  if (category !== 'food' && category !== 'outdoor' && category !== 'surprise')
    return NextResponse.json({ error: 'Choose food, outdoor or surprise.' }, { status: 400 });
  try {
    const result = await discover({ ...DEFAULT_FILTERS, location: 'Middlesbrough', radius: 10,
      budget: 'any', audience: 'friends', when: 'today', category, demo: false });
    const providerAvailable = !result.warnings.some(warning => /^(Geoapify|OpenStreetMap|Live place search)/.test(warning));
    return NextResponse.json({
      location: 'Middlesbrough', radiusMiles: 10, category, when: 'today',
      providerAvailable, eligibleCount: providerAvailable ? result.count : null,
      samples: providerAvailable ? result.activities.slice(0, 5).map(item => ({ id: item.id, name: item.name, town: item.town, source: item.source })) : [],
      warnings: result.warnings, checkedAt: new Date().toISOString(),
      note: 'Request-time matches, not a stored database inventory. Details may change.',
    }, { headers: { 'Cache-Control': providerAvailable ? 'public, s-maxage=600, stale-while-revalidate=300' : 'no-store' } });
  } catch {
    return NextResponse.json({ providerAvailable: false, eligibleCount: null, error: 'Coverage check is temporarily unavailable.' }, { status: 503 });
  }
}
