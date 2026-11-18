'use client';

const COLORS = ['#21ddc4', '#855dff', '#ffab62', '#348df5', '#f369ac', '#8fdd76', '#aa91ff', '#f8cd62'];
const PLACEHOLDERS = ['Food & drink', 'Hidden gems', 'Outdoors', 'Live events', 'Culture', 'Family', 'Nightlife', 'Surprise'];
interface Props { labels?: string[]; rotation: number; spinning: boolean; reducedMotion: boolean }
export function Wheel({ labels, rotation, spinning, reducedMotion }: Props) {
  const items = labels?.length === 8 ? labels : PLACEHOLDERS;
  const gradient = `conic-gradient(${items.map((_, index) => `${COLORS[index]} ${index * 12.5}% ${(index + 1) * 12.5}%`).join(',')})`;
  return <div className="wheel-wrap" role="img" aria-label="Eight-segment LocalRoulette wheel with a pointer at the top">
    <div className="wheel-glow" aria-hidden="true"/><div className="wheel-pointer" aria-hidden="true"/>
    <div className="wheel-frame"><div className="wheel-disc" style={{ background: gradient, transform: `rotate(${rotation}deg)`, transition: spinning && !reducedMotion ? 'transform 5s cubic-bezier(.12,.72,.12,1)' : 'none' }}>
      {items.map((label, index) => {
        const angle = (index + 0.5) * Math.PI / 4;
        return <span className="wheel-label" key={`${index}-${label}`} style={{ left: `${50 + Math.sin(angle) * 34}%`, top: `${50 - Math.cos(angle) * 34}%` }}>{label.length > 17 ? `${label.slice(0, 15)}…` : label}</span>;
      })}
      <div className="wheel-hub">✦</div>
    </div></div>
  </div>;
}
