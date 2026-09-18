// Cloudflare's documented "always passes" test site key. Safe to ship in
// client-side HTML for local development and previews. The production site
// key is a public value too (Turnstile site keys are not secret) but should
// be set via the PUBLIC_TURNSTILE_SITE_KEY environment variable so this
// repository does not hard-code the real one.
// https://developers.cloudflare.com/turnstile/troubleshooting/testing/
const TEST_SITE_KEY = '1x00000000000000000000AA';

export function getTurnstileSiteKey(env?: { PUBLIC_TURNSTILE_SITE_KEY?: string }): string {
  return env?.PUBLIC_TURNSTILE_SITE_KEY || import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || TEST_SITE_KEY;
}
