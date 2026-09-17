import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');

async function readBuilt(path) {
  return readFile(join(dist, path), 'utf8');
}

test('build emits every public route and discovery file', async () => {
  const expected = [
    'index.html',
    'stash/index.html',
    'about/index.html',
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

test('article output includes editorial metadata, takeaway, and JSON-LD', async () => {
  const html = await readBuilt('stash/make-a-small-tool-worth-keeping/index.html');

  assert.match(html, /Sample article/);
  assert.match(html, /\[ TAKEAWAY \]/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /BlogPosting/);
  assert.match(html, /href="https:\/\/usefulstash\.com\/stash\/make-a-small-tool-worth-keeping\/"/);
});

test('RSS only exposes published fixture articles at canonical URLs', async () => {
  const xml = await readBuilt('rss.xml');

  assert.match(xml, /<title>Useful Stash<\/title>/);
  assert.match(xml, /https:\/\/usefulstash\.com\/stash\/make-a-small-tool-worth-keeping\//);
  assert.doesNotMatch(xml, /draft/);
});
