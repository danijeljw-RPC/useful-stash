# Useful Stash Blog, Podcast, Videocast, Media, and SEO Upgrade

Status: implementation specification only. This document records the required upgrade; it does not change the site yet.

## Goal

Upgrade `[+] USEFUL/STASH` from a written-article site into one content system that can publish:

- written articles;
- written articles with an optional narrated MP3;
- podcast episodes with an MP3 enclosure;
- video episodes with a self-hosted MP4 enclosure;
- posts that have both podcast audio and video;
- links to matching YouTube, Spotify, and Apple Podcasts pages; and
- three distinct feeds: the whole website, the audio podcast, and the videocast.

The site must continue to use tags only. Do not introduce categories.

## What the Sisters with Mirrors audit found

The useful parts of `/Users/danijeljw/Developer/swm-blog` are:

- `src/content.config.ts` validates explicit slugs, updated dates, hero images, media, podcast metadata, transcripts, and per-page SEO controls.
- `src/utils/media-url.ts` accepts either an absolute HTTPS URL or a root-relative media path, then resolves root-relative media against a configured media origin.
- `src/components/episodes/EpisodeAudioPlayer.astro` uses a native, accessible `<audio controls>` player.
- `src/pages/episodes/[slug]/watch.astro` creates a first-party watch page for hosted video.
- `src/utils/rss.ts` writes podcast RSS explicitly so enclosure and Apple Podcasts fields are controlled and testable.
- `src/utils/blog-rss.ts` keeps the ordinary website feed separate from the podcast feed.
- `src/layouts/BaseLayout.astro` applies canonical and `noindex` metadata consistently.

Useful Stash already has a good starting point: Astro 7 content collections, static output, an XML sitemap, canonical links, Open Graph/Twitter metadata, a site RSS feed, and `BlogPosting` JSON-LD. The upgrade should extend these rather than replace the current design.

Do not copy these SWM details:

- controlled categories, because Useful Stash uses tags only;
- SWM host IDs or branding;
- its current watch player omission: it has a transcript URL but does not attach it to the video as a `<track>`;
- its fallback GUID behavior as the final production policy. A permanent explicit GUID is safer for podcast distribution.

## What `fixture` means

A fixture is sample data used to exercise layouts, validation, tests, or development builds. It is not intended to be treated as real published editorial content.

It is useful, but the current Useful Stash behavior is unsafe for production: `fixture: true` only displays “Sample article”; it does not exclude the article from the RSS feed or sitemap.

Retain `fixture` with this contract:

- `fixture: false` or omitted: normal content;
- `fixture: true`: visible only during local development through `npm run dev`;
- development fixture pages are visibly labelled and always `noindex`;
- fixture content is excluded from production static paths, every RSS feed, every sitemap child, homepage/listing queries, related-content links, search indexes, and navigation;
- production builds must fail if a fixture URL or known fixture marker is emitted into `dist`.

The three current sample articles remain local-development fixtures. Their source Markdown can remain committed to GitHub, but no fixture route or content may be present in the deployed public site. If “never pushed to GitHub” is intended literally for future private fixture source files, keep those files in an ignored local-only fixture directory; otherwise `fixture: true` means source-controlled test content that is never built publicly.

## Recommended frontmatter contract

Use one `articles` collection and one public post route. A post becomes an episode when it has a positive `episode` number and a `podcast` block. This avoids duplicating the same article into separate article and episode collections while still providing strict feed eligibility rules.

Use camelCase consistently: `updatedAt`, not `updatedat`.

```yaml
---
title: "Example title"
slug: "example-title"
description: "A concise, unique summary for search, sharing, and feeds."
publishedAt: 2026-09-18
updatedAt: 2026-09-18
draft: false
fixture: false
tags:
  - astro
  - cloudflare
authors:
  - dj
takeaway: "Optional current Useful Stash takeaway."

heroImage: "/images/articles/example-title.png"
heroImageAlt: "A concise description of the meaningful image content"

seo:
  canonical: null
  noindex: false

# Optional. The narrated version of the written article.
# This is displayed in the page player but is NEVER a podcast enclosure.
articleAudio:
  url: "/articles/example-title/example-title.mp3"
  mimeType: "audio/mpeg"
  bytes: 9292929

# Optional. The podcast programme audio.
# A complete block makes an episode eligible for the podcast RSS feed.
audio:
  url: "/podcasts/season-01/episode-001/example-title.mp3"
  mimeType: "audio/mpeg"
  bytes: 929292929

# Optional. External video links and/or a self-hosted video.
# mimeType and bytes are required whenever hosted is present so the video
# can be emitted as a standards-compliant RSS enclosure.
video:
  youtube: "https://youtu.be/abcd123"
  hosted: "/podcasts/season-01/episode-001/example-title.mp4"
  mimeType: "video/mp4"
  bytes: 1929292929
  spotify: null

# Optional WebVTT used for video captions and podcast transcript metadata.
transcript: "/podcasts/season-01/episode-001/example-title.vtt"

# Required for an episode post; omit both fields on an ordinary article.
episode: 1
podcast:
  guid: "usefulstash-s01e001"
  season: 1
  episodeType: "full"
  explicit: false
  spotify: null
  applePodcasts: null
---
```

### Field behavior

