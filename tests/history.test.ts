import test from 'node:test';
import assert from 'node:assert/strict';
import { HISTORY_LIMIT, normaliseHistory, pickActivity, rememberPick } from '../lib/history.ts';

test('roulette avoids previously shown places across visits while alternatives exist', () => {
  const items = [{ id: 'geo-food-one' }, { id: 'geo-nightlife-two' }, { id: 'curated-three' }];
  const history = normaliseHistory(['geo-food-one', 'geo-nightlife-two']);
  assert.equal(pickActivity(items, history, () => 0).id, 'curated-three');
  assert.equal(pickActivity(items, rememberPick(history, 'curated-three'), () => 0).id, 'geo-food-one');
  assert.equal(pickActivity(items, rememberPick(rememberPick(history, 'curated-three'), 'geo-food-one'), () => 0).id, 'geo-nightlife-two');
});

test('same provider place in another category counts as seen and history is bounded', () => {
  assert.deepEqual(normaliseHistory(['geo-food-place_1', 'geo-nightlife-place_1']), ['geo-place_1']);
  assert.equal(pickActivity([{ id: 'geo-hidden-place_1' }, { id: 'geo-food-place_2' }], ['geo-place_1'], () => 0).id, 'geo-food-place_2');
  const history = normaliseHistory(Array.from({ length: HISTORY_LIMIT + 12 }, (_, index) => `place-${index}`));
  assert.equal(history.length, HISTORY_LIMIT);
  assert.equal(history[0], 'place-12');
  assert.equal(history.at(-1), `place-${HISTORY_LIMIT + 11}`);
  assert.deepEqual(normaliseHistory(['bad id', null, 'okay']), ['okay']);
});
