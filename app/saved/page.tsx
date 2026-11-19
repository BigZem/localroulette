'use client';

import Link from 'next/link';
import { ActivityCard } from '@/components/ActivityCard';
import { useFavorites } from '@/components/use-favorites';

export default function SavedPage() {
  const { saved, toggle, isSaved } = useFavorites();
  return <main className="container page"><div className="page-heading"><span className="eyebrow">YOUR SHORTLIST</span><h1>Good ideas, <em>kept close.</em></h1><p>Saved on this device. No account required.</p></div>
    {saved.length ? <><div className="results-heading"><h2>{saved.length} saved {saved.length === 1 ? 'activity' : 'activities'}</h2><span>Stored in this browser</span></div><div className="card-grid">{saved.map(item => <ActivityCard key={item.id} item={item} saved={isSaved(item.id)} onSave={toggle}/>)}</div></>
      : <div className="empty-state"><span>♡</span><h2>Nothing saved yet.</h2><p>When the wheel lands on something good, keep it here for later.</p><Link className="button primary" href="/">SPIN FOR AN IDEA ↗</Link></div>}
  </main>;
}
