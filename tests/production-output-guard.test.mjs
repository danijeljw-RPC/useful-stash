import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist', 'client');

const fixtureMarkers = [
  'a-container-cleanup-you-can-explain',
  'ask-ai-for-a-decision-not-a-performance',
  'make-a-small-tool-worth-keeping',
  'Sample article',
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

test('production build never emits a fixture slug or fixture marker into public output', async () => {
  const files = (await walk(dist)).filter((path) => /\.(html|xml|txt)$/.test(path));
  assert.ok(files.length > 0, 'expected at least one built HTML/XML/txt file');

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    for (const marker of fixtureMarkers) {
      assert.doesNotMatch(content, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${file} must not reference fixture marker "${marker}"`);
    }
  }
});

test('admin and API routes are never prerendered as static files (server-only, protected by Access/middleware)', async () => {
  const files = await walk(dist);
  const adminOrApiFiles = files.filter((path) => path.includes(`${join('dist', 'client')}${join('/', 'admin')}`) || path.includes(`${join('dist', 'client')}${join('/', 'api')}`));
  assert.deepEqual(adminOrApiFiles, []);

  await assert.rejects(() => access(join(dist, 'admin', 'submissions', 'index.html')));
  await assert.rejects(() => access(join(dist, 'api', 'submissions', 'media.html')));
});

test('dynamic admin and API routes run the Worker before static 404 handling', async () => {
  const config = JSON.parse(await readFile(join(root, 'wrangler.jsonc'), 'utf8'));
  assert.deepEqual(config.assets.run_worker_first, ['/admin/*', '/api/*']);
});

test('the sitemap never lists an admin, API, or fixture-slug URL', async () => {
  const sitemapFiles = (await walk(dist)).filter((path) => path.endsWith('.xml'));
  for (const file of sitemapFiles) {
    const content = await readFile(file, 'utf8');
    assert.doesNotMatch(content, /<loc>[^<]*\/admin\//, `${file} must not list an admin URL`);
    assert.doesNotMatch(content, /<loc>[^<]*\/api\//, `${file} must not list an API URL`);
    for (const marker of fixtureMarkers.slice(0, 3)) {
      assert.doesNotMatch(content, new RegExp(`<loc>[^<]*${marker}`), `${file} must not list fixture slug "${marker}"`);
    }
  }
});
