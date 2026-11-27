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

// The original sample articles were promoted from `fixture: true` to
// published articles; they must now be routable and discoverable.
const publishedArticles = [
  { slug: 'a-container-cleanup-you-can-explain', title: 'A container cleanup you can explain' },
  { slug: 'ask-ai-for-a-decision-not-a-performance', title: 'Ask AI for a decision, not a performance' },
  { slug: 'make-a-small-tool-worth-keeping', title: 'Make a small tool worth keeping' },
];

test('published articles build a full page with heading, JSON-LD, and takeaway', async () => {
  for (const { slug, title } of publishedArticles) {
    const html = await readBuilt(join('stash', slug, 'index.html'));

    assert.match(html, new RegExp(`<h1[^>]*>${title}`), `${slug} must render its title as the h1`);
    assert.match(html, /<script type="application\/ld\+json"/, `${slug} must emit JSON-LD`);
    assert.match(html, /takeaway/, `${slug} must render its takeaway`);
  }
});

test('RSS lists published articles and excludes drafts from the canonical feed', async () => {
  const xml = await readBuilt('rss.xml');

  assert.match(xml, /<title>Useful Stash<\/title>/);
  for (const { slug } of publishedArticles) {
    assert.match(xml, new RegExp(`<link>https://usefulstash\\.com/stash/${slug}/</link>`), `RSS must list ${slug}`);
  }
  assert.doesNotMatch(xml, /draft/);
});

test('sitemap lists published articles', async () => {
  const xml = await readBuilt(join('sitemaps', 'pages-1.xml'));

  for (const { slug } of publishedArticles) {
    assert.match(xml, new RegExp(`<loc>https://usefulstash\\.com/stash/${slug}/</loc>`), `sitemap must list ${slug}`);
  }
});

test('DJ author page publishes the full profile and reusable author sections', async () => {
  const html = await readBuilt('authors/dj/index.html');

  assert.match(html, /<h1[^>]*>DJ Wynyard<\/h1>/);
  assert.match(html, /God of Vortexa/);
  assert.match(html, /src="\/images\/authors\/dj\.png"/);
  assert.match(html, /alt="Portrait of DJ Wynyard"/);
  assert.match(html, /ADL\/SYD/);
  assert.match(html, /20\+ years/);
  assert.match(html, /C# and modern \.NET/);
  assert.match(html, /I build software, platforms and automation/);
  assert.match(html, /href="https:\/\/github\.com\/danijeljw"/);
  assert.match(html, /href="\/contact\/"/);
  assert.match(html, /<h2[^>]*>Published work<\/h2>/);
  await access(join(dist, 'images', 'authors', 'dj.png'));
});
