# Phase 7 overnight build — what changed, and what you need to do

This covers everything implemented against `docs/useful-stash-blog-upgrade.md`
Phase 7 (contact submissions and Access-protected admin), plus the SSR switch
that phase required. Read this before pushing to GitHub or deploying.

## Summary of what got built

- Astro switched from `output: 'static'` to `output: 'server'` with the
  Cloudflare adapter. Articles, projects, author pages, feeds, and sitemaps
  are still prerendered (`export const prerender = true` added to every
  static page/route) — only `/api/submissions/*` and `/admin/*` are dynamic.
- `/contact/` hub plus three form pages: `/contact/media/`,
  `/contact/be-a-guest/`, `/contact/share/`. Each has a honeypot field, a
  Cloudflare Turnstile widget, and posts as JSON to a matching
  `/api/submissions/*` endpoint via fetch.
- `/api/submissions/media`, `/guest`, `/story` — validate input (reusing the
  `validation.ts` you already had), verify Turnstile server-side, rate-limit
  by a hashed client IP, and persist to D1 via the existing
  `repository.ts`/`retention.ts`/`rate-limit.ts` modules.
- `/admin/submissions/` (list with kind/status filters + pagination),
  `/admin/submissions/[reference]/` (detail), plus protected
  `POST /admin/submissions/[reference]/status/` and `.../delete/` routes.
  Every admin response gets `Cache-Control: private, no-store` and
  `X-Robots-Tag: noindex, nofollow`.
- `src/middleware.ts` verifies the `Cf-Access-Jwt-Assertion` header against
  Cloudflare Access's remote JWKS (issuer, audience, expiry, non-empty
  email) for every `/admin/*` request and fails closed (403) on anything
  missing or invalid.
- A daily Cron Trigger (`0 3 * * *`, 3am UTC) calls a retention job that
  permanently deletes submissions older than 7 days.
- `robots.txt` now disallows `/admin/` and `/api/` as defense in depth.
- **Removed the `@astrojs/sitemap` integration.** It was silently winning
  the `/sitemap-index.xml` route over your own custom serializer, and its
  auto-discovery put `/admin/submissions/` straight into the public sitemap.
  Your hand-built `sitemap-index.xml.ts` + `sitemaps/*.xml.ts` now serve
  correctly — this was a real bug that a new production-output test caught
  (`tests/production-output-guard.test.mjs`).
- 15 new tests (Access JWT verify, same-origin checks, submission-handling
  edge cases, production-output guards). Full suite: `npm run check` (0
  errors/warnings), `npm run build`, `npm test` — all green as of this
  build.

## Before you do anything else

`npm run check`, `npm run build`, and `npm test` all pass cleanly right now.
Run them yourself first to confirm nothing drifted:

```bash
npm run check && npm run build && npm test
```

## One naming decision I made without asking you

The doc says: *"deploy one production Worker named `ustsh-blog`."* Your
existing `wrangler.jsonc` had `"name": "useful-stash"`. I changed it to
`"name": "ustsh-blog"` to match the spec. **This matters**: Cloudflare
Workers are identified by name, so this creates a *new* Worker on first
deploy rather than updating whatever Worker (if any) was previously
deployed as `useful-stash`. If you already have a live `useful-stash`
Worker serving `usefulstash.com`, you'll want to either:

- point the custom domain routing at the new `ustsh-blog` Worker and
  decommission the old `useful-stash` one, or
- rename back to `useful-stash` in `wrangler.jsonc` if you'd rather keep
  the existing Worker identity (the D1 binding and everything else works
  either way).

I did not deploy anything — this only affects what happens on your first
`npm run deploy`.

## Cloudflare dashboard setup (required before forms/admin work in production)

Three things need to exist in the Cloudflare dashboard that I cannot create
from here (no account access). Nothing will 500 if you skip these — Turnstile
verification fails closed (403) and Access middleware fails closed (403)
until they're configured, so the site is safe to deploy without them, just
non-functional for contact forms and admin until you finish this.