| Field | Required | Meaning |
| --- | --- | --- |
| `slug` | Yes | Stable URL segment. Validate as lowercase kebab-case and use it instead of the filename-derived `article.id`. |
| `publishedAt` | Yes | Original publication date. |
| `updatedAt` | No | Date of a substantial editorial update; show it visibly and emit it as `dateModified`. Do not change it for trivial formatting. |
| `heroImage` | No | Page/social/structured-data image. A root-relative hero image remains on `https://usefulstash.com`; it is not automatically treated as podcast media. |
| `heroImageAlt` | Required with image | Alternative text. Permit `""` only when an image is deliberately decorative. For post hero images, meaningful text should normally be required. |
| `authors` | Yes | One or more stable author IDs, such as `dj`. Each ID resolves to a matching author collection entry and links to that author’s page. |
| `seo.canonical` | No | An explicit absolute HTTPS canonical override. `null` means self-canonicalise to the post URL. |
| `seo.noindex` | No | Defaults to `false`. When true, emit `noindex` and omit the URL from feeds and sitemaps. Do not add `nofollow`; links on a noindexed post can still be useful for discovery. |
| `articleAudio` | No | Narration of the page text. Render in the page but never place it in podcast/videocast feeds. This is the descriptive replacement for the proposed `x` key. |
| `audio` | No | Podcast programme MP3 enclosure. URL, MIME type, and positive byte count are all-or-none. |
| `video.youtube` | No | External “Watch on YouTube” link. |
| `video.hosted` | No | MP4 used by the first-party player and videocast feed. Root-relative values resolve against the media origin. |
| `video.mimeType` / `video.bytes` | Required with hosted video | RSS enclosure metadata. The desired short `video.hosted` URL stays intact while the feed receives the required type and length. |
| `video.spotify` | No | Episode-specific Spotify video URL, shown as an external link. |
| `transcript` | No | WebVTT caption/transcript file. Root-relative values resolve against the media origin. |
| `episode` | Required for episode posts | Positive integer episode number. |
| `podcast.guid` | Required for episode posts | Permanent globally unique ID. Never change it after publication, even if the title, slug, URL, or media URL changes. |
| `podcast.season` | Required for episode posts | Positive integer emitted as `<itunes:season>`. |
| `podcast.episodeType` | Required for episode posts | `full`, `trailer`, or `bonus`. |
| `podcast.explicit` | No | Boolean defaulting to `false`. Set it to `true` only when the individual episode contains explicit material. |
| `podcast.spotify` / `podcast.applePodcasts` | No | Episode-specific destination links. These are presentation links, not RSS enclosure inputs. |

The accessibility distinction matters: narrated article audio helps blind and low-vision users, people with dyslexia or cognitive access needs, and people who prefer listening. Deaf and hard-of-hearing users primarily benefit from transcripts and properly synchronized captions. The upgrade should provide both where media exists.

## Author profiles and bylines

Create a dedicated `authors` content collection. Use a predictable file convention:

```text
src/content/authors/dj.md
```

The filename stem is the stable author ID. An article uses that ID rather than copying a display name:

```yaml
authors:
  - dj
```

Astro resolves `dj` to `src/content/authors/dj.md`. The profile’s `name` is the public display name, so changing it from `DJ` to `Danijel JW` changes the byline without modifying every article. Do not encode the display name into the post or author filename.

Recommended author frontmatter:

```yaml
---
name: "DJ Wynyard"
slug: "dj"
role: "Author and creator"
bio: null
avatar: null
avatarAlt: "DJ Wynyard"
website: "https://usefulstash.com"
socials:
  github: null
  x: null
  bluesky: null
  mastodon: null
  twitch: null
  youtube: null
  linkedin: null
seo:
  canonical: null
  noindex: false
---

Longer author biography and background go here.
```

Author requirements:

- Create `/authors/` and `/authors/[slug]/` routes.
- Every post byline links each author name to `/authors/<slug>/`.
- An author page includes the author’s display name, role, avatar, short and long biography, published posts, and only the supplied social/profile links.
- Render recognizable, accessible icons for GitHub, X/Twitter, Bluesky, Mastodon, Twitch, YouTube, LinkedIn, and the author’s website. Every icon link needs a visible or accessible platform label; do not rely on the icon alone.
- Validate social URLs as HTTPS. Omit empty platforms instead of showing dead icons.
- Emit `Person` JSON-LD on the author page with `name`, canonical `url`, `image`, and supplied profiles as `sameAs`.
- `BlogPosting.author` must reference the author page’s stable URL and use the current display name from the author entry.
- Support multiple author IDs per article and guest authors without schema changes.
- Reject unknown author IDs at build time.

The first author entry is `dj`, with the display name `DJ Wynyard`. Its biography remains `null` until supplied, and its avatar accepts an absolute HTTPS URL to the supplied JPG. Keep every supported social key in the author file with `null` defaults; the author page renders only non-empty valid URLs. The post contract stays stable when profile details are filled in later.

## Projects

Add a dedicated `/projects/` section for long-running work published by Useful Stash. Projects are detailed, mostly static pages that can be updated over time. They are not podcast episodes, videocasts, or ordinary tagged Stash articles.

Each project lives in its own Markdown file:

```text
src/content/projects/<project-slug>.md
```

Use a separate `projects` content collection and this deliberately small frontmatter contract:

```yaml
---
title: "Project name"
slug: "project-name"
description: "A concise summary of the project and why it matters."
publishedAt: 2026-09-18
lastUpdated: 2026-09-18
draft: false
---
```

`title`, `slug`, and `description` are the core page and SEO identity. The only project-specific chronology fields are `publishedAt` and `lastUpdated`; do not add podcast, videocast, enclosure, transcript, episode, season, media-platform, tag, or category metadata to projects.

Project behavior:

