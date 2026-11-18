import Link from 'next/link';
import { ActivityCard } from '@/components/ActivityCard';
import { DetailActions } from '@/components/DetailActions';
import { getActivity } from '@/lib/discovery.ts';
import { directionsUrl, priceLabel, safeExternal, whenLabel } from '@/lib/presentation.ts';
import { AUDIENCE_LABELS, CATEGORY_LABELS } from '@/lib/types.ts';
import type { Activity } from '@/lib/types.ts';

export const dynamic = 'force-dynamic';
export default async function ActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let item: Activity | null;
  try { item = await getActivity(id); } catch { item = null; }
  if (!item) return <main className="container page"><div className="empty-state"><span>◌</span><h1>Activity unavailable.</h1><p>This listing may have changed, or its provider may be temporarily offline.</p><Link className="button primary" href="/discover">DISCOVER MORE ↗</Link></div></main>;
  const official = safeExternal(item.sourceUrl), affiliate = item.affiliateDisclosure ? safeExternal(item.affiliateUrl) : null;
  return <main className="container page detail-page"><Link className="back-link" href="/discover">← Back to discover</Link>
    <div className="detail-hero"><div className="detail-art"><ActivityCard item={item}/></div><div><span className="eyebrow">{CATEGORY_LABELS[item.category]} · {item.demo ? 'DEMO IDEA' : item.source.toUpperCase()}</span><h1>{item.name}</h1><p>{item.description}</p><DetailActions item={item}/></div></div>
    <div className="detail-grid"><section><span className="eyebrow">THE DETAILS</span><h2>Know before you go.</h2><div className="detail-list">
      <div><strong>Where</strong><span>{item.address || item.town}{item.distanceMiles !== undefined ? ` · ${item.distanceMiles} miles away` : ''}</span></div>
      <div><strong>Budget</strong><span>{priceLabel(item)}{item.priceNote ? ` · ${item.priceNote}` : ''}</span></div>
      <div><strong>When</strong><span>{whenLabel(item)}</span></div>
      <div><strong>May suit</strong><span>{item.audiences.map(value => AUDIENCE_LABELS[value]).join(', ')} · check age and access rules</span></div>
      {item.venue && <div><strong>Venue</strong><span>{item.venue}</span></div>}{item.organiser && <div><strong>Organiser</strong><span>{item.organiser}</span></div>}
      <div><strong>Source</strong><span>{item.source === 'osm' ? 'OpenStreetMap contributors' : item.source === 'ticketmaster' ? 'Ticketmaster' : item.demo ? 'Demonstration idea' : 'LocalRoulette curated'}</span></div>
    </div></section><aside className="detail-aside"><h3>A little heads-up.</h3><p>{item.demo ? 'This is a demonstration idea, not a verified live listing.' : 'Prices, opening times and event availability can change. Confirm with the venue or organiser before travelling.'}</p>
      <a href={directionsUrl(item)} target="_blank" rel="noopener noreferrer">Open map ↗</a>{official && <a href={official} target="_blank" rel="noopener noreferrer">View source / booking ↗</a>}{affiliate && <><a href={affiliate} target="_blank" rel="noopener noreferrer sponsored">Offer (affiliate link) ↗</a><small>{item.affiliateDisclosure}</small></>}
    </aside></div>
  </main>;
}
