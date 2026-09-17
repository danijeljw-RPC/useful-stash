type SiteverifyResult = { success?: boolean; action?: string; hostname?: string; 'error-codes'?: string[] };
type VerifyInput = {
  token: unknown; secret: string; remoteIp?: string; expectedAction: string; allowedHostnames: string[];
  fetcher?: typeof fetch;
};

export async function verifyTurnstile(input: VerifyInput): Promise<boolean> {
  if (typeof input.token !== 'string' || input.token.length === 0 || input.token.length > 2_048 || !input.secret || input.allowedHostnames.length === 0) return false;
  const fetcher = input.fetcher ?? fetch;
  try {
    const response = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({
        secret: input.secret,
        response: input.token,
        ...(input.remoteIp ? { remoteip: input.remoteIp } : {}),
        idempotency_key: crypto.randomUUID(),
      }),
    });
    if (!response.ok) return false;
    const result = await response.json() as SiteverifyResult;
    return result.success === true && result.action === input.expectedAction && input.allowedHostnames.includes(result.hostname ?? '');
  } catch {
    return false;
  }
}