- `draft: true` projects are available during `npm run dev` with a clear draft label, but are excluded from production routes, listings, RSS, and sitemaps.
- `draft: false` projects are indexable, self-canonicalized pages at `/projects/<slug>/`.
- `/projects/` presents all published projects as a dedicated showcase rather than mixing them into the `/stash/` article listing.
- Each project page visibly shows “Published” and “Last updated” dates. Emit them as `datePublished` and `dateModified` in `CreativeWork` or `Article` JSON-LD.
- A project can contain headings, images, diagrams, links, code, milestones, changelog sections, and detailed narrative in its Markdown body.
- Project pages use the normal site header/footer, high-quality title/description/Open Graph metadata, breadcrumbs, and internal links.
- Published projects appear in the general website RSS feed, but never in podcast or videocast RSS. Keep the project GUID/permalink stable. Use `publishedAt` as the initial feed date; changing `lastUpdated` updates page and sitemap metadata without inventing a new project item.
- Project URLs appear in the projects sitemap child with `<lastmod>` sourced from `lastUpdated`.
- A project does not use the article `fixture` flag. Local-only project experiments use `draft: true`.

## Media URL resolution

Add one site configuration value:

```ts
export const site = {
  url: "https://usefulstash.com",
  mediaUrl: "https://media.usefulstash.com",
} as const;
```

Create a single `resolveMediaUrl()` utility with these rules:

1. A value beginning with exactly one `/` is a media-origin path.
2. `/podcasts/season-01/episode-001/file.mp3` becomes `https://media.usefulstash.com/podcasts/season-01/episode-001/file.mp3`.
3. A complete `https://...` URL remains unchanged.
4. Reject protocol-relative URLs (`//example.com/file`), HTTP URLs, relative paths without a leading slash, invalid URLs, whitespace-only values, and non-string values.
5. Remove trailing slashes from the configured origin before concatenating.
6. Apply this resolver only to `audio.url`, `articleAudio.url`, `video.hosted`, and `transcript`. Do not globally rewrite ordinary internal links or `/images/...` hero images.

Astro can transform these values in the Zod schema, as SWM does, so every component and feed sees the final absolute media URL.

The media host must support public HTTPS `GET` and `HEAD`, byte-range requests, correct `Content-Type` and `Content-Length`, stable URLs, and suitable CORS headers. WebVTT needs a valid `text/vtt` response. Cross-origin players and external podcast crawlers must be able to fetch the files without cookies or authentication.

## Page experience

### Media panel on every post

Add a reusable post media panel between the article header and body, or immediately after the introductory summary. It should render only controls that have matching data:

- `Listen to this article` for `articleAudio`;
- `Listen to the podcast` for `audio`;
- `Watch video` for `video.hosted`;
- `Watch on YouTube` for `video.youtube`;
- `Watch on Spotify` for `video.spotify`;
- `Listen on Spotify` for `podcast.spotify`;
- `Listen on Apple Podcasts` for `podcast.applePodcasts`.

External links open in a new tab with `rel="noopener noreferrer"`. Native media controls must be keyboard accessible and must not autoplay.

If both audio blocks exist, show two clearly labelled players. Never label article narration as a podcast.

### Hosted video player

Create `/stash/[slug]/watch/` only for posts that have `video.hosted`.

```astro
<video controls preload="metadata" playsinline poster={heroImageUrl}>
  <source src={video.hosted} type={video.mimeType} />
  {transcript && (
    <track
      kind="captions"
      src={transcript}
      srclang="en-AU"
      label="English"
      default
    />
  )}
  <a href={video.hosted}>Open the video file</a>
</video>
```

Also provide a visible “Read transcript” link. A VTT file used as a caption track is not a friendly long-form transcript page, so a later enhancement may render a cleaned HTML transcript on the post. The player must not claim captions exist when `transcript` is absent.

The watch page should self-canonicalise, be indexable when the parent post is indexable, and contain unique explanatory text rather than being only a bare player.

## Podcast and videocast channel configuration

Create `src/config/podcast.ts` as the single editable location for show-level podcast and videocast metadata:

```ts
export const podcast = {
  title: "Useful Stash",
  description:
    "Practical guides, technical experiments, tools, and conversations about building, fixing, and understanding useful things.",
  author: "DJ Wynyard",
  ownerName: "RePass Cloud",
  ownerEmail: "hello@repasscloud.com",
  language: "en-AU",
  explicit: false,
  category: "Technology",
  artwork: "/images/podcast/useful-stash-podcast-placeholder.png",
} as const;

export const videocast = {
  ...podcast,
  title: "Useful Stash",
} as const;
```

The editable description lives in `src/config/podcast.ts`. The proposed text is derived from the current Useful Stash focus on practical technical guidance, tools, experiments, and decision-making; it can be edited there without changing feed code.

`author` and `ownerName` are different RSS concepts. `author` is the public creator/show author displayed by podcast clients. `ownerName` is the administrative owner used with the verification/contact email and does not need to be the same person. Use `DJ Wynyard` as the public podcast author and `RePass Cloud` as the owner.

The channel default is `explicit: false`. Episode frontmatter also defaults `podcast.explicit` to `false`, while retaining the boolean field so an exceptional explicit episode can be labelled accurately. Current Useful Stash audio and video programmes are expected to remain non-explicit.

Use the same title, description, author, owner, category, and square artwork for the podcast and videocast feeds.

The implementation must create the temporary square artwork at:

```text
public/images/podcast/useful-stash-podcast-placeholder.png
```

