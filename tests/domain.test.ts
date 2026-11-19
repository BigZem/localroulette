import test from 'node:test';
import assert from 'node:assert/strict';
import { dedupe, distanceMiles, eligible, parseFilters, ukDate } from '../lib/domain.ts';
import { takeSpin, spinsLeft } from '../lib/spins.ts';
import { randomIndex, wheelStop } from '../lib/wheel.ts';
import { DEFAULT_FILTERS, type Activity } from '../lib/types.ts';
import { curatedActivities } from '../lib/providers/curated.ts';
import { directionsUrl } from '../lib/presentation.ts';

const place: Activity = { id: 'osm-node-1', name: 'Test Place', description: 'Fixture', category: 'food', lat: 54.574, lon: -1.235,
  town: 'Middlesbrough', audiences: ['friends'], source: 'osm', demo: false, openingHours: '24/7' };

test('filters reject invalid location, radius and date', () => {
  assert.equal(parseFilters({ ...DEFAULT_FILTERS, location: '' }), null);
  assert.equal(parseFilters({ ...DEFAULT_FILTERS, radius: 100 }), null);
  assert.equal(parseFilters({ ...DEFAULT_FILTERS, when: 'date' }), null);
  assert.equal(parseFilters({ ...DEFAULT_FILTERS, when: 'date', date: '2026-11-20' })?.date, '2026-11-20');
});
test('unknown prices are excluded from price-specific searches', () => {
  const now = new Date('2026-11-18T12:00:00Z');
  assert.equal(eligible([place], { ...DEFAULT_FILTERS, budget: 'free' }, now).length, 0);
  assert.equal(eligible([place], DEFAULT_FILTERS, now).length, 1);
  assert.equal(eligible([{ ...place, pricePence: 0 }], { ...DEFAULT_FILTERS, budget: 'free' }, now).length, 1);
});
test('time searches require usable hours or an upcoming event', () => {
  const now = new Date('2026-11-18T19:00:00Z');
  assert.equal(eligible([{ ...place, openingHours: undefined }], DEFAULT_FILTERS, now).length, 0);
  assert.equal(eligible([{ ...place, openingHours: 'Mo-Fr 09:00-17:00' }], { ...DEFAULT_FILTERS, when: 'now' }, now).length, 0);
  const event: Activity = { ...place, source: 'ticketmaster', category: 'events', startsAt: '2026-11-18T18:00:00Z', openingHours: undefined };
  assert.equal(eligible([event], { ...DEFAULT_FILTERS, category: 'events' }, now).length, 0);
  assert.equal(eligible([{ ...event, endsAt: '2026-11-18T20:00:00Z' }], { ...DEFAULT_FILTERS, category: 'events', when: 'now' }, now).length, 1);
});
test('overnight venue hours count for today and after midnight', () => {
  const pub: Activity = { ...place, category: 'nightlife', openingHours: 'Th 16:00-02:00' };
  const thursday = new Date('2026-11-19T15:30:00Z');
  assert.equal(eligible([pub], { ...DEFAULT_FILTERS, category: 'nightlife', when: 'today' }, thursday).length, 1);
  assert.equal(eligible([pub], { ...DEFAULT_FILTERS, category: 'nightlife', when: 'now' }, thursday).length, 0);
  const fridayNight = new Date('2026-11-20T01:00:00Z');
  assert.equal(eligible([pub], { ...DEFAULT_FILTERS, category: 'nightlife', when: 'now' }, fridayNight).length, 1);
  assert.equal(eligible([pub], { ...DEFAULT_FILTERS, category: 'nightlife', when: 'today' }, fridayNight).length, 1);
});
test('reviewed places have sources and the museum last-admission cutoff is honoured', () => {
  assert.equal(curatedActivities.length, 7);
  assert.ok(curatedActivities.every(item => item.source === 'curated' && !item.demo && !item.startsAt
    && item.reviewedOn === '2026-11-19' && item.sourceUrl?.startsWith('https://')));
  assert.ok(directionsUrl(curatedActivities[0]!).includes(encodeURIComponent(curatedActivities[0]!.address!)));
  const museum = curatedActivities.find(item => item.id === 'curated-preston-park-museum')!;
  const filters = { ...DEFAULT_FILTERS, category: 'family' as const };
  assert.equal(eligible([museum], filters, new Date('2026-11-19T15:00:00Z')).length, 1);
  assert.equal(eligible([museum], filters, new Date('2026-11-19T15:45:00Z')).length, 0);
});
test('family activity search includes child-suitable venues across categories', () => {
  const filters = { ...DEFAULT_FILTERS, category: 'family' as const };
  const atSix = new Date('2026-11-19T18:00:00Z');
  const matches = eligible(curatedActivities, filters, atSix);
  assert.ok(matches.some(item => item.id === 'curated-hollywood-bowl-stockton'));
  assert.ok(matches.some(item => item.id === 'curated-billingham-forum'));
  assert.ok(!matches.some(item => item.id === 'curated-rockantics'));
});
test('distance and duplicate checks use coordinates', () => {
  assert.ok(distanceMiles(54.574, -1.235, 54.68, -1.21) > 5);
  assert.equal(dedupe([place, { ...place, id: 'osm-node-2', name: 'Test Place!', lat: 54.5741 }]).length, 1);
});
test('free spins reset at UK midnight', () => {
  const before = new Date('2026-11-18T23:30:00Z'), after = new Date('2026-11-19T00:30:00Z');
  assert.equal(ukDate(before), '2026-11-18');
  let record = takeSpin(null, before);
  record = takeSpin(record, before); record = takeSpin(record, before);
  assert.equal(spinsLeft(record, before), 0);
  assert.equal(takeSpin(record, before), null);
  assert.equal(spinsLeft(record, after), 3);
});
test('wheel lands at the chosen segment centre', () => {
  for (const count of [1, 2, 8]) for (let i = 0; i < count; i++) {
    const stop = wheelStop(133, i, count), centre = (i + 0.5) * 360 / count;
    assert.ok(Math.abs(((stop + centre) % 360 + 360) % 360) < 0.00001 || Math.abs(((stop + centre) % 360 + 360) % 360 - 360) < 0.00001);
  }
  assert.equal(randomIndex(8, () => 0), 0);
  assert.equal(randomIndex(8, () => 0.999999), 7);
});
