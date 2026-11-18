'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ActivityCard } from '@/components/ActivityCard';
import { FiltersPanel } from '@/components/Filters';
import { Wheel } from '@/components/Wheel';
import { shareActivity, useFavorites } from '@/components/use-favorites';
import { parseFilters } from '@/lib/domain.ts';
import { directionsUrl, priceLabel, safeExternal, whenLabel } from '@/lib/presentation.ts';
import { spinsLeft, takeSpin, type SpinRecord } from '@/lib/spins.ts';
import { randomIndex, wheelStop } from '@/lib/wheel.ts';
import { DEFAULT_FILTERS, type Activity, type Filters } from '@/lib/types.ts';
import type { DiscoveryResult } from '@/lib/discovery.ts';

const FILTER_KEY = 'localroulette:filters', SPIN_KEY = 'localroulette:spins', SEEN_KEY = 'localroulette:seen';
const PLACEHOLDER_LABELS = ['Food & drink', 'Hidden gems', 'Outdoors', 'Live events', 'Culture', 'Family', 'Nightlife', 'Surprise'];

function random(): number { const value = new Uint32Array(1); crypto.getRandomValues(value); return (value[0] ?? 0) / 4294967296; }
function wheelPool(items: Activity[], chosen: Activity): Activity[] {
  const others = items.filter(item => item.id !== chosen.id);
  const pool = [chosen];
  while (pool.length < Math.min(8, items.length)) pool.push(others.splice(randomIndex(others.length, random), 1)[0]!);
  while (pool.length < 8) pool.push(pool[pool.length % Math.max(1, items.length)]!);
  for (let index = pool.length - 1; index > 0; index--) { const other = randomIndex(index + 1, random); [pool[index], pool[other]] = [pool[other]!, pool[index]!]; }
  return pool;
}
function playTone(muted: boolean) {
  if (muted) return;
  try {
    const audio = new AudioContext(), oscillator = audio.createOscillator(), volume = audio.createGain();
    oscillator.frequency.setValueAtTime(620, audio.currentTime); oscillator.frequency.exponentialRampToValueAtTime(880, audio.currentTime + .15);
    volume.gain.setValueAtTime(.07, audio.currentTime); volume.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .2);
    oscillator.connect(volume).connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + .2);
    oscillator.onended = () => { void audio.close(); };
  } catch { /* Sound is optional. */ }
}

