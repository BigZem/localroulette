import { NextResponse } from 'next/server';
import { getActivity } from '@/lib/discovery.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const activity = await getActivity(id);
    if (!activity) return NextResponse.json({ error: 'Activity not found or no longer available.' }, { status: 404 });
    return NextResponse.json({ activity }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not load this activity right now.' }, { status: 503 });
  }
}
