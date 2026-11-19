import test from 'node:test';
import assert from 'node:assert/strict';
import { discover, getActivity } from '../lib/discovery.ts';
import { geoapifyCategories, normaliseGeoapify } from '../lib/providers/geoapify.ts';
import { DEFAULT_FILTERS } from '../lib/types.ts';

const feature = {
  geometry: { coordinates: [-1.235, 54.5742] },
  properties: {
    place_id: 'fixture_01', name: 'Fixture Café', categories: ['catering.cafe'],
    city: 'Middlesbrough', opening_hours: '24/7', formatted: 'Middlesbrough',
    website: 'https://example.org/cafe', datasource: { raw: { fee: 'yes' } },
  },
};

test('Geoapify category queries target the selected activity type', () => {
  assert.match(geoapifyCategories('food'), /catering\.cafe/);
  assert.doesNotMatch(geoapifyCategories('food'), /leisure\.park/);
  assert.match(geoapifyCategories('outdoor'), /leisure\.park/);
});

test('Geoapify normalisation preserves attribution and unknown prices', () => {
  const item = normaliseGeoapify(feature, 'food');
  assert.equal(item?.id, 'geo-food-fixture_01');
  assert.equal(item?.source, 'geoapify');
  assert.equal(item?.demo, false);
  assert.equal(item?.openingHours, '24/7');
  assert.equal(item?.pricePence, undefined);
  assert.equal(item?.sourceUrl, 'https://example.org/cafe');
  assert.equal(item?.audiences.includes('family'), false);
  assert.equal(normaliseGeoapify({ ...feature, properties: { ...feature.properties, name: '' } }, 'food'), null);
});

test('configured live search and share links use Geoapify on the server', async () => {
  const originalFetch = globalThis.fetch;
  const previousKey = process.env.GEOAPIFY_API_KEY;
  const previousOverpass = process.env.ENABLE_PUBLIC_OVERPASS;
  process.env.GEOAPIFY_API_KEY = 'fixture-secret';
  delete process.env.ENABLE_PUBLIC_OVERPASS;
  const calls: string[] = [];
  globalThis.fetch = async input => {
    const url = String(input);
    calls.push(url);
    assert.match(url, /^https:\/\/api\.geoapify\.com\/v2\//);
    return Response.json({ features: [{ ...feature, properties: { ...feature.properties,
      place_id: url.includes('/place-details?') ? 'updated_fixture_02' : 'fixture_01' } }] });
  };
  try {
    const result = await discover({ ...DEFAULT_FILTERS, radius: 5, category: 'food' });
    assert.equal(result.count, 1);
    assert.equal(result.activities[0]?.source, 'geoapify');
    assert.equal((await discover({ ...DEFAULT_FILTERS, radius: 5, category: 'food', budget: 'free' })).count, 0);
    assert.equal((await getActivity('geo-food-fixture_02'))?.id, 'geo-food-fixture_02');
    assert.ok(calls.some(url => url.includes('/places?')));
    assert.ok(calls.some(url => url.includes('/place-details?')));
    assert.ok(calls.some(url => url.includes('conditions=named')));
    assert.ok(calls.every(url => url.includes('apiKey=fixture-secret')));
  } finally {
    globalThis.fetch = originalFetch;
    if (previousKey === undefined) delete process.env.GEOAPIFY_API_KEY; else process.env.GEOAPIFY_API_KEY = previousKey;
    if (previousOverpass === undefined) delete process.env.ENABLE_PUBLIC_OVERPASS; else process.env.ENABLE_PUBLIC_OVERPASS = previousOverpass;
  }
});

test('surprise search draws from separate real place categories', async () => {
  const originalFetch = globalThis.fetch;
  const previousKey = process.env.GEOAPIFY_API_KEY;
  process.env.GEOAPIFY_API_KEY = 'fixture-secret';
  const received = new Set<string>();
  globalThis.fetch = async input => {
    const categories = new URL(String(input)).searchParams.get('categories') ?? '';
    const category = categories.includes('catering.restaurant') ? 'food'
      : categories.includes('leisure.park') ? 'outdoor' : 'nightlife';
    received.add(category);
    const name = { food: 'Fixture Café', outdoor: 'Fixture Park', nightlife: 'Fixture Pub' }[category];
    const providerCategory = { food: 'catering.cafe', outdoor: 'leisure.park', nightlife: 'catering.pub' }[category];
    return Response.json({ features: [{ ...feature, properties: { ...feature.properties,
      place_id: `fixture_${category}`, name, categories: [providerCategory] } }] });
  };
  try {
    const result = await discover({ ...DEFAULT_FILTERS, category: 'surprise' });
    assert.ok(result.count >= 3);
    for (const category of ['food', 'outdoor', 'nightlife'])
      assert.ok(result.activities.some(item => item.id === `geo-${category}-fixture_${category}`));
    assert.deepEqual(received, new Set(['food', 'outdoor', 'nightlife']));
  } finally {
    globalThis.fetch = originalFetch;
    if (previousKey === undefined) delete process.env.GEOAPIFY_API_KEY; else process.env.GEOAPIFY_API_KEY = previousKey;
  }
});