export default function Home() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [record, setRecord] = useState<SpinRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false), [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0), rotationRef = useRef(0);
  const [labels, setLabels] = useState(PLACEHOLDER_LABELS);
  const [result, setResult] = useState<Activity | null>(null);
  const [message, setMessage] = useState(''), [warnings, setWarnings] = useState<string[]>([]);
  const [muted, setMuted] = useState(true), [reduced, setReduced] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null), resultRef = useRef<HTMLDivElement>(null), timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toggle, isSaved } = useFavorites();

  useEffect(() => {
    try { setFilters({ ...DEFAULT_FILTERS, ...(JSON.parse(localStorage.getItem(FILTER_KEY) || '{}') as Partial<Filters>) }); } catch { /* Use defaults. */ }
    try { setRecord(JSON.parse(localStorage.getItem(SPIN_KEY) || 'null') as SpinRecord | null); } catch { /* Use default. */ }
    try { setMuted(JSON.parse(localStorage.getItem('localroulette:muted') || 'true') as boolean); } catch { /* Sound off. */ }
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setReady(true);
    const install = (event: Event) => { event.preventDefault(); setInstallPrompt(event as BeforeInstallPromptEvent); };
    window.addEventListener('beforeinstallprompt', install);
    return () => { window.removeEventListener('beforeinstallprompt', install); if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(FILTER_KEY, JSON.stringify(filters)); } catch { /* Storage optional. */ } }, [filters, ready]);
  const remaining = spinsLeft(record);

  async function spin() {
    if (busy || spinning) return;
    if (remaining === 0) { setMessage('Your three free spins are used for today. Browse while you wait for the UK midnight reset.'); return; }
    const valid = parseFilters(filters);
    if (!valid) { setMessage('Please enter a location and check your filters.'); return; }
    setBusy(true); setMessage(''); setWarnings([]);
    try {
      const response = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(valid) });
      const data = await response.json() as DiscoveryResult & { error?: string };
      if (!response.ok) throw new Error(data.error || 'Search failed.');
      setWarnings(data.warnings);
      if (!data.activities.length) { setMessage('No matching activities. Try a wider radius, any budget, another time, or labelled demo ideas.'); return; }
      let seen: string[] = [];
      try { seen = JSON.parse(sessionStorage.getItem(SEEN_KEY) || '[]') as string[]; } catch { /* New session. */ }
      let fresh = data.activities.filter(item => !seen.includes(item.id));
      if (!fresh.length) { seen = []; fresh = data.activities; }
      const chosen = fresh[randomIndex(fresh.length, random)]!;
      const next = takeSpin(record);
      if (!next) return;
      setRecord(next); try { localStorage.setItem(SPIN_KEY, JSON.stringify(next)); sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen, chosen.id])); } catch { /* Storage optional. */ }
      const pool = wheelPool(data.activities, chosen);
      const index = pool.findIndex(item => item.id === chosen.id);
      const target = wheelStop(rotationRef.current, index, pool.length);
      rotationRef.current = target;
      setLabels(pool.map(item => item.name)); setResult(null); setSpinning(true);
      wheelRef.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' });
      playTone(muted);
      setTimeout(() => setRotation(target), 40);
      timerRef.current = setTimeout(() => { setSpinning(false); setResult(chosen); playTone(muted); setTimeout(() => resultRef.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' }), 80); }, reduced ? 80 : 5100);
    } catch (error) { setMessage(navigator.onLine === false ? 'You are offline. Reconnect for live discovery or view saved activities.' : error instanceof Error ? error.message : 'Could not search right now.'); }
    finally { setBusy(false); }
  }

  const official = safeExternal(result?.sourceUrl), affiliate = result?.affiliateDisclosure ? safeExternal(result.affiliateUrl) : null;
  return <main>
    <section className="hero container"><div className="hero-copy"><div className="eyebrow hero-kicker">✦ THE CITY IS YOURS TO EXPLORE</div>
      <h1>Can&apos;t Decide What To Do? <span>Spin Your City.</span></h1>
      <p className="hero-subtitle">Discover amazing places, activities and events near you. Set your preferences, spin the wheel and let LocalRoulette choose your next adventure.</p>
      <div className="hero-pills"><span>◉ No endless scrolling</span><span>⌖ Made for Teesside</span><span>✦ Your next story starts here</span></div>
      <FiltersPanel filters={filters} onChange={setFilters} onMessage={setMessage}/>
    </div><div className="hero-play" ref={wheelRef}><div className="orbit-note">YOUR NEXT<br/>ADVENTURE</div><Wheel labels={labels} rotation={rotation} spinning={spinning} reducedMotion={reduced}/>
      <div className="spin-box"><span className="eyebrow">02 / LET FATE DECIDE</span><h2>Ready? Give it a spin.</h2><p>We match your choices first. The wheel selects fairly from eligible results.</p>
        <button className="spin-button" type="button" onClick={() => void spin()} disabled={busy || spinning}>{busy ? 'FINDING IDEAS…' : spinning ? 'SPINNING…' : '✦ SPIN THE WHEEL'} <span aria-hidden="true">↗</span></button>
        <div className="spin-meta"><span>{remaining} of 3 free spins left today</span><button type="button" onClick={() => { setMuted(!muted); try { localStorage.setItem('localroulette:muted', JSON.stringify(!muted)); } catch { /* Optional. */ } }} aria-label={muted ? 'Turn sound on' : 'Turn sound off'}>{muted ? '♪ Sound off' : '♫ Sound on'}</button></div>
        <small>Resets at UK midnight. Browser limits can be reset or bypassed.</small>{installPrompt && <button type="button" className="install-button" onClick={() => { void installPrompt.prompt(); setInstallPrompt(null); }}>Install LocalRoulette ↗</button>}
      </div></div></section>
    <div className="container">{message && <div className="notice" role="status">{message}{message.startsWith('No matching') && <button type="button" onClick={() => setFilters(previous => ({ ...previous, radius: 50, budget: 'any', category: 'surprise' }))}>Expand search filters</button>}</div>}
      {warnings.length > 0 && <div className="provider-note" role="status">{warnings.join(' ')}</div>}
      {result && <section className="reveal" ref={resultRef} aria-live="polite"><span className="eyebrow">03 / THE WHEEL HAS SPOKEN</span><h2>Your next adventure: <em>{result.name}</em></h2>
        <div className="reveal-grid"><ActivityCard item={result} saved={isSaved(result.id)} onSave={toggle}/><div className="reveal-copy"><p>{result.description}</p><div className="detail-pills"><span>⌖ {result.town}{result.distanceMiles !== undefined ? ` · ${result.distanceMiles} mi` : ''}</span><span>£ {priceLabel(result)}</span><span>◷ {whenLabel(result)}</span></div>
          {result.demo && <p className="trust-note">This is an example idea, not a live listing. Check details before going.</p>}{result.priceNote && <p className="trust-note">{result.priceNote}</p>}
          <div className="reveal-actions"><a className="button primary" href={directionsUrl(result)} target="_blank" rel="noopener noreferrer">{result.demo ? 'EXPLORE AREA' : "LET'S GO!"} ↗</a><button className="button secondary" type="button" onClick={() => void spin()}>SPIN AGAIN</button><button className="button ghost" type="button" onClick={() => toggle(result)}>{isSaved(result.id) ? 'SAVED ♥' : 'SAVE FOR LATER ♡'}</button></div>
          <div className="reveal-links"><Link href={`/activity/${encodeURIComponent(result.id)}`}>Full details</Link><button type="button" onClick={() => { void shareActivity(result).then(setMessage); }}>Share activity</button>{official && <a href={official} target="_blank" rel="noopener noreferrer">Official listing ↗</a>}{affiliate && <a href={affiliate} target="_blank" rel="noopener noreferrer sponsored">Offer (affiliate link) ↗</a>}</div>{affiliate && <small>{result.affiliateDisclosure}</small>}
        </div></div></section>}
    </div>
    <section className="how-strip container"><div className="section-title"><span className="eyebrow">THREE SMALL STEPS</span><h2>Less planning. More living.</h2><p>From “what should we do?” to out the door in moments.</p></div><div className="step-grid"><article><span>01</span><h3>Set your scene</h3><p>Where, who, when and what you&apos;re in the mood for.</p></article><article><span>02</span><h3>Give it a spin</h3><p>The wheel picks an eligible suggestion fairly.</p></article><article><span>03</span><h3>Go make a memory</h3><p>Check details, save the idea, or head out.</p></article></div></section>
    <section className="teaser container"><div><span className="eyebrow">START CLOSE. GO FURTHER.</span><h2>Teesside has more to offer than your usual favourites.</h2><p>From the coast to the town centre, find something new on your doorstep.</p></div><Link href="/discover" className="button secondary">Browse activities ↗</Link></section>
  </main>;
}

interface BeforeInstallPromptEvent extends Event { prompt(): Promise<void> }
