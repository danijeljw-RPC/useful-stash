# Useful Stash

Useful Stash is a statically generated Astro publication for practical guides, tools, experiments, and other useful things worth keeping.

The production site is designed for Cloudflare Workers static assets at [usefulstash.com](https://usefulstash.com). It does not use Cloudflare Pages or an Astro server adapter.

## Local setup

Use Node.js 22.12 or newer and npm.

```bash
npm install
npm run dev
```

Astro prints the local development URL. For a production-equivalent local Worker preview, run:

```bash
npm run preview
```

The preview command builds the static site and serves `dist` through the local Wrangler runtime.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Astro development server. |
| `npm run check` | Run Astro and TypeScript diagnostics. |
| `npm run build` | Generate the production site in `dist/`. |
| `npm test` | Verify generated routes, metadata, RSS, and the YouTube cover generator. Run after a build. |
| `npm run preview` | Build and serve the site with Wrangler locally. |
| `npm run deploy` | Build and deploy with the repository-local Wrangler. Do not run until the Cloudflare account and zone are ready. |

## Project structure

```text
src/
  components/       Reusable brand, navigation, article, and theme UI
  content/articles/ Markdown article entries
  layouts/          Shared document and article layouts
  pages/            Static pages, article routes, and RSS
  styles/           Central brand tokens and global styles
public/              Static discovery and brand assets
scripts/             YouTube cover generator
tests/               Built-output and generator behavior tests
docs/                Brand source material and project notes
wrangler.jsonc       Cloudflare Workers static-assets configuration
```

## Writing content

Create a Markdown or MDX file in `src/content/articles/`. The filename becomes the clean URL under `/stash/`.

```yaml
---
title: A useful title
description: A concise summary for listings and search results.
publishedAt: 2026-09-18
updatedAt: 2026-09-20 # optional
draft: false
tags:
  - Docker
  - .NET
takeaway: One concise thing worth keeping. # optional
fixture: false
---
```

Store clean tag values without decorative brackets. `ContentTag.astro` renders `Docker` as `[ DOCKER ]`. Set `draft: true` to keep an entry out of generated pages and RSS. The three initial articles are deliberately marked `fixture: true` and display “Sample article.”

The `takeaway` frontmatter field renders the publication’s standard Takeaway block after the article body. The component can also be used directly where slotted content is more appropriate.

## Article podcast audio

Put an MP3 beside the article with the same basename (`src/content/articles/my-article.mp3`, gitignored), then from the `dev` branch:

```bash
scripts/publish-article-audio.sh my-article --dry-run   # preview season/episode, tags, R2 key
scripts/publish-article-audio.sh my-article             # tag, upload, update frontmatter, commit, push dev
```

Seasons are publish years (2026 = season 01). The episode number is the next free one in that season, taken from both R2 and the local articles. The script rewrites the ID3 tags from scratch without re-encoding, embeds artwork, and uploads to `s3://usefulstash/blog-articles/audio/season-SS/episode-EEE/<slug>-sSSeEEE.mp3`. It then writes `duration`, `series`, `episode`, `audio` and `podcast` into the frontmatter. Any article with `audio` + `episode` + `podcast` shows the player and appears in `/podcast.xml`. The main `/rss.xml` never carries enclosures. Placeholders (series name, album artist, publisher, artwork) sit at the top of the script.

## Brand system

The source of truth is:

- [`docs/useful-stash-brand-guide.html`](docs/useful-stash-brand-guide.html)
- [`docs/README.md`](docs/README.md)

Brand colors live in `src/styles/brand.css` as CSS custom properties. Components consume semantic tokens instead of repeating raw color values. The default dark treatment and the Paper-based light treatment share the same component system.

The compact brand mark is `[+] USEFUL/STASH`; editorial tags intentionally use spaced brackets such as `[ DOCKER ]`.

## YouTube covers

The approved generator remains at `scripts/generate-youtube-cover.sh`.

```bash
./scripts/generate-youtube-cover.sh \
  --tag=DOCKER \
  --tag=.NET \
  --title="your docker image is ^too big.^" \
  --subtitle="2.1GB ^→^ 482MB" \
  --shape=hexagon \
  --output=cover-docker-size
```

It writes SVG first and then PNG when `rsvg-convert`, ImageMagick, or Inkscape is available. Pass `--no-png` for SVG only. See the brand files above for the full visual rules.

## Cloudflare Workers deployment

### Already configured in the repo

- Static Astro output in `dist/`; no SSR adapter.
- A local Wrangler dependency and `npm run deploy` script.
- Worker name `useful-stash`.
- Static-assets serving with trailing-slash handling and branded `404.html` fallback.
- Custom Domain declaration for the exact hostname `usefulstash.com`.
- Current compatibility date and Workers observability configuration.
- GitHub Actions validation only; it does not deploy production.
- Canonical URLs, sitemap, RSS, robots.txt, social metadata, and branded share image.

`wrangler.jsonc` declares `usefulstash.com` as a Custom Domain. The Worker is the origin. Do not add `usefulstash.com/*` and do not manually create a CNAME for this binding.

### One-time manual Cloudflare steps

Complete these only after the domain is an active zone in the intended Cloudflare account and the repository has been pushed to GitHub:

1. In the Cloudflare dashboard, open **Compute → Workers & Pages** and choose **Create application → Import a repository**.
2. Authorize the Cloudflare GitHub App for the account or organization, then select this repository.
3. Use Worker name **`useful-stash`**, production branch **`main`**, and repository root **`/`**.
4. Set the build command to **`npm run build`**.
5. Set the production deploy command to **`npx wrangler deploy`**. Workers Builds will use the Wrangler version in `package.json`.
6. Optionally enable non-production branch builds with **`npx wrangler versions upload`** for preview versions.
7. Save and deploy. Wrangler will apply the `usefulstash.com` Custom Domain declared in `wrangler.jsonc`; no separate origin or DNS CNAME is required.

No Cloudflare account ID, zone ID, API token, or secret belongs in this repository. Workers Builds creates or selects its deployment token during connection.

## Validation workflow

The GitHub workflow at `.github/workflows/validate.yml` runs `npm ci`, `npm run check`, `npm run build`, and `npm test` for pull requests and pushes to `main`. Production deployment remains solely with Cloudflare Workers Builds.
