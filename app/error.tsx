'use client';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <main className="container page"><div className="empty-state"><span>✦</span><h1>Something went wrong.</h1><p>Try again. If live discovery is unavailable, your saved ideas are still on this device.</p><button type="button" className="button primary" onClick={reset}>TRY AGAIN ↗</button></div></main>;
}
