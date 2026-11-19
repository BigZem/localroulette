import type { Metadata } from 'next';
import { InfoLayout } from '@/components/InfoLayout';
export const metadata: Metadata = { title: 'How it works' };
export default function HowItWorks() { return <InfoLayout eyebrow="THE SIMPLE VERSION" title="How it works">
  <p>Set your location and preferences. LocalRoulette finds matching places or events. The wheel picks one eligible result at random, and its pointer stops on the suggestion you see.</p>
  <h2>Trust the details, not guesswork.</h2><p>Live places come from Geoapify and OpenStreetMap contributors when configured. Optional events come from Ticketmaster. If a price or opening time is unknown, we say so. Example ideas are always labelled.</p>
  <h2>Three free spins a day.</h2><p>Browsing does not use a spin. The spin counter resets at UK midnight and is stored in your browser, so it can be reset or bypassed.</p>
</InfoLayout>; }
