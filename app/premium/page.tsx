import type { Metadata } from 'next';
import { InfoLayout } from '@/components/InfoLayout';
export const metadata: Metadata = { title: 'Premium coming soon' };
export default function Premium() { return <InfoLayout eyebrow="MORE ADVENTURE IS COMING" title="Premium, coming soon.">
  <p>Planned at £4.99 per month: unlimited spins, advanced filters, saved collections and more personal discovery. These features are not available yet, and we are not taking payments.</p>
  <div className="premium-grid"><span>✦ Unlimited spins</span><span>⌖ Advanced discovery</span><span>♡ Saved collections</span><span>◈ Personal picks</span></div>
  <p>For now, enjoy three free daily spins and browse activities without a limit.</p>
</InfoLayout>; }
