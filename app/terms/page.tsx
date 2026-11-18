import type { Metadata } from 'next';
import { InfoLayout } from '@/components/InfoLayout';
export const metadata: Metadata = { title: 'Terms of use' };
export default function Terms() { return <InfoLayout eyebrow="A FEW FAIR RULES" title="Terms of use.">
  <p>LocalRoulette suggests things you might do. It does not sell tickets or guarantee prices, opening hours, access or availability. Verify details with the venue or organiser before travelling or booking.</p>
  <p>Demonstration ideas are examples, not live listings. Place information may be supplied by OpenStreetMap contributors and events by Ticketmaster when configured. External providers are responsible for their own content and booking terms.</p>
  <p>Free spins use a browser counter and reset at UK midnight. Premium is a future plan, not a current subscription.</p>
  <p>Before public release, a named operator and legal review should replace this MVP policy copy.</p>
</InfoLayout>; }
