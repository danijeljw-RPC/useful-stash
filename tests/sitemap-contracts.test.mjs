import assert from 'node:assert/strict';
import test from 'node:test';
import { XMLParser } from 'fast-xml-parser';

import { paginateSitemap, serializeSitemapIndex, serializeUrlSitemap, serializeVideoSitemap } from '../src/utils/sitemap.ts';

const parser = new XMLParser({ ignoreAttributes: false });

test('sitemap pagination remains deterministic beyond one child page', () => {
  const pages = paginateSitemap(Array.from({ length: 5 }, (_, index) => ({ loc: `https://usefulstash.com/${index}/` })), 2);
  assert.deepEqual(pages.map((page) => page.map((entry) => entry.loc)), [
    ['https://usefulstash.com/0/', 'https://usefulstash.com/1/'],
    ['https://usefulstash.com/2/', 'https://usefulstash.com/3/'],
    ['https://usefulstash.com/4/'],
  ]);
});

test('sitemap index and children serialize absolute canonical URLs and truthful dates', () => {
  const index = serializeSitemapIndex(['https://usefulstash.com/sitemaps/pages-1.xml', 'https://usefulstash.com/sitemaps/pages-2.xml']);
  const urls = serializeUrlSitemap([{ loc: 'https://usefulstash.com/stash/a/', lastmod: new Date('2026-09-18T00:00:00Z') }]);
  assert.equal(parser.parse(index).sitemapindex.sitemap.length, 2);
  assert.match(urls, /<lastmod>2026-09-18<\/lastmod>/);
  assert.throws(() => serializeUrlSitemap([{ loc: 'http://usefulstash.com/insecure/' }]), /HTTPS/);
});

test('video sitemap keeps watch, media, thumbnail, and metadata aligned', () => {
  const xml = serializeVideoSitemap([{
    loc: 'https://usefulstash.com/stash/video/watch/', lastmod: new Date('2026-09-18'),
    title: 'Video & guide', description: 'Watch <this>', thumbnail: 'https://usefulstash.com/social-card.png',
    content: 'https://media.usefulstash.com/video.mp4', publishedAt: new Date('2026-09-18'),
  }]);
  assert.match(xml, /xmlns:video="http:\/\/www.google.com\/schemas\/sitemap-video\/1.1"/);
  assert.match(xml, /Video &amp; guide/);
  assert.match(xml, /media\.usefulstash\.com\/video\.mp4/);
});
