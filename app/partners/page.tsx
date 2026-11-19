import type { Metadata } from 'next';
import { InfoLayout } from '@/components/InfoLayout';
export const metadata: Metadata = { title: 'For local partners' };
export default function Partners() { return <InfoLayout eyebrow="FOR LOCAL BUSINESSES" title="Be part of the discovery.">
  <p>LocalRoulette is being built to help people discover places and experiences around Teesside. Future affiliate and partner opportunities will be clearly labelled.</p>
  <p>Payment will never secretly change a roulette result. Sponsored placements would be disclosed and kept separate from fair result selection.</p>
  <p>The partner programme is not open yet. No commissions or sponsorship revenue are active today.</p>
</InfoLayout>; }
