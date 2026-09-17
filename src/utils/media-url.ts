import { site } from '../config/site.ts';

export function resolveMediaUrl(value: unknown, origin = site.mediaUrl): string {
  if (typeof value !== 'string' || value.trim() !== value || value.length === 0) {
    throw new TypeError('Media URL must be a non-empty string without surrounding whitespace.');
  }

  if (value.startsWith('//')) throw new TypeError('Media URL must not be protocol-relative.');
  if (value.startsWith('/')) return `${origin.replace(/\/+$/, '')}${value}`;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new TypeError('Media URL must be root-relative or an absolute HTTPS URL.');
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new TypeError('Media URL must use HTTPS and must not contain credentials.');
  }
  return parsed.href;
}