Replace that file with the final square artwork before pushing the implementation to GitHub, keeping the same path unless the configuration is intentionally updated. The feed image and MP3 ID3 embedded artwork are separate copies of the same creative asset: the RSS feed needs a publicly fetchable URL, while each MP3 can also embed the artwork in its ID3 tag.

## Feed architecture

### 1. Website RSS: `/rss.xml`

Purpose: every published, indexable, non-fixture post, regardless of media.

- Keep the existing public URL for compatibility.
- Sort by `publishedAt` descending with a stable slug tie-breaker.
- Link to `/stash/<slug>/`.
- Include title, description, publication date, tags, GUID/permalink, and preferably the rendered post body in `content:encoded`.
- Do not include a media `<enclosure>` in this general feed; subscribers should not unexpectedly download large MP3/MP4 files.

### 2. Podcast RSS: `/podcast.xml`

Purpose: episode posts with a complete `audio` block.

- One MP3 `<enclosure>` per item using `audio.url`, `audio.bytes`, and `audio.mimeType`.
- Include permanent GUID, link, description/show notes, publication date, `<itunes:episode>`, `<itunes:season>`, `<itunes:episodeType>`, `<itunes:explicit>`, `<itunes:duration>` when an audio duration field is added, and artwork.
- Include `<podcast:transcript url="..." type="text/vtt" />` when a VTT exists.
- Add the required channel metadata in a dedicated `src/config/podcast.ts`: title, description, language, author, owner name/email, explicit value, show artwork, and Apple category.
- Do not include `articleAudio` or video-only posts.

### 3. Videocast RSS: `/videocast.xml`

Purpose: episode posts with a complete hosted-video enclosure.

A videocast RSS feed is real. It is RSS 2.0 with a video file in the item `<enclosure>`. Apple states that an RSS episode may be a video recording in MOV, MP4, or M4V format. A separate feed is the most interoperable choice because classic RSS permits one primary enclosure per item and many podcast clients remain audio-centric.

- One MP4 `<enclosure>` using `video.hosted`, `video.bytes`, and `video.mimeType`.
- Use a distinct channel title and a distinct feed self URL.
- Use the same episode GUID namespace carefully. Prefer a video-specific stable GUID such as `<podcast-guid>-video` so a directory cannot confuse the video item with the audio item from another feed.
- Include the same season, episode, type, explicit, artwork, and transcript metadata where supported.
- Do not assume every directory will accept or display a video feed. Validate target directories before submission.
- Spotify’s `video.spotify` URL remains an outbound link. Do not assume that supplying an MP4 enclosure causes Spotify to import it as a Spotify video episode; that platform behavior must be verified during distribution setup.

### GUID policy

The publisher manually generates one UUIDv7 whenever a new episode is released and stores it permanently as a UUID URN in that episode’s Markdown file:

```yaml
podcast:
  guid: "urn:uuid:019d0000-0000-7000-8000-000000000000"
```

The example above demonstrates the format only and must never be copied into a real episode. A UUIDv7 is preferred over `usefulstash-s01e001` because it is globally unique without relying on a naming convention. The GUID must never change after publication, even when the title, slug, media file, platform links, or `updatedAt` change. The videocast item derives its own stable identity from the stored GUID, such as `<uuid>-video`, according to the serializer contract.

After Spotify or Apple Podcasts publishes an episode, add the supplied episode-specific URL to the existing Markdown fields and republish it. The schema, media panel, and external-link validation must continue to work when those initially null values are populated later. Under the chosen editorial policy, set `updatedAt` to the date of that republish so the visible page and `dateModified` record the change.

An optional future Podcasting 2.0 enhancement could publish a primary enclosure plus `<podcast:alternateEnclosure>` for the companion audio/video format. Do not use that as the initial compatibility strategy; retain the two explicit feeds.

### Feed discovery

Expose all three feeds in the document `<head>`:

```html
<link rel="alternate" type="application/rss+xml" title="Useful Stash" href="/rss.xml">
<link rel="alternate" type="application/rss+xml" title="Useful Stash Podcast" href="/podcast.xml">
<link rel="alternate" type="application/rss+xml" title="Useful Stash Videocast" href="/videocast.xml">
```

Add visible feed links to the footer or a `/feeds/` page explaining what each feed contains.

## Scalable sitemap index

Use an explicit sitemap index at `/sitemap-index.xml`. `robots.txt` references only this index, and the index references independently generated child sitemaps:

- `/sitemaps/pages-1.xml`: homepage, Stash indexes/articles, author pages, contact pages, and other indexable site pages;
- `/sitemaps/projects-1.xml`: published project index and project detail pages;
- `/sitemaps/video-1.xml`: indexable first-party hosted-video watch pages with Google video extensions.

The serializer must split a family into `-2.xml`, `-3.xml`, and later files before it reaches the sitemap protocol limit of 50,000 URLs or 50 MB uncompressed. Use a lower internal page size, such as 10,000 URLs, so growth never approaches the hard limit unexpectedly.

Every child sitemap must:

- contain absolute HTTPS canonical URLs only;
- exclude drafts, fixtures, `noindex` pages, admin routes, submission APIs, and success/reference pages;
- use a truthful `<lastmod>` from `updatedAt`, project `lastUpdated`, or `publishedAt` rather than build time;
- be deterministic so unchanged content does not reorder between builds; and
- be listed exactly once in the sitemap index.

The sitemap index itself must be valid XML, use absolute child sitemap URLs, and be tested with more than one generated child page so pagination behavior is covered before the site becomes large.

## Contact and participation submissions

Add a public `/contact/` hub with three distinct submission paths:

