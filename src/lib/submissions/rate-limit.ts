export async function hashClientAddress(address: string, key: string): Promise<string> {
  if (!key) throw new Error('Rate-limit key is required.');
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey('raw', encoder.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(address || 'unknown'));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function checkRateLimit(
  db: D1Database,
  addressHash: string,
  options: { now?: Date; limit?: number; windowSeconds?: number } = {},
): Promise<boolean> {
  const nowSeconds = Math.floor((options.now ?? new Date()).valueOf() / 1_000);
  const limit = options.limit ?? 5;
  const windowSeconds = options.windowSeconds ?? 600;
  const row = await db.prepare(`INSERT INTO rate_limits (address_hash, window_started_at, attempts)
    VALUES (?, ?, 1)
    ON CONFLICT(address_hash) DO UPDATE SET
      window_started_at = CASE WHEN excluded.window_started_at - rate_limits.window_started_at >= ? THEN excluded.window_started_at ELSE rate_limits.window_started_at END,
      attempts = CASE WHEN excluded.window_started_at - rate_limits.window_started_at >= ? THEN 1 ELSE rate_limits.attempts + 1 END
    RETURNING attempts`).bind(addressHash, nowSeconds, windowSeconds, windowSeconds).first<{ attempts: number }>();
  return Boolean(row && row.attempts <= limit);
}
