import assert from 'node:assert/strict';
import test from 'node:test';
import { XMLParser } from 'fast-xml-parser';

import { serializePodcastFeed } from '../src/utils/podcast-rss.ts';
import { serializeSiteFeed } from '../src/utils/feed-xml.ts';
import { serializeVideocastFeed } from '../src/utils/videocast-rss.ts';

const parser = new XMLParser({ ignoreAttributes: false });
const base = {
  title: 'A & B <useful>', slug: 'a-useful-post', description: 'Clear & safe <summary>',
  publishedAt: new Date('2026-09-18T00:00:00Z'), updatedAt: undefined, tags: ['Tools & Work'],
  draft: false, fixture: false, authors: ['dj'], heroImage: '/social-card.png', heroImageAlt: 'Card',
  seo: { canonical: null, noindex: false },
};
const episode = {
  ...base, episode: 2,
  articleAudio: { url: 'https://media.usefulstash.com/narration.mp3', mimeType: 'audio/mpeg', bytes: 10 },
  audio: { url: 'https://media.usefulstash.com/podcast.mp3', mimeType: 'audio/mpeg', bytes: 20 },
  video: { youtube: null, hosted: 'https://media.usefulstash.com/video.mp4', mimeType: 'video/mp4', bytes: 30, spotify: null },
  transcript: 'https://media.usefulstash.com/captions.vtt',
  podcast: { guid: 'urn:uuid:019d0000-0000-7000-8000-000000000001', season: 1, episodeType: 'full', explicit: false, spotify: null, applePodcasts: null },
};

test('site feed includes articles and projects without enclosures and escapes XML', () => {
  const xml = serializeSiteFeed([base], [{ title: 'Project', slug: 'project', description: 'Project description', publishedAt: new Date('2026-09-01'), lastUpdated: new Date('2026-09-19'), draft: false }]);
  const parsed = parser.parse(xml);
  assert.equal(parsed.rss.channel.item.length, 2);
  assert.equal(xml.includes('<enclosure'), false);
  assert.match(xml, /A &amp; B &lt;useful&gt;/);
  assert.match(xml, /https:\/\/usefulstash\.com\/projects\/project\//);
});

test('podcast feed uses only podcast audio and preserves episode metadata', () => {
  const xml = serializePodcastFeed([episode, base]);
  const parsed = parser.parse(xml);
  const item = parsed.rss.channel.item;
  assert.equal(item.enclosure['@_url'], episode.audio.url);
  assert.equal(item.enclosure['@_length'], '20');
  assert.equal(item['itunes:season'], 1);
  assert.equal(item['itunes:episode'], 2);
  assert.equal(item.guid['#text'], episode.podcast.guid);
  assert.equal(xml.includes('narration.mp3'), false);
  assert.match(xml, /podcast:transcript/);
});

test('videocast feed uses video enclosure and a video-specific stable GUID', () => {
  const xml = serializeVideocastFeed([episode, { ...episode, slug: 'audio-only', video: undefined }]);
  const parsed = parser.parse(xml);
  const item = parsed.rss.channel.item;
  assert.equal(item.enclosure['@_url'], episode.video.hosted);
  assert.equal(item.enclosure['@_type'], 'video/mp4');
  assert.equal(item.guid['#text'], `${episode.podcast.guid}-video`);
});
