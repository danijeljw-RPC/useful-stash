# Useful Stash Blog Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete content, media, feed, sitemap, contact-submission, retention, and Access-protected administration upgrade in `docs/useful-stash-blog-upgrade.md`.

**Architecture:** Astro remains the content and rendering layer, with public editorial routes prerendered and contact/admin routes handled dynamically by the Cloudflare adapter. Pure TypeScript modules own validation, filtering, serialization, security, and D1 operations so Node tests can exercise the contracts independently of page templates.

**Tech Stack:** Astro 7, TypeScript 6, Zod, Cloudflare Workers/D1/Turnstile/Access, jose, Node test runner, Wrangler 4.

**Spec:** `docs/useful-stash-blog-upgrade.md`

## Global Constraints

- Production Worker name is `ustsh-blog`; production D1 database name is `ustsh-blog-submissions`.
- There is no deployed development environment; local work uses emulation and Cloudflare test credentials.
- Fixtures and draft projects are development-only and must not reach production routes or output.
- Media root paths resolve only against `https://media.usefulstash.com` and only for media fields.
- Unknown authors, duplicate slugs, duplicate episode identities, and incomplete media blocks fail validation.
- No biography, avatar, social URL, artwork, episode GUID, platform URL, credential, or generated resource ID is invented.
- Public forms require server-side Turnstile, rate limiting, D1 persistence, and seven-day retention.
- Access OTP policy emails live only in Cloudflare configuration, not application authorization logic.
- Every behavior change follows a witnessed red/green test cycle; final checks must contain no warnings or Astro hints.

---

### Task 1: Content contracts and selectors

**Files:**
- Modify: `src/content.config.ts`, `src/content/articles/*.md`, `package.json`, `package-lock.json`
- Create: `src/config/site.ts`, `src/config/podcast.ts`, `src/utils/media-url.ts`, `src/utils/content.ts`, `src/content/authors/dj.md`, `src/content/projects/local-draft-project.md`
- Test: `tests/content-contracts.test.ts`, `tests/media-url.test.ts`

**Interfaces:**
- Produces `resolveMediaUrl(value: unknown): string`, publishable article/project selectors, explicit-slug sorting, and validated `articles`, `authors`, and `projects` collections.

- [ ] Write tests that reject unsafe media URLs and malformed cross-field content while accepting nullable editorial fields.
- [ ] Run the focused tests and confirm failures name missing modules/contracts.
- [ ] Implement the schemas, selectors, configs, and migrated fixture frontmatter.
- [ ] Re-run focused and full tests until green without warnings.

### Task 2: Authors, article media, projects, and structured data