### 1. Turnstile — three widgets (or one widget, three actions)

The doc calls for one production Turnstile widget named `ustsh-blog-contact`.
Each form page passes a distinct `action` value that the server checks
(`contact-media`, `be-a-guest`, `share-story-question` — see
`src/lib/submissions/handle-submission.ts`), so **one widget covering all
three actions is fine** — you don't need three separate widgets.

Steps:

1. Cloudflare dashboard → Turnstile → Add widget.
2. Name: `ustsh-blog-contact`. Domain: `usefulstash.com`.
3. Widget mode: Managed (recommended).
4. Copy the **Site Key** (public) and **Secret Key** (private).

The site key goes into the build as `PUBLIC_TURNSTILE_SITE_KEY` (see
"Environment variables and secrets" below — it's a public build-time value,
not a runtime secret). The secret key becomes three Worker secrets (one per
action) — see the `wrangler secret put` commands below. It's the *same*
secret value repeated three times, since the form contract checks the
`action` field per-request but a single Turnstile secret validates against
Cloudflare's siteverify endpoint regardless of which action was requested.

### 2. Cloudflare Access — protect `/admin/*`

1. Zero Trust dashboard → Access → Applications → Add an application →
   Self-hosted.
2. Application name: something like `Useful Stash Admin`. Session duration:
   your call (24h is reasonable).
3. Application domain: `usefulstash.com`, path `/admin`. **Make sure the
   path covers descendants** (`/admin/*`) — the doc is explicit that both
   the index and nested detail pages must be covered.
4. Identity providers: enable **One-Time PIN** only. Cloudflare Zero Trust
   orgs no longer enable OTP by default — you may need to add it under
   Settings → Authentication → Login methods first.
5. Policy: Allow policy, **Include** rule with **Emails** exactly:
   - `danijel@repasscloud.com`
   - `dj.wynyard@icloud.com`

   **Do not** use "Include Everyone" or "Include Login Methods: One-time
   PIN" — the doc flags both as patterns that can let any valid email
   through. Use the explicit email list.
6. Save, then open the application's **Overview** tab and copy the
   **Application Audience (AUD) Tag** — a long hex string. That's your
   `ACCESS_AUD` value.
7. Your **team domain** is `<your-team-name>.cloudflareaccess.com` — visible
   in the Zero Trust dashboard URL or under Settings → Custom Pages. That's
   your `ACCESS_TEAM_DOMAIN` value.

### 3. D1 database

Already done — you ran this earlier tonight:

```
database_name: ustsh-blog-submissions
database_id:   797ed808-a6f3-43a6-9b49-146db37aa8ff
```

Already wired into `wrangler.jsonc` as the `SUBMISSIONS_DB` binding, and the
migration (`migrations/0001_create_submissions.sql`) has been applied to
the **remote** database. Nothing more to do here unless you rename the
Worker (D1 databases aren't affected by the Worker name).

## Environment variables and secrets — where each one goes

There are two kinds: one **public build-time variable** (baked into the
static HTML, safe to expose) and **five runtime secrets** (never in source
control, set via `wrangler secret put`).

### Public build-time variable

`PUBLIC_TURNSTILE_SITE_KEY` — set this before running `npm run build` for
production. Turnstile site keys are public by design (they're embedded in
client-side HTML), so this doesn't need to be a Worker secret. Options:

- Export it in your shell / CI before building:
  ```bash
  export PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAAA..."
  npm run deploy
  ```
- Or set it as a plain (non-secret) variable in `wrangler.jsonc` under
  `"vars"` if you'd rather have it committed (it's fine to commit, it's
  public) — but then `npm run build` still needs it as an env var too,
  since it's read at Astro *build* time (`src/config/turnstile.ts`), not
  request time. Simplest is the shell export above, every time you deploy.

