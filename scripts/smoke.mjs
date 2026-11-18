import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';

const port = 3100;
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], {
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverOutput = '';
for (const stream of [server.stdout, server.stderr]) {
  stream.on('data', chunk => { serverOutput = (serverOutput + chunk.toString()).slice(-4000); });
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    if (server.exitCode !== null) break;
    try {
      const response = await fetch(base, { signal: AbortSignal.timeout(1000) });
      if (response.ok) { ready = true; break; }
    } catch { /* The server is still starting. */ }
    await delay(500);
  }
  assert.ok(ready, `Built app did not start. ${serverOutput}`);

  const home = await fetch(base);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /Spin Your City/);

  const manifest = await fetch(`${base}/manifest.webmanifest`);
  assert.equal(manifest.status, 200);
  assert.equal((await manifest.json()).name, 'LocalRoulette');

  const filters = { location: 'Middlesbrough', radius: 10, budget: 'any', audience: 'friends', category: 'surprise', when: 'today', demo: true };
  const search = await fetch(`${base}/api/search`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filters) });
  assert.equal(search.status, 200);
  const result = await search.json();
  assert.ok(result.activities.length > 0, 'Demo search should return nearby ideas.');
  assert.ok(result.activities.every(activity => activity.demo === true));

  const id = result.activities[0].id;
  const activity = await fetch(`${base}/api/activity/${encodeURIComponent(id)}`);
  assert.equal(activity.status, 200);
  assert.equal((await activity.json()).activity.id, id);
  assert.equal((await fetch(`${base}/activity/${encodeURIComponent(id)}`)).status, 200);

  const badSearch = await fetch(`${base}/api/search`, { method: 'POST', body: '{' });
  assert.equal(badSearch.status, 400);
  console.log(`Runtime smoke passed: homepage, manifest, demo search (${result.activities.length} results), activity details, invalid request.`);
} finally {
  if (server.exitCode === null) {
    const exited = once(server, 'exit');
    server.kill('SIGTERM');
    await Promise.race([exited, delay(2000)]);
    if (server.exitCode === null) server.kill('SIGKILL');
  }
}
