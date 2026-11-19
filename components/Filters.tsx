'use client';

import type { Dispatch, SetStateAction } from 'react';
import { ukDate } from '@/lib/domain.ts';
import { AUDIENCE_CHOICES, AUDIENCE_LABELS, BUDGET_CHOICES, BUDGET_LABELS, CATEGORY_CHOICES, CATEGORY_LABELS, RADIUS_CHOICES, WHEN_CHOICES, WHEN_LABELS, type Filters } from '@/lib/types.ts';

interface Props { filters: Filters; onChange: Dispatch<SetStateAction<Filters>>; onMessage: (message: string) => void; compact?: boolean }
export function FiltersPanel({ filters, onChange, onMessage, compact = false }: Props) {
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange(previous => ({ ...previous, [key]: value }));
  function locate() {
    if (!navigator.geolocation) { onMessage('Location is unavailable. Enter a town or postcode instead.'); return; }
    onMessage('Asking your browser for location permission…');
    navigator.geolocation.getCurrentPosition(position => {
      onChange(previous => ({ ...previous, location: 'Current location', lat: Math.round(position.coords.latitude * 1000) / 1000, lon: Math.round(position.coords.longitude * 1000) / 1000 }));
      onMessage('Approximate location selected.');
    }, () => onMessage('Location permission was not granted. Enter a town or postcode instead.'),
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }
  return <form className={`filters-panel ${compact ? 'compact' : ''}`} onSubmit={event => event.preventDefault()}>
    {!compact && <div className="panel-heading"><div><span className="eyebrow">01 / SET THE SCENE</span><h2>Make it yours.</h2></div><span className="mini-star">✦</span></div>}
    <div className="time-shortcuts" role="group" aria-label="Quick time choices"><span>Pick your moment</span>
      <button type="button" className={filters.when === 'anytime' ? 'active' : ''} aria-pressed={filters.when === 'anytime'} onClick={() => update('when', 'anytime')}>✦ Explore all</button>
      <button type="button" className={filters.when === 'daytime' ? 'active' : ''} aria-pressed={filters.when === 'daytime'} onClick={() => update('when', 'daytime')}>☀ Day out</button>
      <button type="button" className={filters.when === 'tonight' ? 'active' : ''} aria-pressed={filters.when === 'tonight'} onClick={() => update('when', 'tonight')}>☾ Tonight</button>
    </div>
    {filters.when === 'anytime' && <p className="filter-help">Explore all includes places with unconfirmed opening hours. Check with the venue before setting off.</p>}
    <div className="filter-grid">
      <label className="filter-field location-field"><span>Where?</span><div className="location-entry"><input required maxLength={100} autoComplete="address-level2" placeholder="Town, city or postcode" value={filters.location} onChange={event => onChange(previous => ({ ...previous, location: event.target.value, lat: undefined, lon: undefined }))}/><button type="button" className="location-button" onClick={locate} aria-label="Use my approximate location" title="Use my location">⌾</button></div></label>
      <label className="filter-field"><span>How far?</span><select value={filters.radius} onChange={event => update('radius', Number(event.target.value) as Filters['radius'])}>{RADIUS_CHOICES.map(value => <option key={value} value={value}>{value} miles</option>)}</select></label>
      <label className="filter-field"><span>Budget / person</span><select value={filters.budget} onChange={event => update('budget', event.target.value as Filters['budget'])}>{BUDGET_CHOICES.map(value => <option key={value} value={value}>{BUDGET_LABELS[value]}</option>)}</select></label>
      <label className="filter-field"><span>Who&apos;s going?</span><select value={filters.audience} onChange={event => update('audience', event.target.value as Filters['audience'])}>{AUDIENCE_CHOICES.map(value => <option key={value} value={value}>{AUDIENCE_LABELS[value]}</option>)}</select></label>
      <label className="filter-field"><span>What mood?</span><select value={filters.category} onChange={event => update('category', event.target.value as Filters['category'])}>{CATEGORY_CHOICES.map(value => <option key={value} value={value}>{CATEGORY_LABELS[value]}</option>)}</select></label>
      <label className="filter-field"><span>When?</span><select value={filters.when} onChange={event => update('when', event.target.value as Filters['when'])}>{WHEN_CHOICES.map(value => <option key={value} value={value}>{WHEN_LABELS[value]}</option>)}</select></label>
      {filters.when === 'date' && <label className="filter-field"><span>Choose a date</span><input type="date" min={ukDate()} value={filters.date || ''} onChange={event => update('date', event.target.value)}/></label>}
    </div>
    <label className="demo-option"><input type="checkbox" checked={filters.demo} onChange={event => update('demo', event.target.checked)}/><span className="demo-switch" aria-hidden="true"/><span><strong>Try demonstration ideas</strong><small>Clearly labelled examples, not live listings.</small></span></label>
  </form>;
}
