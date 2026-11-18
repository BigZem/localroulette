import Link from 'next/link';
export default function NotFound() { return <main className="container page"><div className="empty-state"><span>⌖</span><h1>We couldn&apos;t find that page.</h1><p>There are more adventures on the way.</p><Link className="button primary" href="/">BACK TO THE WHEEL ↗</Link></div></main>; }
