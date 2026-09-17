import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { convertV4MiniflareOptions, Miniflare } from 'miniflare';

import { createSubmission, deleteSubmission, getSubmission, listSubmissions, updateSubmissionStatus } from '../src/lib/submissions/repository.ts';
import { deleteExpiredSubmissions } from '../src/lib/submissions/retention.ts';
import { checkRateLimit, hashClientAddress } from '../src/lib/submissions/rate-limit.ts';

async function database() {
  const mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script: 'export default { fetch() { return new Response("ok") } }', d1Databases: { SUBMISSIONS_DB: 'test' } }));
  const db = await mf.getD1Database('SUBMISSIONS_DB');
  const migration = await readFile(new URL('../migrations/0001_create_submissions.sql', import.meta.url), 'utf8');
  for (const statement of migration.split(';').map((value) => value.trim()).filter(Boolean)) await db.prepare(statement).run();
  return { mf, db };
}

const payload = { kind: 'media', name: 'Reporter', email: 'reporter@example.com', organisation: 'Outlet', details: 'Details', contactPermission: true };

test('D1 repository persists, filters, pages, updates, and permanently deletes submissions', async () => {
  const { mf, db } = await database();
  try {
    const created = await createSubmission(db, payload, { now: new Date('2026-09-18T00:00:00Z'), reference: () => 'USTSH-ABC123' });
    assert.equal(created.publicReference, 'USTSH-ABC123');
    assert.equal((await getSubmission(db, 'USTSH-ABC123'))?.payload.email, 'reporter@example.com');
    assert.equal((await listSubmissions(db, { kind: 'media', status: 'new', page: 1, pageSize: 20 })).items.length, 1);
    await updateSubmissionStatus(db, 'USTSH-ABC123', 'contacted', 'admin@example.com', new Date('2026-09-18T01:00:00Z'));
    assert.equal((await getSubmission(db, 'USTSH-ABC123'))?.statusUpdatedBy, 'admin@example.com');
    assert.equal(await deleteSubmission(db, 'USTSH-ABC123'), true);
    assert.equal(await getSubmission(db, 'USTSH-ABC123'), null);
  } finally { await mf.dispose(); }
});

test('public reference collisions retry a bounded number of times', async () => {
  const { mf, db } = await database();
  try {
    const references = ['USTSH-COLLIDE', 'USTSH-COLLIDE', 'USTSH-SECOND'];
    await createSubmission(db, payload, { reference: () => references.shift() ?? 'USTSH-NEVER' });
    const second = await createSubmission(db, payload, { reference: () => references.shift() ?? 'USTSH-NEVER' });
    assert.equal(second.publicReference, 'USTSH-SECOND');
  } finally { await mf.dispose(); }
});

test('seven-day retention keeps younger rows and deletes rows at the UTC cutoff', async () => {
  const { mf, db } = await database();
  try {
    await createSubmission(db, payload, { now: new Date('2026-09-11T00:00:00Z'), reference: () => 'USTSH-EXPIRED' });
    await createSubmission(db, payload, { now: new Date('2026-09-11T00:00:01Z'), reference: () => 'USTSH-YOUNG' });
    assert.equal(await deleteExpiredSubmissions(db, new Date('2026-09-18T00:00:00Z')), 1);
    assert.equal(await getSubmission(db, 'USTSH-EXPIRED'), null);
    assert.notEqual(await getSubmission(db, 'USTSH-YOUNG'), null);
  } finally { await mf.dispose(); }
});

test('rate limiting stores only a keyed address hash and closes after the configured attempts', async () => {
  const { mf, db } = await database();
  try {
    const hash = await hashClientAddress('203.0.113.5', 'test-rate-key');
    assert.doesNotMatch(hash, /203\.0\.113\.5/);
    const now = new Date('2026-09-18T00:00:00Z');
    assert.equal(await checkRateLimit(db, hash, { now, limit: 2, windowSeconds: 600 }), true);
    assert.equal(await checkRateLimit(db, hash, { now, limit: 2, windowSeconds: 600 }), true);
    assert.equal(await checkRateLimit(db, hash, { now, limit: 2, windowSeconds: 600 }), false);
    const row = await db.prepare('SELECT address_hash FROM rate_limits').first();
    assert.equal(row.address_hash, hash);
  } finally { await mf.dispose(); }
});
