import test from 'node:test';
import assert from 'node:assert/strict';
import { queryOverpass } from '../lib/providers/osm.ts';

test('OSM search retries a rate-limited endpoint before failing discovery', async () => {
  const original = globalThis.fetch;
  const calls: string[] = [];
  globalThis.fetch = async input => {
    calls.push(String(input));
    return calls.length === 1
      ? Response.json({ error: 'rate limited' }, { status: 429 })
      : Response.json({ elements: [{ type: 'node', id: 99, lat: 54.57, lon: -1.23, tags: { name: 'Fixture Park', leisure: 'park' } }] });
  };
  try {
    const result = await queryOverpass('[out:json];node(1);out;', 1000);
    assert.equal(result.elements?.[0]?.id, 99);
    assert.equal(calls.length, 2);
    assert.match(calls[0]!, /overpass\.private\.coffee/);
    assert.match(calls[1]!, /overpass\.openstreetmap\.fr/);
  } finally { globalThis.fetch = original; }
});
