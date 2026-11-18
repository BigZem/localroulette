import { NextResponse } from 'next/server';
import { parseFilters, ukDate } from '@/lib/domain.ts';
import { discover } from '@/lib/discovery.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const text = await request.text();
    if (text.length > 4096) return NextResponse.json({ error: 'Search request is too large.' }, { status: 413 });
    let payload: unknown;
    try { payload = JSON.parse(text) as unknown; }
    catch { return NextResponse.json({ error: 'Invalid JSON request.' }, { status: 400 }); }
    const filters = parseFilters(payload);
    if (!filters) return NextResponse.json({ error: 'Please check your location and filters.' }, { status: 400 });
    if (filters.when === 'date' && filters.date && filters.date < ukDate())
      return NextResponse.json({ error: 'Please choose today or a future date.' }, { status: 400 });
    const result = await discover(filters);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Discovery is temporarily unavailable.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
