import { checkRateLimit, hashClientAddress } from './rate-limit.ts';
import { createSubmission } from './repository.ts';
import { verifyTurnstile } from './turnstile.ts';
import type { SubmissionKind } from './types.ts';
import { validateSubmission } from './validation.ts';

const allowedHostnames = ['usefulstash.com'];
const MAX_BODY_BYTES = 32_768;

const turnstileSecretByKind: Record<SubmissionKind, string> = {
  media: 'TURNSTILE_SECRET_MEDIA',
  guest: 'TURNSTILE_SECRET_GUEST',
  story: 'TURNSTILE_SECRET_STORY',
};

const turnstileActionByKind: Record<SubmissionKind, string> = {
  media: 'contact-media',
  guest: 'be-a-guest',
  story: 'share-story-question',
};

export type SubmissionEnv = {
  SUBMISSIONS_DB: D1Database;
  RATE_LIMIT_KEY?: string;
  TURNSTILE_SECRET_MEDIA?: string;
  TURNSTILE_SECRET_GUEST?: string;
  TURNSTILE_SECRET_STORY?: string;
};

type HandleResult = { status: number; body: { ok: true; reference: string } | { ok: false; errors?: Record<string, string>; message: string } };

function genericError(status: number, message: string): HandleResult {
  return { status, body: { ok: false, message } };
}

/**
 * Parses and validates the raw request shape only: content type, size
 * limits, JSON well-formedness, and the honeypot short-circuit. Split out
 * from `handleSubmission` so it can be unit tested without a live D1/env
 * binding (see tests/handle-submission.test.mjs).
 */
export async function parseSubmissionRequest(request: Request): Promise<
  | { ok: true; body: Record<string, unknown>; isHoneypot: boolean }
  | { ok: false; result: HandleResult }
> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return { ok: false, result: genericError(415, 'Unsupported content type.') };
  }

  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (contentLength > MAX_BODY_BYTES) {
    return { ok: false, result: genericError(413, 'Request too large.') };
  }

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return { ok: false, result: genericError(413, 'Request too large.') };
    raw = JSON.parse(text);
  } catch {
    return { ok: false, result: genericError(400, 'Malformed request body.') };
  }

  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, result: genericError(400, 'Malformed request body.') };
  }

  const body = raw as Record<string, unknown>;
  const isHoneypot = typeof body.honeypot === 'string' && body.honeypot.trim() !== '';
  return { ok: true, body, isHoneypot };
}

export async function handleSubmission(request: Request, kind: SubmissionKind, env: SubmissionEnv): Promise<HandleResult> {
  const parsed = await parseSubmissionRequest(request);
  if (!parsed.ok) return parsed.result;

  if (parsed.isHoneypot) {
    // Silently succeed to avoid tipping off bots, without ever persisting the submission.
    return { status: 200, body: { ok: true, reference: 'USTSH-00000000' } };
  }

  const body = parsed.body;
  const clientAddress = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const rateLimitKey = env.RATE_LIMIT_KEY;
  if (!rateLimitKey) {
    return genericError(500, 'Server is not configured. Please try again later.');
  }

  const addressHash = await hashClientAddress(clientAddress, rateLimitKey);
  const withinLimit = await checkRateLimit(env.SUBMISSIONS_DB, addressHash);
  if (!withinLimit) {
    return genericError(429, 'Too many submissions. Please try again later.');
  }

  const turnstileToken = body.turnstileToken;
  const secret = env[turnstileSecretByKind[kind] as keyof SubmissionEnv] as string | undefined;
  if (!secret) {
    return genericError(500, 'Server is not configured. Please try again later.');
  }

  const turnstileOk = await verifyTurnstile({
    token: turnstileToken,
    secret,
    remoteIp: clientAddress === 'unknown' ? undefined : clientAddress,
    expectedAction: turnstileActionByKind[kind],
    allowedHostnames,
  });
  if (!turnstileOk) {
    return genericError(403, 'Verification failed. Please try again.');
  }

  const { turnstileToken: _token, ...fields } = body;
  const validation = validateSubmission(kind, fields);
  if (!validation.ok) {
    return { status: 422, body: { ok: false, errors: validation.errors, message: 'Please check the form and try again.' } };
  }

  try {
    const stored = await createSubmission(env.SUBMISSIONS_DB, validation.value);
    return { status: 201, body: { ok: true, reference: stored.publicReference } };
  } catch {
    return genericError(500, 'Something went wrong. Please try again.');
  }
}
