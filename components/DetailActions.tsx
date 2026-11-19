'use client';

import { useState } from 'react';
import type { Activity } from '@/lib/types.ts';
import { directionsUrl } from '@/lib/presentation.ts';
import { shareActivity, useFavorites } from './use-favorites';

export function DetailActions({ item }: { item: Activity }) {
  const { toggle, isSaved } = useFavorites();
  const [message, setMessage] = useState('');
  return <><div className="detail-actions"><a className="button primary" href={directionsUrl(item)} target="_blank" rel="noopener noreferrer">{item.demo ? 'EXPLORE AREA' : "LET'S GO!"} ↗</a>
    <button className="button secondary" type="button" onClick={() => toggle(item)}>{isSaved(item.id) ? 'SAVED ♥' : 'SAVE FOR LATER ♡'}</button>
    <button className="button ghost" type="button" onClick={() => { void shareActivity(item).then(setMessage); }}>SHARE ↗</button></div>
    {message && <p className="notice" role="status">{message}</p>}</>;
}
