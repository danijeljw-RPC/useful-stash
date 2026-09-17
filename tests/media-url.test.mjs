import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveMediaUrl } from '../src/utils/media-url.ts';

test('root-relative media paths resolve against the media host', () => {
  assert.equal(
    resolveMediaUrl('/podcasts/season-01/episode-001/example.mp3'),
    'https://media.usefulstash.com/podcasts/season-01/episode-001/example.mp3',
  );
});

test('absolute HTTPS media URLs pass through unchanged', () => {
  assert.equal(resolveMediaUrl('https://cdn.example.com/file.mp4'), 'https://cdn.example.com/file.mp4');
});

test('unsafe and malformed media values fail closed', () => {
  for (const value of ['//example.com/file.mp3', 'http://example.com/file.mp3', 'relative.mp3', '', '   ', 42, null]) {
    assert.throws(() => resolveMediaUrl(value), /media URL/i);
  }
});

