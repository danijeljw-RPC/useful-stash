#!/usr/bin/env node
// Frontmatter helper for scripts/publish-article-audio.sh.
//
//   read <article.md>                      -> JSON of the frontmatter (dates as YYYY-MM-DD)
//   used-episodes <articles-dir> <season>  -> used episode numbers in that season, one per line
//   write <article.md> <json-file>         -> set duration/series/episode/audio/podcast in place
//   validate <article.md>                  -> exit 1 listing the issues if it fails the article schema
//   uuid7                                  -> a new urn:uuid v7 (the schema requires v7 GUIDs)
//
// The YAML Document API keeps key order, comments and untouched formatting as they are.
import { randomBytes } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Scalar, parseDocument } from 'yaml';

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/;

function split(path) {
  const source = readFileSync(path, 'utf8');
  const match = source.match(FRONTMATTER);
  if (!match) throw new Error(`No frontmatter found in ${path}`);
  return { source, match, doc: parseDocument(match[1]) };
}

function toJson(doc) {
  return JSON.parse(JSON.stringify(doc.toJS(), (_key, value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value)));
}

function quoted(value) {
  const scalar = new Scalar(value);
  scalar.type = Scalar.QUOTE_DOUBLE;
  return scalar;
}

export function uuid7() {
  const bytes = randomBytes(16);
  const ms = BigInt(Date.now());
  for (let i = 0; i < 6; i += 1) bytes[i] = Number((ms >> BigInt(8 * (5 - i))) & 0xffn);
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `urn:uuid:${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function usedEpisodes(dir, season) {
  const used = [];
  for (const name of readdirSync(dir)) {
    if (!/\.mdx?$/.test(name)) continue;
    const data = toJson(split(join(dir, name)).doc) ?? {};
    if (data.episode && data.podcast?.season === season) used.push({ episode: data.episode, slug: data.slug });
  }
  return used;
}

export function writeAudio(path, update) {
  const { source, match, doc } = split(path);
  const existing = toJson(doc) ?? {};

  doc.set('duration', quoted(update.duration));
  doc.set('series', update.series);
  doc.set('episode', update.episode);
  doc.set('audio', doc.createNode({ url: update.audio.url, mimeType: 'audio/mpeg', bytes: update.audio.bytes }));
  // Keep anything already set on podcast (GUID, Spotify/Apple links, explicit flag) and fill the rest.
  doc.set('podcast', doc.createNode({
    guid: existing.podcast?.guid ?? update.podcast.guid,
    season: update.podcast.season,
    episodeType: existing.podcast?.episodeType ?? update.podcast.episodeType ?? 'full',
    explicit: existing.podcast?.explicit ?? false,
    spotify: existing.podcast?.spotify ?? null,
    applePodcasts: existing.podcast?.applePodcasts ?? null,
  }));

  const yaml = doc.toString({ lineWidth: 0 }).replace(/\n$/, '');
  writeFileSync(path, `---\n${yaml}\n---${match[2]}${source.slice(match[0].length)}`);
}

const [command, ...args] = process.argv.slice(2);
if (import.meta.url === `file://${process.argv[1]}`) {
  switch (command) {
    case 'read':
      process.stdout.write(`${JSON.stringify(toJson(split(args[0]).doc))}\n`);
      break;
    case 'used-episodes':
      for (const { episode, slug } of usedEpisodes(args[0], Number(args[1]))) process.stdout.write(`${episode}\t${slug}\n`);
      break;
    case 'write':
      writeAudio(args[0], JSON.parse(readFileSync(args[1], 'utf8')));
      break;
    case 'validate': {
      const { articleSchema } = await import('../../src/schemas/content.ts');
      const result = articleSchema.safeParse(toJson(split(args[0]).doc));
      if (!result.success) {
        for (const issue of result.error.issues) process.stderr.write(`  ${issue.path.join('.') || '(root)'}: ${issue.message}\n`);
        process.exit(1);
      }
      break;
    }
    case 'uuid7':
      process.stdout.write(`${uuid7()}\n`);
      break;
    default:
      process.stderr.write('Usage: article-audio.mjs read|used-episodes|write|uuid7 ...\n');
      process.exit(64);
  }
}