1. `/contact/media/` — media enquiries;
2. `/contact/be-a-guest/` — requests to appear as a guest; and
3. `/contact/share/` — share a story or ask a question.

These forms follow the proven SWM pattern while using Useful Stash language and fields. They are not mailto links and must not expose submissions publicly.

### Form contracts

All forms collect a hidden honeypot field and a Turnstile token. All inputs are trimmed, length-bounded, validated server-side, stored as plain data, and escaped when rendered in admin pages.

Media enquiry:

- required: name, email, organisation/outlet, enquiry details;
- optional: role, phone, deadline, website, supporting links;
- explicit permission to contact the sender about the enquiry.

Guest request:

- required: name, email, short biography, proposed subject, why it suits Useful Stash, and acknowledgement that an accepted conversation may be recorded and published;
- optional: preferred name, location/timezone, website, social links, previous appearances, supporting notes.

Story/question submission:

- required type: `story` or `question`;
- required content;
- identity choice: real name, pseudonym, or anonymous;
- optional email, unless contact permission is granted;
- publication permission: may quote/read, may paraphrase, or private only;
- separate permission to contact the sender.

After a successful submission, return a non-sensitive public reference. Never expose the D1 primary key. Success pages and reference lookup surfaces, if any, are `noindex` and excluded from sitemaps.

### Runtime architecture

Useful Stash currently uses Astro static output. Contact persistence and private admin routes require these changes:

- install and configure `@astrojs/cloudflare`;
- switch Astro to `output: "server"` with the Cloudflare adapter;
- keep articles, projects, author pages, feeds, and sitemaps prerendered;
- keep `/api/submissions/*` and `/admin/*` dynamic with `prerender = false`;
- deploy one production Worker named `ustsh-blog` with one production D1 database named `ustsh-blog-submissions` using the canonical migration tree;
- use local D1 emulation and Cloudflare test Turnstile keys for `npm run dev`; do not create or deploy a separate development environment;
- bind D1 as `SUBMISSIONS_DB` and declare bindings in `src/env.d.ts`;
- keep Turnstile and rate-limit secrets in Worker secrets, never source control.

Store normalized submissions in D1 with kinds `media`, `guest`, and `story`; story records have subtype `story` or `question`. Each record has an immutable UUID, public reference, received timestamp, lifecycle status, content fields, consent fields, and minimal request metadata. Store only the information required to review and respond.

Use a lifecycle such as `new`, `reviewing`, `contacted`, `shortlisted`, `scheduled`, `declined`, `used`, and `archived`. Admin status changes record `updated_at` and the verified administrator email in `status_updated_by`.

### Turnstile and abuse controls

Create one production Turnstile widget named `ustsh-blog-contact`. Local development uses Cloudflare’s documented test sitekey and secret rather than a deployed development widget. The browser widget alone is not security; each API endpoint must call Cloudflare Siteverify server-side and fail closed.

Validation requires:

- `success === true`;
- the expected action (`contact-media`, `be-a-guest`, or `share-story-question`);
- the exact allowed deployment hostname;
- a token no longer than 2,048 characters;
- rate limiting based on a keyed hash of the client address rather than storing raw IP addresses; and
- rejection of reused, expired, missing, malformed, or unverifiable tokens.

Add request-body size limits, content-type checks, honeypot rejection, bounded retry behavior for public-reference collisions, generic client errors, and structured logs that never include message bodies, email addresses, tokens, secrets, or raw IP addresses.

### Private submissions administration

Create these server-rendered routes:

- `GET /admin/submissions/`: newest-first, paginated submission list with kind/status filters;
- `GET /admin/submissions/[reference]/`: complete escaped submission detail;
- `POST /admin/submissions/[reference]/status/`: validated status update using POST/redirect/GET.
- `POST /admin/submissions/[reference]/delete/`: permanent manual deletion after an explicit confirmation step.

The index supports All, New, Media, Guest Requests, Stories, Questions, Contacted, Scheduled, Used, and Archived filters. The detail page clearly displays contact and publication permissions before the message body. User-supplied URLs use safe external-link attributes and are never fetched server-side. A clearly labelled delete button is available on the detail page; it requires an explicit confirmation and performs a protected POST, never deletion through a GET request.

### Retention and deletion

All contact submissions containing personal information have a maximum retention period of seven days from `created_at`. A daily production Cron Trigger permanently deletes expired submission records from D1. The cleanup query uses a server-calculated UTC cutoff, runs in a transaction where supported, reports only aggregate deletion counts, and never logs submission content or identity data.

Administrators may permanently delete any submission before the seven-day deadline through the detail-page delete action. Manual deletion requires the same verified Access identity and same-origin protections as status mutations. The UI must state that deletion is permanent. Tests use an injected clock to prove that records younger than seven days remain and records at or beyond the cutoff are deleted.

### Cloudflare Access OTP boundary

Protect the deployed `/admin/*` area with a Cloudflare Access self-hosted application. Cloudflare Access is the only identity and authorization system: do not add application accounts, passwords, password resets, sessions, or an authentication database.

- Enable One-Time PIN as an Access identity provider. New Cloudflare Zero Trust organizations no longer enable OTP automatically.
- Use an Allow policy with an `Include` rule containing exact approved administrator email addresses.
- Require the One-Time PIN login method, or restrict the application to OTP in the current dashboard’s allowed identity-provider selection when that is how the UI exposes the setting.
- Never use `Include Everyone` or `Include Login Methods: One-time PIN`; those patterns can allow any valid email user.
- Keep the approved-email list in Cloudflare Access, not in the repository or D1.
- The production Allow policy contains exactly `danijel@repasscloud.com` and `dj.wynyard@icloud.com` unless the owner deliberately updates the policy later.
- Configure the Access application to cover the admin root and every descendant; verify both the index and a nested detail URL.

