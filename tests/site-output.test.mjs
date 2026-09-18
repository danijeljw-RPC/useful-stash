import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist', 'client');

async function readBuilt(path) {
  return readFile(join(dist, path), 'utf8');
}

test('build emits every public route and discovery file', async () => {
  const expected = [
    'index.html',
    'stash/index.html',
    'about/index.html',
    'contact/index.html',
    '404.html',
    'rss.xml',
    'robots.txt',
    'sitemap-index.xml',
  ];

  await Promise.all(expected.map((path) => access(join(dist, path))));
});

test('homepage exposes the brand proposition and useful navigation', async () => {
  const html = await readBuilt('index.html');

  assert.match(html, /\[\+\]/);
  assert.match(html, /Useful\?/);
  assert.match(html, /Stash it\./);
  assert.match(html, /href="\/stash\/"/);
  assert.match(html, /aria-label="Switch to light theme"/);
});

test('production build excludes every fixture article route, per the fixture contract', async () => {
  // All current sample articles are `fixture: true` and must never be
  // routable, visible, or discoverable once `npm run build` runs in
  // production mode (see docs/useful-stash-blog-upgrade.md, "What
  // `fixture` means"). There is intentionally no non-fixture article yet;
  // once a real article is published, add a positive-path test here that
  // reads its built page and asserts JSON-LD/takeaway/metadata.
  const fixtureSlugs = [
    'a-container-cleanup-you-can-explain',
    'ask-ai-for-a-decision-not-a-performance',
    'make-a-small-tool-worth-keeping',
  ];

  for (const slug of fixtureSlugs) {
    await assert.rejects(() => access(join(dist, 'stash', slug, 'index.html')));
  }
});

test('RSS excludes fixture articles and drafts from the canonical feed', async () => {
  const xml = await readBuilt('rss.xml');

  assert.match(xml, /<title>Useful Stash<\/title>/);
  assert.doesNotMatch(xml, /make-a-small-tool-worth-keeping/);
  assert.doesNotMatch(xml, /a-container-cleanup-you-can-explain/);
  assert.doesNotMatch(xml, /ask-ai-for-a-decision-not-a-performance/);
  assert.doesNotMatch(xml, /draft/);
});
