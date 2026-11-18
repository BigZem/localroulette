import type { Metadata } from 'next';
import { InfoLayout } from '@/components/InfoLayout';
export const metadata: Metadata = { title: 'Privacy' };
export default function Privacy() { return <InfoLayout eyebrow="PLAIN ENGLISH PRIVACY" title="Your day out stays yours.">
  <p>LocalRoulette does not require an account and does not include advertising trackers. Saved activities, preferences and spin counts are stored in this browser.</p>
  <p>If you tap “Use my location”, your browser asks permission. Approximate coordinates are sent to our server for nearby search; you can enter a town or postcode instead. We do not store precise location in an activity database.</p>
  <p>Search parameters may be sent to OpenStreetMap, Nominatim, postcodes.io or Ticketmaster to answer your request. External map and booking links have their own privacy policies. You can clear LocalRoulette data through your browser settings.</p>
  <p>Before public launch, the operator must add a named UK privacy contact and review the final hosting and provider agreements.</p>
</InfoLayout>; }