**Files:**
- Create: `src/components/authors/*`, `src/components/media/*`, `src/pages/authors/*`, `src/pages/projects/*`, `src/pages/stash/[slug]/watch.astro`, `src/layouts/ProjectLayout.astro`, `src/utils/structured-data.ts`
- Modify: `src/layouts/BaseLayout.astro`, `src/layouts/ArticleLayout.astro`, `src/pages/stash/[slug].astro`, `src/pages/stash/index.astro`, `src/pages/index.astro`, `src/components/ArticleCard.astro`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/styles/global.css`
- Test: `tests/structured-data.test.ts`, `tests/page-output.test.mjs`

**Interfaces:**
- Produces JSON-LD builders and pages using explicit slugs, resolved authors, conditional media controls, and consistent canonical metadata.

- [ ] Add failing pure-builder and built-HTML assertions for bylines, media labels, captions, dates, links, and JSON-LD.
- [ ] Implement the components/routes/layouts while preserving the existing Useful Stash visual system.
- [ ] Build and run the focused tests; refactor only while green.

### Task 3: Website, podcast, and videocast feeds

**Files:**
- Create: `src/utils/feed-xml.ts`, `src/utils/podcast-rss.ts`, `src/utils/videocast-rss.ts`, `src/pages/podcast.xml.ts`, `src/pages/videocast.xml.ts`
- Modify: `src/pages/rss.xml.ts`, `src/layouts/BaseLayout.astro`, `src/components/SiteFooter.astro`
- Test: `tests/feed-contracts.test.ts`, `tests/xml-output.test.mjs`

**Interfaces:**
- Produces deterministic XML serializers with escaped values, specialist eligibility, correct enclosures, stable GUIDs, and shared publishability rules.

- [ ] Add failing serializer tests for ordinary, narrated, audio, video, dual-format, noindex, fixture, and project items.
- [ ] Implement the serializers and routes, then validate parsed generated XML.
- [ ] Confirm narration is never an enclosure and projects appear only in the website feed.

### Task 4: Explicit scalable sitemap family

**Files:**
- Create: `src/utils/sitemap.ts`, `src/pages/sitemap-index.xml.ts`, `src/pages/sitemaps/pages-[page].xml.ts`, `src/pages/sitemaps/projects-[page].xml.ts`, `src/pages/sitemaps/video-[page].xml.ts`
- Modify: `astro.config.mjs`, `public/robots.txt`
- Test: `tests/sitemap-contracts.test.ts`, `tests/production-output.test.mjs`

**Interfaces:**
- Produces deterministic 10,000-entry pagination, absolute canonical URLs, truthful last-modified values, and Google video extensions.

- [ ] Add failing pagination/escaping/video tests and leakage scans.
- [ ] Implement index/child serializers and prerendered route families.
- [ ] Build and prove fixtures, drafts, noindex pages, admin routes, and APIs are absent from public HTML/XML.

### Task 5: Submission validation, Turnstile, rate limits, D1, and retention

**Files:**
- Create: `src/lib/submissions/*`, `src/pages/api/submissions/*.ts`, `migrations/0001_create_submissions.sql`, `src/worker.ts`, `.dev.vars.example`
- Modify: `astro.config.mjs`, `wrangler.jsonc`, `src/env.d.ts`, `package.json`, `package-lock.json`
- Test: `tests/submission-validation.test.ts`, `tests/turnstile.test.ts`, `tests/submission-repository.test.ts`, `tests/retention.test.ts`

**Interfaces:**
- Produces closed form validators, fail-closed Siteverify, hashed-address rate limits, bounded reference collision retries, parameterized D1 operations, and a scheduled seven-day cleanup handler.

- [ ] Add failing tests for all field/permission dependencies, hostile bodies, Turnstile responses, rate limits, persistence, collision retry, and UTC cutoff boundaries.
- [ ] Implement pure validation/security modules, then repository/service/endpoints and the canonical migration.
- [ ] Configure the Cloudflare adapter, D1 binding, daily cron, public variables, observability, and generated runtime types.

### Task 6: Public forms and Access-protected administration

**Files:**
- Create: `src/components/forms/*`, `src/pages/contact/*`, `src/lib/admin/*`, `src/components/admin/*`, `src/pages/admin/submissions/**/*`, `src/middleware.ts`
- Test: `tests/admin-access.test.ts`, `tests/admin-repository.test.ts`, `tests/admin-mutation.test.ts`, `tests/admin-output.test.mjs`

**Interfaces:**
- Produces native Turnstile forms, generic success references, verified Access identity in `locals`, paginated/filterable admin views, protected status updates, and confirmed permanent deletion.

- [ ] Add failing tests for valid/invalid JWTs, fail-closed configuration, cache/robots headers, filters, pagination, same-origin checks, transitions, and deletion.
- [ ] Implement form pages/components and dynamic handlers.
- [ ] Implement Access middleware using remote JWKS plus admin pages and POST/redirect/GET mutations.

### Task 7: Documentation and complete verification

**Files:**
- Modify: `README.md`
- Create: `docs/authoring-and-media.md`, `docs/cloudflare-deployment.md`, `public/images/podcast/useful-stash-podcast-placeholder.png`
- Test: all test suites and generated-output validators

**Interfaces:**
- Documents article/project/episode/media/feed/form/retention/admin workflows and explicitly marks all live-only validation gaps.

- [ ] Document complete frontmatter examples, resource creation/migration commands, local emulation, secrets, Access OTP policy, retention, and replacement artwork workflow.
- [ ] Run `npm test`, `npm run check`, `npm run build`, `git diff --check`, XML parsing, leakage scans, D1 migration checks, generated types, and Wrangler dry-run.
- [ ] Inspect representative rendered pages and report exact results plus any live Cloudflare/browser/media validation still required.