If you skip this, forms fall back to Cloudflare's public "always passes"
test site key (`1x00000000000000000000AA`) — meaning the widget renders
and lets everything through with zero bot protection. Fine for a first
smoke-test deploy, not fine to leave in production.

### Runtime secrets (Worker secrets — set once per environment)

Run these from the repo root once you have real values:

```bash
npx wrangler secret put RATE_LIMIT_KEY
# Paste any long random string when prompted, e.g. output of:
#   openssl rand -hex 32

npx wrangler secret put TURNSTILE_SECRET_MEDIA
# Paste the Turnstile secret key from step 1 above

npx wrangler secret put TURNSTILE_SECRET_GUEST
# Same Turnstile secret key, repeated

npx wrangler secret put TURNSTILE_SECRET_STORY
# Same Turnstile secret key, repeated

npx wrangler secret put ACCESS_TEAM_DOMAIN
# e.g. your-team.cloudflareaccess.com — from Access setup step 2

npx wrangler secret put ACCESS_AUD
# The Application Audience (AUD) Tag from Access setup step 2
```

These are read at runtime via `import { env } from 'cloudflare:workers'`
(see `src/lib/submissions/handle-submission.ts` and `src/middleware.ts`).
Their shapes are declared in `src/env.d.ts` — both the global `Env`
interface and `Cloudflare.Env` (the adapter's `cloudflare:workers` module
resolves types against `Cloudflare.Env` specifically, not global `Env` —
this tripped up `npm run check` once tonight until I added both).

### Local development

Copy `.dev.vars.example` to `.dev.vars` (gitignored, never commit it):

```bash
cp .dev.vars.example .dev.vars
```

It ships with Cloudflare's documented Turnstile test secret (always
passes) for all three forms, so forms work locally without any real
Turnstile setup. `ACCESS_TEAM_DOMAIN`/`ACCESS_AUD` are left as obvious
placeholders — `/admin/*` will correctly 403 locally until you either put
real values in or accept that admin testing needs the deployed environment
(with Access actually protecting it).

You'll also need to apply the migration to the **local** D1 emulation
(separate from the remote one you already ran):

```bash
npx wrangler d1 execute ustsh-blog-submissions --local --file=migrations/0001_create_submissions.sql
```

Without this, `npm run dev` / `npm run preview` will 500 on any form
submission with `no such table: rate_limits`.

## Deploying

```bash
npm run deploy
```

This runs `npm run build` (which triggers `postbuild` automatically,
writing `dist/server/scheduled-entry.mjs` and pointing `wrangler`'s `main`
at it — see "How the Cron Trigger works" below) then `wrangler deploy`.

First deploy will:
- create the Worker (named `ustsh-blog`, or whatever you set `name` to)
- attach the D1 binding, KV session binding (auto-provisioned), and the
  daily Cron Trigger
- publish static assets and the server bundle

