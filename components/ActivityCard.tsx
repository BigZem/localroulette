'use client';

import Link from 'next/link';
import type { Activity } from '@/lib/types.ts';
import { CATEGORY_LABELS } from '@/lib/types.ts';
import { priceLabel } from '@/lib/presentation.ts';
const ICONS: Record<Activity['category'], string> = { food: '◌', entertainment: '✦', outdoor: '↟', family: '♡', sport: '↗', culture: '◈', nightlife: '☾', events: '♫', hidden: '✧' };

export function ActivityCard({ item, saved, onSave }: { item: Activity; saved?: boolean; onSave?: (item: Activity) => void }) {
  return <article className="activity-card">
    <div className={`activity-art art-${item.category}`} aria-hidden="true"><span>{ICONS[item.category]}</span><i/><b/></div>
    <div className="activity-body"><div className="activity-kicker"><span>{CATEGORY_LABELS[item.category]}</span><span>{item.demo ? 'DEMO IDEA' : item.source === 'osm' ? 'OPENSTREETMAP' : item.source === 'ticketmaster' ? 'TICKETMASTER' : 'CURATED'}</span></div>
      <h3><Link href={`/activity/${encodeURIComponent(item.id)}`}>{item.name}</Link></h3><p>{item.description}</p>
      <div className="activity-meta"><span>⌖ {item.town}{item.distanceMiles !== undefined ? ` · ${item.distanceMiles} mi` : ''}</span><span>{priceLabel(item)}</span></div>
      <div className="activity-actions"><Link href={`/activity/${encodeURIComponent(item.id)}`}>View details ↗</Link>{onSave && <button type="button" onClick={() => onSave(item)} aria-label={saved ? 'Remove saved activity' : 'Save activity'}>{saved ? '♥' : '♡'}</button>}</div>
    </div>
  </article>;
}
