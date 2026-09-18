import { createRemoteJWKSet, customFetch, jwtVerify } from 'jose';

// Cloudflare rotates Access signing keys; caching the JWKS per-isolate avoids
// refetching it on every admin request while still picking up rotations.
// Keyed by team domain so the cache never serves the wrong tenant's keys.
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(teamDomain: string, fetcher?: typeof fetch) {
  const cacheKey = fetcher ? `${teamDomain}::custom-fetcher` : teamDomain;
  let jwks = jwksCache.get(cacheKey);
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`https://${teamDomain}/cdn-cgi/access/certs`),
      fetcher ? { [customFetch]: fetcher } : undefined,
    );
    jwksCache.set(cacheKey, jwks);
  }
  return jwks;
}

export type AccessVerifyInput = {
  assertion: string | null | undefined;
  teamDomain: string | undefined;
  audience: string | undefined;
  /** Test-only override for the JWKS fetch. */
  fetcher?: typeof fetch;
};

export type AccessVerifyResult = { ok: true; email: string } | { ok: false };

/**
 * Verifies a Cloudflare Access `Cf-Access-Jwt-Assertion` header value.
 * Fails closed: any missing configuration, missing assertion, or invalid
 * token results in `{ ok: false }`.
 */
export async function verifyAccessAssertion(input: AccessVerifyInput): Promise<AccessVerifyResult> {
  if (!input.assertion || !input.teamDomain || !input.audience) return { ok: false };

  try {
    const jwks = getJwks(input.teamDomain, input.fetcher);
    const { payload } = await jwtVerify(input.assertion, jwks, {
      issuer: `https://${input.teamDomain}`,
      audience: input.audience,
    });

    const email = typeof payload.email === 'string' ? payload.email.trim() : '';
    if (!email) return { ok: false };

    return { ok: true, email };
  } catch {
    return { ok: false };
  }
}
