import Link from 'next/link';

const links = [['/', 'Spin'], ['/discover', 'Discover'], ['/saved', 'Saved'], ['/how-it-works', 'How it works'], ['/premium', 'Premium']];
export function SiteHeader() {
  return <header className="site-header"><div className="header-inner">
    <Link className="brand" href="/" aria-label="LocalRoulette home"><span className="brand-symbol" aria-hidden="true"><i/></span><span>Local<span>Roulette</span></span></Link>
    <nav className="desktop-nav" aria-label="Main navigation">{links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    <Link className="header-cta" href="/">Spin now ↗</Link>
  </div></header>;
}
export function SiteFooter() {
  return <><footer className="site-footer"><div className="footer-inner"><div><strong>LocalRoulette</strong><p>Spin Your City. Discover Something New.</p></div><nav aria-label="Footer navigation"><Link href="/how-it-works">How it works</Link><Link href="/premium">Premium</Link><Link href="/partners">For local partners</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav><small>Made for curious days in Teesside. Place data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>, via <a href="https://www.geoapify.com/" target="_blank" rel="noopener noreferrer">Geoapify</a> when enabled.</small></div></footer>
    <nav className="mobile-nav" aria-label="Mobile navigation"><Link href="/"><span aria-hidden="true">◉</span>Spin</Link><Link href="/discover"><span aria-hidden="true">⌕</span>Discover</Link><Link href="/saved"><span aria-hidden="true">♡</span>Saved</Link><Link href="/premium"><span aria-hidden="true">✦</span>Premium</Link></nav></>;
}
