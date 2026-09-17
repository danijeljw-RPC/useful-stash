import { z } from 'zod';
import type { SubmissionKind, ValidatedSubmission } from './types.ts';

const trimmed = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.preprocess((value) => typeof value === 'string' && value.trim() === '' ? undefined : value, z.string().trim().max(max).optional());
const email = z.email().max(254);
const optionalEmail = z.preprocess((value) => typeof value === 'string' && value.trim() === '' ? undefined : value, email.optional());
const httpsUrl = z.url().refine((value) => new URL(value).protocol === 'https:', 'URL must use HTTPS.');
const optionalUrl = z.preprocess((value) => typeof value === 'string' && value.trim() === '' ? undefined : value, httpsUrl.optional());
const yes = z.literal('yes').transform(() => true);
const yesNo = z.enum(['yes', 'no']).transform((value) => value === 'yes');
const base = { honeypot: z.literal('').optional().default('') };

const mediaSchema = z.object({
  ...base, name: trimmed(100), email, organisation: trimmed(150), details: trimmed(5_000),
  role: optionalText(100), phone: optionalText(50), deadline: optionalText(100), website: optionalUrl,
  supportingLinks: optionalText(2_000), contactPermission: yes,
}).strict().transform(({ honeypot: _honeypot, ...value }) => ({ ...value, kind: 'media' as const }));

const guestSchema = z.object({
  ...base, name: trimmed(100), preferredName: optionalText(100), email, biography: trimmed(2_000),
  proposedSubject: trimmed(300), suitability: trimmed(3_000), locationTimezone: optionalText(100),
  website: optionalUrl, socialLinks: optionalText(2_000), previousAppearances: optionalText(2_000),
  supportingNotes: optionalText(3_000), recordingPermission: yes,
}).strict().transform(({ honeypot: _honeypot, ...value }) => ({ ...value, kind: 'guest' as const, contactPermission: true }));

const storySchema = z.object({
  ...base, subtype: z.enum(['story', 'question']), content: trimmed(10_000),
  identityChoice: z.enum(['real-name', 'pseudonym', 'anonymous']), name: optionalText(100), pseudonym: optionalText(100),
  email: optionalEmail, publicationPermission: z.enum(['quote', 'paraphrase', 'private']), contactPermission: yesNo,
}).strict().superRefine((value, context) => {
  if (value.identityChoice === 'real-name' && !value.name) context.addIssue({ code: 'custom', path: ['name'], message: 'Name is required.' });
  if (value.identityChoice === 'pseudonym' && !value.pseudonym) context.addIssue({ code: 'custom', path: ['pseudonym'], message: 'Pseudonym is required.' });
  if (value.contactPermission && !value.email) context.addIssue({ code: 'custom', path: ['email'], message: 'Email is required for contact permission.' });
}).transform(({ honeypot: _honeypot, ...value }) => ({ ...value, kind: 'story' as const }));

const schemas = { media: mediaSchema, guest: guestSchema, story: storySchema };
export type ValidationResult = { ok: true; value: ValidatedSubmission } | { ok: false; errors: Record<string, string> };

export function validateSubmission(kind: SubmissionKind, raw: unknown): ValidationResult {
  const result = schemas[kind].safeParse(raw);
  if (result.success) return { ok: true, value: result.data as ValidatedSubmission };
  return { ok: false, errors: Object.fromEntries(result.error.issues.map((issue) => [issue.path.join('.') || 'form', issue.message])) };
}

