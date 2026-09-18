import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { convertV4MiniflareOptions, Miniflare } from 'miniflare';

import { handleSubmission, parseSubmissionRequest } from '../src/lib/submissions/handle-submission.ts';

function jsonRequest(body, headers = {}) {
  const text = JSON.stringify(body);
  return new Request('https://usefulstash.com/api/submissions/media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': String(text.length), ...headers },
    body: text,
  });
}

test('rejects non-JSON content types, oversized bodies, and malformed JSON', async () => {
  const wrongType = new Request('https://usefulstash.com/api/submissions/media', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{}' });
  const wrongTypeResult = await parseSubmissionRequest(wrongType);
  assert.equal(wrongTypeResult.ok, false);
  assert.equal(!wrongTypeResult.ok && wrongTypeResult.result.status, 415);

  const tooLarge = jsonRequest({}, { 'Content-Length': '999999' });
  const tooLargeResult = await parseSubmissionRequest(tooLarge);
  assert.equal(tooLargeResult.ok, false);
  assert.equal(!tooLargeResult.ok && tooLargeResult.result.status, 413);

  const malformed = new Request('https://usefulstash.com/api/submissions/media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'not-json' });
  const malformedResult = await parseSubmissionRequest(malformed);
  assert.equal(malformedResult.ok, false);
  assert.equal(!malformedResult.ok && malformedResult.result.status, 400);
});

test('flags the honeypot field without treating it as an error', async () => {
  const withHoneypot = jsonRequest({ honeypot: 'i-am-a-bot' });
  const result = await parseSubmissionRequest(withHoneypot);
  assert.equal(result.ok, true);
  assert.equal(result.ok && result.isHoneypot, true);

  const withoutHoneypot = jsonRequest({ honeypot: '' });
  const clean = await parseSubmissionRequest(withoutHoneypot);
  assert.equal(clean.ok, true);
  assert.equal(clean.ok && clean.isHoneypot, false);
});

async function database() {
  const mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script: 'export default { fetch() { return new Response("ok") } }', d1Databases: { SUBMISSIONS_DB: 'test' } }));
  const db = await mf.getD1Database('SUBMISSIONS_DB');
  const migration = await readFile(new URL('../migrations/0001_create_submissions.sql', import.meta.url), 'utf8');
  for (const statement of migration.split(';').map((value) => value.trim()).filter(Boolean)) await db.prepare(statement).run();
  return { mf, db };
}

test('a honeypot submission returns success without ever reaching D1', async () => {
  const { mf, db } = await database();
  try {
    const env = { SUBMISSIONS_DB: db, RATE_LIMIT_KEY: 'key', TURNSTILE_SECRET_MEDIA: 'secret' };
    const result = await handleSubmission(jsonRequest({ honeypot: 'spam' }), 'media', env);
    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    const row = await db.prepare('SELECT COUNT(*) AS count FROM submissions').first();
    assert.equal(row.count, 0);
  } finally { await mf.dispose(); }
});

test('a missing rate-limit key fails closed with a generic 500', async () => {
  const { mf, db } = await database();
  try {
    const env = { SUBMISSIONS_DB: db, TURNSTILE_SECRET_MEDIA: 'secret' };
    const result = await handleSubmission(jsonRequest({ name: 'A', email: 'a@example.com', organisation: 'O', details: 'D', contactPermission: 'yes' }), 'media', env);
    assert.equal(result.status, 500);
    assert.equal(result.body.ok, false);
  } finally { await mf.dispose(); }
});

test('a missing Turnstile secret fails closed with a generic 500', async () => {
  const { mf, db } = await database();
  try {
    const env = { SUBMISSIONS_DB: db, RATE_LIMIT_KEY: 'key' };
    const result = await handleSubmission(jsonRequest({ name: 'A', email: 'a@example.com', organisation: 'O', details: 'D', contactPermission: 'yes' }), 'media', env);
    assert.equal(result.status, 500);
    assert.equal(result.body.ok, false);
  } finally { await mf.dispose(); }
});

test('rate limiting closes off a client after too many rapid submissions', async () => {
  const { mf, db } = await database();
  try {
    const env = { SUBMISSIONS_DB: db, RATE_LIMIT_KEY: 'key', TURNSTILE_SECRET_MEDIA: 'secret' };
    const request = () => jsonRequest({ name: 'A', email: 'a@example.com', organisation: 'O', details: 'D', contactPermission: 'yes', turnstileToken: 'token' }, { 'cf-connecting-ip': '203.0.113.9' });
    for (let i = 0; i < 5; i += 1) await handleSubmission(request(), 'media', env);
    const blocked = await handleSubmission(request(), 'media', env);
    assert.equal(blocked.status, 429);
  } finally { await mf.dispose(); }
});
