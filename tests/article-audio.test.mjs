import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { parse } from 'yaml';

import { articleSchema } from '../src/schemas/content.ts';
import { usedEpisodes, uuid7, writeAudio } from '../scripts/lib/article-audio.mjs';

const article = `---
title: A useful article
slug: a-useful-article
description: A sufficiently descriptive summary.
publishedAt: 2026-09-25
draft: true
authors:
  - dj
tags:
  - AI
seo:
  canonical: null
  noindex: false
---

Body stays **exactly** as it was.
`;

const frontmatter = (text) => parse(text.match(/^---\n([\s\S]*?)\n---/)[1]);

test('uuid7 produces GUIDs the podcast schema accepts', () => {
  assert.match(uuid7(), /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('writeAudio adds schema-valid audio metadata, keeps the body, and keeps an existing GUID on re-run', () => {
  const dir = mkdtempSync(join(tmpdir(), 'article-audio-'));
  try {
    const path = join(dir, 'a-useful-article.md');
    writeFileSync(path, article);
    const update = {
      duration: '18:23', series: 'Useful Stash', episode: 1,
      audio: { url: '/blog-articles/audio/season-01/episode-001/a-useful-article-s01e001.mp3', bytes: 14078036 },
      podcast: { guid: uuid7(), season: 1 },
    };
    writeAudio(path, update);
    const written = readFileSync(path, 'utf8');
    assert.match(written, /^duration: "18:23"$/m);
    assert.match(written, /publishedAt: 2026-09-25\n/);
    assert.ok(written.endsWith('\n---\n\nBody stays **exactly** as it was.\n'));

    const data = frontmatter(written);
    assert.equal(articleSchema.safeParse(data).success, true);
    assert.equal(data.audio.mimeType, 'audio/mpeg');

    writeAudio(path, { ...update, duration: '19:00', podcast: { guid: uuid7(), season: 1 } });
    const rerun = frontmatter(readFileSync(path, 'utf8'));
    assert.equal(rerun.podcast.guid, update.podcast.guid);
    assert.equal(rerun.duration, '19:00');

    assert.deepEqual(usedEpisodes(dir, 1), [{ episode: 1, slug: 'a-useful-article' }]);
    assert.deepEqual(usedEpisodes(dir, 2), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