Add Astro middleware as defense in depth. It verifies `Cf-Access-Jwt-Assertion` using Cloudflare’s remote JWKS, exact team-domain issuer, Access audience, expiry/not-before claims, and a non-empty email. Missing or invalid configuration and assertions fail closed with a generic 403. The verified email is available only to server-side admin handlers.

Every admin response sets `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, nofollow`. Admin routes never appear in public navigation, RSS, or any sitemap. Status mutations validate same-origin requests, content type, body size, closed status values, and use parameterized SQL.

Current primary Cloudflare references for implementation:

- [Cloudflare Access One-Time PIN](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)
- [Cloudflare Access policies and unsafe broad selectors](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/)
- [Cloudflare Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Cloudflare D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)

## Google Search and modern SEO requirements

There is no switch that guarantees “next-level” rankings. Google’s current guidance emphasizes helpful, original, people-first content, crawlable links, technically accessible pages, and structured data that truthfully matches visible content. The implementation should improve eligibility and clarity without promising ranking outcomes.

### Required metadata and structured data

- Preserve unique page titles and descriptions.
- Pass `seo.canonical` into `BaseLayout`; otherwise emit an absolute self-referential canonical URL.
- Emit `noindex` only when requested. Exclude `noindex`, draft, and fixture pages from feeds and sitemaps.
- Use `BlogPosting` JSON-LD on every post with `headline`, `description`, absolute canonical `mainEntityOfPage`, `datePublished`, `dateModified`, `image`, author, and publisher.
- Add a real author identity and author URL. Do not fabricate an author. If the whole site has one author, keep it in site configuration; otherwise add per-post author metadata.
- Resolve every post author from the author collection, link the visible byline to the author page, and use that same author identity in `BlogPosting.author`.
- Use the hero image as an absolute, crawlable structured-data image. Prefer a high-resolution representative image; where practical provide 1:1, 4:3, and 16:9 variants.
- Add `VideoObject` JSON-LD on the first-party watch page with `name`, unique `description`, `thumbnailUrl`, `uploadDate`, `contentUrl`, and ISO 8601 `duration` once a video duration field exists.
- Add `BreadcrumbList` JSON-LD for Home > Stash > Post, and Home > Stash > Post > Watch on watch pages.
- Add site-level `WebSite` and `Organization` JSON-LD on the homepage using factual organization/logo/profile data only.
- Add `og:locale`, article publication/modified times, and appropriate `og:type`. Keep Twitter summary-card metadata aligned with Open Graph.
- Use `max-image-preview:large` for indexable posts if large preview images are desired. This is permission for previews, not a ranking boost.

### Video search

- Enable the video sitemap namespace currently disabled in `astro.config.mjs`, or build a dedicated video sitemap containing only first-party watch pages.
- Use the watch-page URL as the sitemap page URL, the hosted MP4 as `video:content_loc`, and the hero image as `video:thumbnail_loc`.
- Keep the thumbnail, title, description, upload date, and duration consistent across visible HTML, JSON-LD, Open Graph, and the video sitemap.
- Ensure Googlebot can fetch the watch page, thumbnail, caption file, and MP4 without authentication and can make range requests.
- YouTube links are useful to readers but do not replace first-party `VideoObject` and video-sitemap metadata for the hosted file.

### Dates, sitemaps, and indexing

- Display published and updated dates visibly and keep them consistent with JSON-LD.
- Include only canonical, indexable, production URLs in the XML sitemap.
- Supply accurate `<lastmod>` from `updatedAt ?? publishedAt`; do not use build time as a fake modification date.
- Submit the sitemap index in Google Search Console and inspect representative article and watch URLs with URL Inspection.
- Validate structured data with Google’s Rich Results Test after deployment.
- Monitor Search Console indexing, enhancement, Core Web Vitals, and video-indexing reports. Structured data enables eligibility; it does not guarantee a rich result.

### Content quality

- Keep titles and headings descriptive and written for readers.
- Use original examples, first-hand experience, screenshots, measurements, or analysis when relevant.
- Add descriptive internal links between genuinely related posts.
- Use descriptive image filenames and alt text; do not keyword-stuff either.
- Do not add a keywords meta tag; Google does not use it.
- Do not mass-produce thin variants for search or AI-result targeting.

Primary references checked for this specification:

