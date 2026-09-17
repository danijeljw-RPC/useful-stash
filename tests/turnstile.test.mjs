import assert from 'node:assert/strict';
import test from 'node:test';

import { verifyTurnstile } from '../src/lib/submissions/turnstile.ts';

test('Turnstile accepts only success with the expected action and hostname', async () => {
  const fetcher = async () => Response.json({ success: true, action: 'contact-media', hostname: 'usefulstash.com' });
  assert.equal(await verifyTurnstile({ token: 'token', secret: 'secret', remoteIp: '203.0.113.2', expectedAction: 'contact-media', allowedHostnames: ['usefulstash.com'], fetcher }), true);
  assert.equal(await verifyTurnstile({ token: 'token', secret: 'secret', remoteIp: '203.0.113.2', expectedAction: 'be-a-guest', allowedHostnames: ['usefulstash.com'], fetcher }), false);
});

test('Turnstile fails closed for replay, malformed, oversized, non-2xx, and network responses', async () => {
  const base = { secret: 'secret', remoteIp: '', expectedAction: 'contact-media', allowedHostnames: ['usefulstash.com'] };
  assert.equal(await verifyTurnstile({ ...base, token: '', fetcher: fetch }), false);
  assert.equal(await verifyTurnstile({ ...base, token: 'x'.repeat(2049), fetcher: fetch }), false);
  assert.equal(await verifyTurnstile({ ...base, token: 'token', fetcher: async () => Response.json({ success: false, 'error-codes': ['timeout-or-duplicate'] }) }), false);
  assert.equal(await verifyTurnstile({ ...base, token: 'token', fetcher: async () => new Response('bad', { status: 503 }) }), false);
  assert.equal(await verifyTurnstile({ ...base, token: 'token', fetcher: async () => { throw new Error('offline'); } }), false);
});
