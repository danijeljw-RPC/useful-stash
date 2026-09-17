import assert from 'node:assert/strict';
import test from 'node:test';

import { articleSchema, authorSchema, projectSchema } from '../src/schemas/content.ts';
import {
  assertContentIntegrity,
  isArticleVisible,
  isProjectVisible,
  sortArticles,
} from '../src/utils/content.ts';

const validArticle = {
  title: 'A useful article',
  slug: 'a-useful-article',
  description: 'A sufficiently descriptive summary for the article.',
  publishedAt: new Date('2026-09-18T00:00:00Z'),
  draft: false,
  fixture: false,
  tags: ['Tools'],
  authors: ['dj'],
  heroImage: '/social-card.png',
  heroImageAlt: 'Useful Stash title card',
  seo: { canonical: null, noindex: false },
};

test('article schema accepts a complete ordinary article and nullable platform links', () => {
  assert.equal(articleSchema.safeParse(validArticle).success, true);
  assert.equal(authorSchema.safeParse({
    name: 'DJ Wynyard', slug: 'dj', role: 'Author and creator', bio: null, avatar: null,
    avatarAlt: 'DJ Wynyard', website: 'https://usefulstash.com',
    socials: { github: null, x: null, bluesky: null, mastodon: null, twitch: null, youtube: null, linkedin: null },
    seo: { canonical: null, noindex: false },
  }).success, true);
});

test('article schema rejects incomplete media and episode blocks', () => {
  const invalid = [
    { ...validArticle, articleAudio: { url: '/narration.mp3', mimeType: 'audio/mpeg' } },
    { ...validArticle, audio: { url: '/episode.mp3', mimeType: 'audio/mpeg' } },
    { ...validArticle, video: { hosted: '/episode.mp4' } },
    { ...validArticle, episode: 1 },
    { ...validArticle, podcast: { guid: 'urn:uuid:019d0000-0000-7000-8000-000000000001', season: 1, episodeType: 'full' } },
    { ...validArticle, heroImageAlt: undefined },
  ];

  for (const candidate of invalid) assert.equal(articleSchema.safeParse(candidate).success, false);
});

test('content integrity rejects duplicate slugs, duplicate episodes, and unknown authors', () => {
  const episode = {
    ...validArticle,
    episode: 1,
    audio: { url: 'https://media.usefulstash.com/episode.mp3', mimeType: 'audio/mpeg', bytes: 123 },
    podcast: {
      guid: 'urn:uuid:019d0000-0000-7000-8000-000000000001', season: 1, episodeType: 'full', explicit: false,
      spotify: null, applePodcasts: null,
    },
  };
  assert.throws(() => assertContentIntegrity([{ id: 'one', data: episode }, { id: 'two', data: episode }], ['dj']), /duplicate slug/i);
  assert.throws(() => assertContentIntegrity([{ id: 'one', data: episode }, { id: 'two', data: { ...episode, slug: 'another' } }], ['dj']), /duplicate season\/episode/i);
  assert.throws(() => assertContentIntegrity([{ id: 'one', data: { ...validArticle, authors: ['missing'] } }], ['dj']), /unknown author/i);
});

test('publishable selectors exclude fixtures, drafts, and noindex content in production', () => {
  assert.equal(isArticleVisible(validArticle, true), true);
  assert.equal(isArticleVisible({ ...validArticle, fixture: true }, true), false);
  assert.equal(isArticleVisible({ ...validArticle, fixture: true }, false), true);
  assert.equal(isArticleVisible({ ...validArticle, draft: true }, true), false);
  assert.equal(isArticleVisible({ ...validArticle, seo: { canonical: null, noindex: true } }, true), false);
  assert.equal(isProjectVisible({ draft: true }, true), false);
  assert.equal(isProjectVisible({ draft: true }, false), true);
});

test('article sorting uses published date descending and slug as a stable tie-breaker', () => {
  const sorted = sortArticles([
    { data: { ...validArticle, slug: 'z-last' } },
    { data: { ...validArticle, slug: 'a-first' } },
    { data: { ...validArticle, slug: 'newer', publishedAt: new Date('2026-09-19T00:00:00Z') } },
  ]);
  assert.deepEqual(sorted.map((entry) => entry.data.slug), ['newer', 'a-first', 'z-last']);
});

test('project schema stays deliberately separate from episode metadata', () => {
  const project = {
    title: 'Local draft project', slug: 'local-draft-project',
    description: 'A local-only project used to exercise draft behavior.',
    publishedAt: new Date('2026-09-18T00:00:00Z'), lastUpdated: new Date('2026-09-18T00:00:00Z'), draft: true,
  };
  assert.equal(projectSchema.safeParse(project).success, true);
  assert.equal(projectSchema.safeParse({ ...project, episode: 1 }).success, false);
});