- [Google Search Essentials](https://developers.google.com/search/docs/essentials)
- [Google Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google publication-date guidance](https://developers.google.com/search/docs/appearance/publication-dates)
- [Google VideoObject structured data](https://developers.google.com/search/docs/appearance/structured-data/video)
- [Google video SEO best practices](https://developers.google.com/search/docs/appearance/video)
- [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google generative-AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Apple Podcasts RSS requirements](https://podcasters.apple.com/support/823-podcast-requirements)
- [Apple episode and video format guidance](https://podcasters.apple.com/support/825-how-to-create-an-episode)
- [Podcasting 2.0 transcript guidance](https://podcasting2.org/docs/podcast-namespace/examples/transcripts/transcripts)
- [Podcasting 2.0 alternate enclosure specification](https://podcasting2.org/docs/podcast-namespace/tags/alternate-enclosure)

## File-level implementation plan

### Phase 1: schema and media contracts

Modify:

- `src/content.config.ts`: add the author collection plus article slug, authors, hero image, SEO, article audio, podcast audio, video, transcript, episode, and podcast schemas with cross-field refinements.
- `src/config/site.ts`: create central site and media origins.
- `src/config/podcast.ts`: create factual show-level metadata with no invented values.
- `src/utils/media-url.ts`: add strict root-relative/HTTPS resolution.
- `src/utils/content.ts`: centralize published/indexable/fixture filtering and stable sorting.

Tests:

- root-relative URLs resolve to `https://media.usefulstash.com`;
- HTTPS URLs pass through;
- unsafe or malformed URL forms fail;
- incomplete audio/video enclosure blocks fail validation;
- hero image requires appropriate alt text;
- episode/podcast fields are all-or-none;
- duplicate slugs and duplicate season/episode pairs fail;
- unknown author IDs fail;
- fixture/noindex/draft content is excluded from publishable selectors.

Migrate each existing Markdown post to add explicit `slug`, `heroImage`, `heroImageAlt`, and `seo`. Preserve existing editorial text and tags. Do not silently turn sample fixtures into production articles.

### Phase 2: page media and metadata

Create:

- `src/content/authors/dj.md`: the first editable author profile.
- `src/pages/authors/index.astro`: author directory.
- `src/pages/authors/[slug].astro`: full author profile and authored-post listing.
- `src/components/authors/AuthorByline.astro`: linked one-or-many author byline.
- `src/components/authors/AuthorSocialLinks.astro`: accessible, conditional social/profile icons.
- `src/components/media/AudioPlayer.astro`: labelled reusable native audio player.
- `src/components/media/PostMediaPanel.astro`: conditionally renders players and platform links.
- `src/components/media/HostedVideoPlayer.astro`: video, poster, caption track, and fallbacks.
- `src/pages/stash/[slug]/watch.astro`: first-party hosted-video page.
- `src/utils/structured-data.ts`: pure builders for `BlogPosting`, `VideoObject`, breadcrumbs, website, and organization JSON-LD.

Modify:

- `src/pages/stash/[slug].astro`: route by explicit frontmatter slug.
- `src/layouts/ArticleLayout.astro`: hero image, media panel, episode/season labels, platform links, visible dates, and complete JSON-LD.
- `src/layouts/BaseLayout.astro`: canonical override, robots behavior, three feed-discovery links, richer Open Graph metadata, and site-level JSON-LD slot.
- `src/styles/global.css` or focused component styles: responsive media controls with visible focus states.

Tests should inspect generated HTML for linked author bylines, multi-author and guest-author resolution, conditional social icons, conditional media controls, distinct player labels, safe external links, caption tracks, canonical/noindex behavior, absolute image/media URLs, and JSON-LD values. Verify a post with both `articleAudio` and `audio` renders two unambiguous players.

### Phase 3: three feed serializers

Create:

- `src/utils/feed-xml.ts`: XML escaping and shared channel/item helpers.
- `src/utils/podcast-rss.ts`: MP3 enclosure serializer.
- `src/utils/videocast-rss.ts`: MP4 enclosure serializer.
- `src/pages/podcast.xml.ts`.
- `src/pages/videocast.xml.ts`.

Modify:

- `src/pages/rss.xml.ts`: general site feed using explicit slugs and shared publishability rules.

Tests must parse all generated XML and assert:

- the site feed contains every eligible post and no enclosures;
- the podcast feed contains only complete podcast-audio episodes;
- the videocast feed contains only complete hosted-video episodes;
- a dual-format episode appears once in each specialist feed with the correct enclosure;
- article narration never becomes a podcast enclosure;
- GUIDs, seasons, episode numbers, explicit flags, dates, byte lengths, MIME types, and transcript elements serialize correctly;
- drafts, fixtures, and noindexed posts are absent;
- XML-sensitive content is escaped.

### Phase 4: Google and discovery surfaces

Create or modify:

- a dedicated video sitemap route or the sitemap integration configuration;
- `public/robots.txt` if additional sitemap URLs need declaring;
- a visible feed directory/footer section;
- content-authoring documentation with complete article, narrated article, audio episode, video episode, and dual-format examples.

Validate:

- `npm test`;
- `npm run check` with zero errors and zero warnings;
- `npm run build` with zero errors and zero warnings;
- generated page HTML, all three RSS XML documents, standard sitemap, and video sitemap;
- browser keyboard operation of audio/video controls and external links;
- captions from the real cross-origin VTT asset;
- media `HEAD`, `Content-Length`, `Content-Type`, CORS, and byte-range responses;
- Google Rich Results Test and Search Console URL Inspection after deployment;
- Apple feed validation before submitting either specialist feed.

### Phase 5: Projects

Create:

- `src/content/projects/`: one Markdown file per project;
- `src/pages/projects/index.astro`: published-project showcase;
- `src/pages/projects/[slug].astro`: project detail route;
- `src/layouts/ProjectLayout.astro`: project dates, body, metadata, and structured data;
- project schema and published/draft selectors with production exclusion.

Tests cover schema validation, explicit slugs, published and last-updated dates, local draft visibility, production draft exclusion, listing order, project JSON-LD, website RSS inclusion, and projects-sitemap inclusion. Projects must never enter podcast/videocast selectors.

### Phase 6: Sitemap index and fixture production barrier

Create explicit sitemap-index and paginated child-sitemap serializers. Replace reliance on a single integration-generated sitemap with deterministic page, project, and video sitemap families. Update `public/robots.txt` to reference `/sitemap-index.xml`.

Add a production-output test that builds the site, scans `dist`, and fails if any fixture slug, fixture marker, draft project slug, admin route, or submission API appears in public HTML, RSS, or sitemap XML. Add a development test proving fixture articles and draft projects remain available through `npm run dev` selectors.

### Phase 7: Contact submissions and Access-protected admin

Create:

- public contact hub and three form pages;
- reusable form, field, success, and Turnstile components;
- closed validation types for media, guest, and story/question submissions;
- dynamic submission endpoints and server-only service/repository modules;
- canonical D1 migrations for submissions and rate limits;
- admin Access-JWT verification middleware;
- admin list, detail, filter, pagination, and status-update components/routes;
- deployment documentation for the single production `ustsh-blog` Worker, `ustsh-blog-submissions` D1 database, production Turnstile widget, production Access application, and local emulation.

Modify:

- `package.json` and lockfile: add the Cloudflare Astro adapter, JWT verification dependency, and test tooling required by TypeScript server modules;
- `astro.config.mjs`: use Cloudflare server output while preserving prerendering for public content;
- `wrangler.jsonc`: configure the production `ustsh-blog` Worker, `ustsh-blog-submissions` D1 binding, daily retention Cron Trigger, public variables, and observability without committing secrets;
- `src/env.d.ts`: type D1, Turnstile, rate-limit, and Access configuration;
- `src/middleware.ts`: verify Access assertions for the admin root and descendants and attach the verified identity;
- `.dev.vars.example`: document local test bindings and placeholders without real credentials.

Tests cover every field contract and permission dependency, malformed input, honeypot, Turnstile failure/action/hostname/replay behavior, rate limits, D1 persistence, collision retry, pagination, filters, parameterized queries, status transitions, manual deletion, seven-day scheduled deletion boundaries, same-origin mutation protection, valid/invalid Access JWTs, admin cache/indexing headers, and sitemap/feed exclusion.

Deployment validation must exercise real forms with fresh Turnstile tokens, verify replay rejection, confirm D1 persistence, test both allowed administrator email addresses and a disallowed address, open both admin index and nested detail pages, update a status, confirm `status_updated_by` records the verified Access identity, manually delete a test submission, and run the retention handler against expired test data. Local unit tests do not substitute for this deployed end-to-end check.

## Resolved decisions and remaining editorial inputs

The architecture and defaults are now resolved:

- Author IDs resolve through a dedicated author collection; `dj` is the first author ID.
- Podcast and videocast title: `Useful Stash`.
- Podcast description: the proposed editable copy in `src/config/podcast.ts` above.
- Public podcast author: `DJ Wynyard`.
- Administrative owner: `RePass Cloud`.
- Verification email: `hello@repasscloud.com`.
- Channel and episode explicit default: `false`, with a per-episode boolean override.
- Apple category: `Technology`.
- Podcast and videocast use the same square artwork.
- Released episodes use a generated, immutable UUIDv7 GUID.
- Episode-specific Spotify and Apple Podcasts URLs are added after publication and the post’s `updatedAt` is updated when republished.
- The `dj` author displays as `DJ Wynyard`; biography, JPG avatar URL, and social URLs remain nullable and hidden until supplied.
- Final square show artwork replaces the placeholder before the implementation is pushed to GitHub.
- The publisher manually generates and stores each episode UUIDv7 at release time.
- The single production deployment is named `ustsh-blog`, with D1 database `ustsh-blog-submissions`; local development uses emulation rather than a deployed development environment.
- Cloudflare Access allows exactly `danijel@repasscloud.com` and `dj.wynyard@icloud.com`.
- Contact submissions are automatically deleted after seven days and can be permanently deleted earlier through the protected admin UI.

“Existing fixtures” refers to the three current articles marked `fixture: true`. They are sample/demo posts used to prove the design, not automatically approved real content. Keep them as development samples and exclude them from production routes, feeds, and sitemaps. If one is later reviewed and accepted as a real article, change it to `fixture: false` as a deliberate editorial action.

The only remaining inputs are supplied later as part of normal publishing or deployment:

- author biography, JPG avatar URL, and any social URLs;
- the final square show artwork before the implementation is pushed;
- the publisher-generated UUIDv7 for each newly released episode;
- final episode-specific Spotify and Apple Podcasts URLs after those platforms publish the episode; and
- production D1 identifier and Turnstile credentials created for the named production resources during deployment.

## Acceptance criteria

The upgrade is complete only when:

1. every post has an explicit slug, SEO block, dates, and validated optional hero image;
2. every post resolves one or more valid author IDs and links its byline to complete author pages;
3. media paths beginning with `/` resolve to `https://media.usefulstash.com` only in media fields;
4. article narration, podcast audio, and hosted video remain distinct in schema, UI, and feeds;
5. hosted video uses a first-party player with WebVTT captions when supplied;
6. YouTube, Spotify, and Apple links render only when supplied;
7. `/rss.xml`, `/podcast.xml`, and `/videocast.xml` contain exactly their intended content;
8. no fixture, draft, or noindexed post leaks into feeds or sitemaps;
9. article and video structured data matches visible content and validates;
10. the media origin supports direct crawlers and range playback;
11. published projects have dedicated indexable pages and appear only in the general website feed and projects sitemap;
12. fixture articles and draft projects are available locally but provably absent from production output;
13. `/sitemap-index.xml` owns paginated page, project, and video child sitemaps;
14. public media, guest, and story/question forms persist validated submissions behind Turnstile;
15. `/admin/*` is protected by exact-email Cloudflare Access OTP plus verified Access JWT middleware; and
16. submissions are automatically deleted after seven days and support protected manual deletion; and
17. tests, Astro check, and production build complete with zero errors and zero warnings.
