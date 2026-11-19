'use client';

import { useEffect, useState } from 'react';
import { ActivityCard } from '@/components/ActivityCard';
import { FiltersPanel } from '@/components/Filters';
import { useFavorites } from '@/components/use-favorites';
import { parseFilters } from '@/lib/domain.ts';
import { DEFAULT_FILTERS, type Activity, type Filters } from '@/lib/types.ts';
import type { DiscoveryResult } from '@/lib/discovery.ts';

export default function DiscoverPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS), [ready, setReady] = useState(false);
  const [items, setItems] = useState<Activity[]>([]), [searched, setSearched] = useState(false), [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(''), [warnings, setWarnings] = useState<string[]>([]);
  const { toggle, isSaved } = useFavorites();
  useEffect(() => { try { setFilters({ ...DEFAULT_FILTERS, ...(JSON.parse(localStorage.getItem('localroulette:filters') || '{}') as Partial<Filters>) }); } catch { /* Defaults. */ } setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem('localroulette:filters', JSON.stringify(filters)); } catch { /* Storage optional. */ } }, [filters, ready]);
  async function search() {
    const valid = parseFilters(filters);
    if (!valid) { setMessage('Please enter a location and check your filters.'); return; }
    setBusy(true); setMessage(''); setWarnings([]);
    try {
      const response = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(valid) });
      const data = await response.json() as DiscoveryResult & { error?: string };
      if (!response.ok) throw new Error(data.error || 'Search failed.');
      setItems(data.activities); setWarnings(data.warnings); setSearched(true);
    } catch (error) { setMessage(navigator.onLine === false ? 'You are offline. Reconnect for live discovery.' : error instanceof Error ? error.message : 'Could not search right now.'); }
    finally { setBusy(false); }
  }
  return <main className="container page"><div className="page-heading"><span className="eyebrow">GO ON, GET OUT THERE</span><h1>Discover your next <em>good day.</em></h1><p>Browse matching places and events without using a spin.</p></div>
    <FiltersPanel compact filters={filters} onChange={setFilters} onMessage={setMessage}/>
    <div className="search-row"><button className="button primary" type="button" onClick={() => void search()} disabled={busy}>{busy ? 'SEARCHING…' : 'FIND ACTIVITIES ↗'}</button><span>Results depend on provider availability.</span></div>
    {message && <div className="notice" role="status">{message}</div>}{warnings.length > 0 && <div className="provider-note" role="status">{warnings.join(' ')}</div>}
    {searched ? <><div className="results-heading"><h2>{items.length} matching {items.length === 1 ? 'idea' : 'ideas'}</h2><span>{filters.demo ? 'Demonstration mode' : 'Live discovery'}</span></div>
      {items.length ? <div className="card-grid">{items.map(item => <ActivityCard key={item.id} item={item} saved={isSaved(item.id)} onSave={toggle}/>)}</div>
        : <div className="empty-state"><span>✦</span><h2>{warnings.some(warning => warning.startsWith('OpenStreetMap') || warning.startsWith('Ticketmaster')) ? 'Live discovery is unavailable.' : 'No matches this time.'}</h2><p>Try a larger radius, any budget, another category or clearly labelled demo ideas. Unknown prices and opening times are excluded when a filter needs them.</p><button className="button secondary" type="button" onClick={() => setFilters(previous => ({ ...previous, radius: 50, budget: 'any', category: 'surprise' }))}>EXPAND FILTERS</button><button className="button ghost" type="button" onClick={() => setFilters(previous => ({ ...previous, demo: true }))}>TRY DEMO IDEAS</button></div>}</>
      : <div className="empty-state"><span>◈</span><h2>Good things are closer than you think.</h2><p>Set your scene, then discover what is around you.</p></div>}
  </main>;
}
