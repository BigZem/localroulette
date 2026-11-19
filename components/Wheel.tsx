'use client';

import { WHEEL_SEGMENTS } from '@/lib/wheel.ts';
import type { CSSProperties } from 'react';

const COLORS = ['#21ddc4', '#926aff', '#ffb46d', '#49a3ff', '#f781bb', '#9fdf86', '#bba1ff', '#f6d16c', '#55d9ec', '#db8cff', '#ff8c78', '#86d5a3'];
export const WHEEL_PLACEHOLDERS = ['Food', 'Culture', 'Outdoors', 'Events', 'Games', 'Nightlife', 'Hidden gems', 'Family', 'Fitness', 'Food', 'Adventure', 'Surprise'];
interface Props { labels?: string[]; rotation: number; spinning: boolean; reducedMotion: boolean }
export function Wheel({ labels, rotation, spinning, reducedMotion }: Props) {
  const items = labels?.length && labels.length <= WHEEL_SEGMENTS ? labels : WHEEL_PLACEHOLDERS;
  const gradient = `conic-gradient(${items.map((_, index) => `${COLORS[index]} ${index * 100 / items.length}% ${(index + 1) * 100 / items.length}%`).join(',')})`;
  return <div className="wheel-wrap" role="img" aria-label={`${items.length}-segment LocalRoulette wheel with a pointer at the top`}>
    <div className="wheel-glow" aria-hidden="true"/><div className="wheel-pointer" aria-hidden="true"/>
    <div className="wheel-frame"><div className="wheel-disc" style={{ background: gradient, transform: `rotate(${rotation}deg)`, transition: spinning && !reducedMotion ? 'transform 5s cubic-bezier(.12,.72,.12,1)' : 'none', '--segment-angle': `${360 / items.length}deg` } as CSSProperties}>
      {items.map((label, index) => {
        const angle = (index + 0.5) * 2 * Math.PI / items.length;
        return <span className="wheel-label" key={`${index}-${label}`} style={{ left: `${50 + Math.sin(angle) * 34}%`, top: `${50 - Math.cos(angle) * 34}%` }}>{label.length > 15 ? `${label.slice(0, 13)}…` : label}</span>;
      })}
      <div className="wheel-hub">✦</div>
    </div></div>
  </div>;
}
