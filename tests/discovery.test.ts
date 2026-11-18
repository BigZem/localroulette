import test from 'node:test';
import assert from 'node:assert/strict';
import { discover } from '../lib/discovery.ts';
import { normaliseOsm } from '../lib/providers/osm.ts';
import { normaliseTicketmaster } from '../lib/providers/ticketmaster.ts';
import { demoActivities } from '../lib/providers/demo.ts';
import { DEFAULT_FILTERS } from '../lib/types.ts';

test('demo mode contains twelve explicitly labelled ideas', async () => {
  assert.equal(demoActivities.length, 12);
  assert.ok(demoActivities.every(item => item.demo && item.source === 'demo' && !item.startsAt));
  const result = await discover({ ...DEFAULT_FILTERS, demo: true });
  assert.ok(result.count > 0);
  assert.ok(result.activities.every(item => item.demo && (item.distanceMiles ?? 100) <= 10));
});
test('OSM family suitability requires a child-specific tag', () => {
  const park = normaliseOsm({ type: 'node', id: 1, lat: 54.5, lon: -1.2, tags: { name: 'Fixture Park', leisure: 'park' } });
  const playground = normaliseOsm({ type: 'node', id: 2, lat: 54.5, lon: -1.2, tags: { name: 'Fixture Playground', leisure: 'playground' } });
  assert.equal(park?.audiences.includes('family'), false);
  assert.equal(playground?.audiences.includes('family'), true);
});
test('Ticketmaster uses only GBP prices and a known future schedule', () => {
  const event = normaliseTicketmaster({ id: 'fixture', name: 'Fixture Concert', dates: { start: { dateTime: '2026-11-20T19:00:00Z' } },
    priceRanges: [{ min: 12, currency: 'GBP' }], _embedded: { venues: [{ name: 'Fixture Venue', city: { name: 'Yarm' }, location: { latitude: '54.5036', longitude: '-1.3579' } }] } });
  assert.equal(event?.pricePence, 1200);
  assert.equal(event?.source, 'ticketmaster');
  assert.equal(event?.demo, false);
});
test('a mocked live provider result is filtered by price and radius', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ elements: [{ type: 'node', id: 31, lat: 54.5742, lon: -1.235, tags: { name: 'Fixture Café', amenity: 'cafe', opening_hours: '24/7' } }] });
  try {
    const any = await discover({ ...DEFAULT_FILTERS, radius: 5, category: 'food' });
    assert.equal(any.count, 1);
    assert.equal(any.activities[0]?.source, 'osm');
    const free = await discover({ ...DEFAULT_FILTERS, radius: 5, category: 'food', budget: 'free' });
    assert.equal(free.count, 0);
  } finally { globalThis.fetch = original; }
});