If you haven't run the `wrangler secret put` commands above yet, deploy
will still succeed — the site just won't have working Turnstile
verification or Access enforcement until those secrets exist (both fail
closed, so nothing is insecure in the meantime, it's just non-functional).

## Pushing to GitHub

`.github/workflows/validate.yml` already runs `npm ci`, `npm run check`,
`npm run build`, `npm test` on every push/PR to `main`. That workflow
doesn't need any of the new secrets — it doesn't deploy, just validates —
so it should pass as-is with everything committed here.

One thing worth knowing: `npm ci` on GitHub Actions' `ubuntu-latest`
runner will install the correct Linux x64 native bindings automatically.
The workerd/rolldown "wrong platform binary" errors you hit twice this
week only happened because `node_modules` was shared between your Mac
(darwin-arm64) and my Linux-based bridge session — that's specific to how
I reach your files, not something CI will ever hit, since CI always
installs fresh in its own environment.

## How the Cron Trigger works (a design note, in case you touch it later)

Cloudflare Cron Triggers need a `scheduled` export on the deployed Worker.
Astro's Cloudflare adapter (`@astrojs/cloudflare` 14.3.2) only exports
`fetch` from its generated `dist/server/entry.mjs`, and that file is fully
regenerated on every build — hand-editing it doesn't stick.

The fix: `scripts/write-scheduled-entry.mjs` runs automatically after every
build (wired as the `postbuild` npm script) and:

1. writes `dist/server/scheduled-entry.mjs`, a small wrapper that imports
   the generated `entry.mjs` for `fetch` and adds a `scheduled` handler;
2. patches `dist/server/wrangler.json`'s `main` field to point at that
   wrapper instead of `entry.mjs` directly.

The retention delete logic is duplicated inline in that wrapper (plain JS,
no imports) rather than imported from `src/lib/submissions/retention.ts`,
because `dist/server` is uploaded to Cloudflare as pre-bundled ES modules
and a wrapper written outside Astro's own Vite/rolldown build can't
reliably resolve project TypeScript imports at runtime. If you ever change
the retention window or delete logic, update **both**
`src/lib/submissions/retention.ts` (tested, used by nothing else directly)
and the inline copy in `scripts/write-scheduled-entry.mjs` — a test
(`tests/submission-repository.test.mjs`) exercises the real
`retention.ts`, but nothing currently asserts the two stay in lockstep, so
that's a manual discipline for now.

You can trigger the cron manually against a running `wrangler dev`
instance with:
```
curl "http://localhost:8787/cdn-cgi/local/scheduled"
```

## Things I deliberately did not do

- **No real Turnstile keys, Access app, or AUD tag** — I don't have
  Cloudflare dashboard access. Everything fails closed without them; see
  above for exact setup steps.
- **No fabricated article content.** All three sample articles are still
  `fixture: true` and excluded from production output — there is currently
  no real published article on the site. That's a content/editorial
  decision, not something I should make unattended at 2am. The production
  build and every feed correctly emit zero articles until you publish one.
- **Didn't touch the Worker's custom domain routing** in the Cloudflare
  dashboard — `wrangler.jsonc` still declares the same
  `usefulstash.com` custom domain route, but if you end up with two
  Workers (`useful-stash` and `ustsh-blog`) because of the naming change
  above, only one can own that route at a time — you'll want to check that
  in the dashboard after your first deploy.

## Full list of new/changed files

New:
- `src/pages/contact/index.astro`, `media/index.astro`,
  `be-a-guest/index.astro`, `share/index.astro`
- `src/components/forms/` (ContactForm, FormField, RadioGroup,
  CheckboxField, TurnstileWidget)
- `src/config/turnstile.ts`
- `src/pages/api/submissions/{media,guest,story}.ts`
- `src/lib/submissions/handle-submission.ts`
- `src/lib/access/verify.ts`
- `src/lib/admin/same-origin.ts`
- `src/middleware.ts`
- `src/layouts/AdminLayout.astro`
- `src/pages/admin/submissions/index.astro`,
  `[reference]/index.astro`, `[reference]/status/index.ts`,
  `[reference]/delete/index.ts`
- `src/env.d.ts`
- `scripts/write-scheduled-entry.mjs`
- `.dev.vars.example`
- `tests/access-verify.test.mjs`, `tests/handle-submission.test.mjs`,
  `tests/same-origin.test.mjs`, `tests/production-output-guard.test.mjs`
- this file

Changed:
- `astro.config.mjs` — server output + Cloudflare adapter, removed
  `@astrojs/sitemap`
- `wrangler.jsonc` — Worker renamed to `ustsh-blog`, added cron trigger
- every static `.astro` page — added `export const prerender = true`
- `public/robots.txt` — disallow `/admin/`, `/api/`
- `tests/site-output.test.mjs` — fixed to test against the documented
  fixture-exclusion contract and the new `dist/client/` output path
  (server output moved static files from `dist/` to `dist/client/`)
- `.gitignore` — allow `.dev.vars.example` through the `.dev.vars.*` rule
- `package.json` — added `postbuild` script, removed `@astrojs/sitemap`
