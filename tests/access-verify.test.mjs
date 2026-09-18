import assert from 'node:assert/strict';
import test from 'node:test';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';

import { verifyAccessAssertion } from '../src/lib/access/verify.ts';

const teamDomain = 'usefulstash-team.cloudflareaccess.com';
const audience = 'test-aud-tag';

async function setup() {
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const jwk = await exportJWK(publicKey);
  jwk.kid = 'test-key';
  jwk.alg = 'RS256';
  jwk.use = 'sig';

  const fetcher = async (url) => {
    if (String(url).includes('/cdn-cgi/access/certs')) {
      return new Response(JSON.stringify({ keys: [jwk] }), { headers: { 'Content-Type': 'application/json' } });
    }
    throw new Error(`Unexpected fetch: ${url}`);
  };

  const sign = (overrides = {}) => new SignJWT({ email: 'danijel@repasscloud.com', ...overrides })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
    .setIssuedAt()
    .setIssuer(overrides.issuer ?? `https://${teamDomain}`)
    .setAudience(overrides.audience ?? audience)
    .setExpirationTime(overrides.exp ?? '5m')
    .sign(privateKey);

  return { fetcher, sign };
}

test('accepts a validly signed Access JWT with the expected issuer, audience, and a non-empty email', async () => {
  const { fetcher, sign } = await setup();
  const token = await sign();
  const result = await verifyAccessAssertion({ assertion: token, teamDomain, audience, fetcher });
  assert.equal(result.ok, true);
  assert.equal(result.ok && result.email, 'danijel@repasscloud.com');
});

test('rejects a missing assertion, team domain, or audience without attempting verification', async () => {
  assert.equal((await verifyAccessAssertion({ assertion: null, teamDomain, audience })).ok, false);
  assert.equal((await verifyAccessAssertion({ assertion: 'token', teamDomain: undefined, audience })).ok, false);
  assert.equal((await verifyAccessAssertion({ assertion: 'token', teamDomain, audience: undefined })).ok, false);
});

test('rejects a wrong audience, wrong issuer, expired token, or empty email', async () => {
  const { fetcher, sign } = await setup();

  const wrongAudience = await sign({ audience: 'someone-elses-aud' });
  assert.equal((await verifyAccessAssertion({ assertion: wrongAudience, teamDomain, audience, fetcher })).ok, false);

  const wrongIssuer = await sign({ issuer: 'https://attacker.example.com' });
  assert.equal((await verifyAccessAssertion({ assertion: wrongIssuer, teamDomain, audience, fetcher })).ok, false);

  const expired = await sign({ exp: Math.floor(Date.now() / 1000) - 60 });
  assert.equal((await verifyAccessAssertion({ assertion: expired, teamDomain, audience, fetcher })).ok, false);

  const noEmail = await sign({ email: '' });
  assert.equal((await verifyAccessAssertion({ assertion: noEmail, teamDomain, audience, fetcher })).ok, false);
});

test('rejects a malformed or unsigned token', async () => {
  const { fetcher } = await setup();
  assert.equal((await verifyAccessAssertion({ assertion: 'not-a-jwt', teamDomain, audience, fetcher })).ok, false);
  assert.equal((await verifyAccessAssertion({ assertion: '', teamDomain, audience, fetcher })).ok, false);
});
