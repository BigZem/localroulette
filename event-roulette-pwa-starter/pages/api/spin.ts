import type { NextApiRequest, NextApiResponse } from 'next'
import seeds from '../../../data/seeds.json'
import { fetchSuggestions } from '../../../lib/opentripmap'
import { haversine } from '../../../lib/util'

function budgetToRadius(budget: string): number {
  if (!budget) return 3000;
  if (budget.includes('£50')) return 12000;
  if (budget.includes('£20–£50')) return 8000;
  if (budget.includes('£10–£20')) return 5000;
  return 3000;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function cap3(s:string){ return (s||'').slice(0,3).replace(/^./, c=>c.toUpperCase()); }
function monthInRange(nowIdx: number, spec: string): boolean {
  const parts = (spec||'').split(',').map(s => s.trim()).filter(Boolean);
  for (const p of parts) {
    if (p.includes('-')) {
      const [a,b] = p.split('-').map(s => s.trim());
      const ai = MONTHS.indexOf(cap3(a)); const bi = MONTHS.indexOf(cap3(b));
      if (ai === -1 || bi === -1) continue;
      if (ai <= bi) { if (nowIdx >= ai && nowIdx <= bi) return true; }
      else { if (nowIdx >= ai || nowIdx <= bi) return true; }
    } else {
      const mi = MONTHS.indexOf(cap3(p)); if (mi === nowIdx) return true;
    }
  }
  return false;
}
function seasonalBoost(item:any): number {
  if ((item.category||'').toLowerCase() !== 'seasonal') return 1.0;
  const london = new Date(new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }));
  const m = london.getMonth();
  const spec = (item as any).season_months || '';
  return spec && monthInRange(m, spec) ? 1.35 : 0.85;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const q = req.query as Record<string,string>;
    const lat = q.lat ? parseFloat(q.lat) : NaN;
    const lon = q.lon ? parseFloat(q.lon) : NaN;
    const city = q.city || 'Middlesbrough';
    const budget = q.budget || '£10–£20';
    const category = (q.category || 'random').toLowerCase();

    let latNum = lat, lonNum = lon;
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      const centres: Record<string,[number,number]> = {
        'middlesbrough':[54.5762,-1.2362],
        'stockton-on-tees':[54.5689,-1.3140],
        'redcar':[54.6190,-1.0710],
        'saltburn-by-the-sea':[54.5830,-0.9737],
        'skelton':[54.5640,-0.9970],
        'hartlepool':[54.6860,-1.2110],
        'darlington':[54.5250,-1.5550],
        'billingham':[54.5885,-1.2777],
        'guisborough':[54.5380,-1.0550],
        'stokesley':[54.4710,-1.1930],
        'yarm':[54.5070,-1.3579],
        'thornaby':[54.5590,-1.2690],
        'norton':[54.5890,-1.3140],
        'marske-by-the-sea':[54.5910,-1.0200],
        'eston':[54.5610,-1.1410],
        'loftus':[54.5590,-0.8970],
        'great ayton':[54.4925,-1.1365]
      };
      const key = Object.keys(centres).find(k => k === city.toLowerCase()) || 'middlesbrough';
      [latNum, lonNum] = centres[key];
    }

    const radius = budgetToRadius(budget);

    const local = (seeds as any[]).filter(s => {
      const d = haversine(latNum, lonNum, s.lat, s.lon);
      const near = d <= Math.max(radius * 2, 22000);
      const catOk = category === 'random' || (s.category||'').toLowerCase() === category;
      return near && catOk;
    }).map(s => ({...s, distance_m: haversine(latNum, lonNum, s.lat, s.lon)}));

    const otm = await fetchSuggestions(latNum, lonNum, radius, category === 'random' ? '' : category);

    const pool = [...local, ...otm];
    if (pool.length === 0) return res.status(404).json({ error: 'No results' });

    const now = new Date(new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }));
    const dow = now.getDay();
    const hour = now.getHours();
    const isWeekend = dow === 0 || dow === 6;
    const isEvening = hour >= 18 || hour < 2;
    const isDaytime = hour >= 9 && hour <= 17;

    const weighted = pool.map((s:any) => {
      const d = s.distance_m ?? haversine(latNum, lonNum, s.lat, s.lon);
      let w = 1 / Math.max(200, d);
      const cat = (s.category||'').toLowerCase();
      if (isEvening && (dow === 5 || dow === 6)) {
        if (['date_night','nightlife','cinema','live_music'].some(k => cat.includes(k))) w *= 1.25;
      }
      if (isWeekend && isDaytime) {
        if (['family','outdoors','culture'].some(k => cat.includes(k))) w *= 1.2;
      }
      w *= seasonalBoost(s);
      return { s, w };
    });

    const total = weighted.reduce((a,x)=>a+x.w,0);
    let r = Math.random()*total, pick = weighted[0].s;
    for (const x of weighted) { if (r < x.w) { pick = x.s; break; } r -= x.w; }

    res.status(200).json(pick);
  } catch (e:any) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
