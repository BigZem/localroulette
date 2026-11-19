'use client';

import { useEffect, useState } from 'react';
import type { Activity } from '@/lib/types.ts';

const KEY = 'localroulette:favourites';
export function useFavorites() {
  const [saved, setSaved] = useState<Activity[]>([]);
  useEffect(() => { try { setSaved(JSON.parse(localStorage.getItem(KEY) || '[]') as Activity[]); } catch { /* Storage may be disabled. */ } }, []);
  function toggle(item: Activity) {
    setSaved(previous => {
      const next = previous.some(a => a.id === item.id) ? previous.filter(a => a.id !== item.id) : [...previous, item];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Storage may be disabled. */ }
      return next;
    });
  }
  return { saved, toggle, isSaved: (id: string) => saved.some(item => item.id === id) };
}

export async function shareActivity(item: Activity): Promise<string> {
  const url = `${window.location.origin}/activity/${encodeURIComponent(item.id)}`;
  try {
    if (navigator.share) { await navigator.share({ title: item.name, text: `I found this on LocalRoulette: ${item.name}`, url }); return 'Shared.'; }
    await navigator.clipboard.writeText(url);
    return 'Link copied.';
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return '';
    return `Copy this link: ${url}`;
  }
}
