import Link from 'next/link';
import type { ReactNode } from 'react';
export function InfoLayout({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <main className="container page info-page"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><div className="info-copy">{children}</div><Link href="/" className="button primary">SPIN YOUR CITY ↗</Link></main>;
}
