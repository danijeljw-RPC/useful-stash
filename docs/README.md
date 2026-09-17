# Useful Stash brand pack

## Core idea

**Useful? / Stash it.**

Primary wordmark:

```text
[+] USEFUL/STASH
```

The compact `[+]` is the brand/action mark. Do **not** write it as `[ + ]`.

Editorial metadata deliberately uses spaced brackets:

```text
[ .NET ]
[ DOCKER ]
[ AI ]
[ TAKEAWAY ]
```

Those are two separate pieces of visual syntax.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Carbon | `#0D0F12` | primary dark background |
| Surface | `#15181D` | cards and raised content |
| Surface 2 | `#1D2127` | secondary raised content |
| Paper | `#F6F4EF` | warm light-mode background |
| Primary text | `#F3F1EC` | dark-mode text |
| Muted | `#969CA6` | secondary text |
| Useful Orange | `#FF6B35` | `[+]`, slash, CTA, highlighted words |
| Soft Orange | `#FF9A72` | tags and lower-priority brand accents |
| Border | `#2A2F37` | dark-mode rules and boundaries |
| Light-mode orange | `#E95320` | stronger contrast on Paper |

## YouTube thumbnail rules

1. Canvas: `1280x720`.
2. Top-left brand line: `[+] USEFUL/STASH`.
3. `[+]` is Useful Orange.
4. `/` is Useful Orange.
5. Tags are Soft Orange.
6. Title is automatically uppercase.
7. Text between `^...^` becomes Useful Orange.
8. Subtitle supports the same `^...^` syntax.
9. Use one large decorative geometric shape partially outside the right edge.
10. Do not repeat `[+]` elsewhere on the same cover.
11. Avoid stock laptops, glowing code, Matrix effects, terminal prompts, and generic hacker imagery.

## Generator

```bash
chmod +x generate-youtube-cover.sh
brew install librsvg
```

Example:

```bash
./generate-youtube-cover.sh \
  --tag=DOCKER \
  --tag=.NET \
  --title="your docker image is ^too big.^" \
  --subtitle="2.1GB ^→^ 482MB" \
  --shape=hexagon \
  --output=cover-docker-size
```

Outputs:

```text
cover-docker-size.svg
cover-docker-size.png
```

Supported shapes:

```text
circle
square
diamond
hexagon
none
```

SVG only:

```bash
./generate-youtube-cover.sh \
  --title="something ^useful^" \
  --shape=circle \
  --output=test \
  --no-png
```

## Astro + npm implementation brief

Suggested project structure:

```text
src/
  components/
    BrandMark.astro
    ContentTag.astro
    Takeaway.astro
    ArticleCard.astro
    YoutubeCoverPreview.astro
  layouts/
    BaseLayout.astro
    ArticleLayout.astro
  styles/
    brand.css
    global.css
  pages/
    index.astro
    stash/

scripts/
  generate-youtube-cover.sh

docs/
  brand.md
  youtube-covers.md
```

### `BrandMark.astro`

Support:

```text
[+] USEFUL/STASH
USEFUL/STASH
USEFUL
STASH_
```

Default:

```text
[+] USEFUL/STASH
```

### `ContentTag.astro`

Store clean metadata:

```yaml
tags:
  - .NET
  - Docker
```

Render it as:

```text
[ .NET ]
[ DOCKER ]
```

The component should add the brackets/spaces.

### `Takeaway.astro`

Every substantial article should support one concise thing worth keeping.

### CSS tokens

Define brand colours centrally as CSS custom properties. Do not scatter raw hex values through components.

## Brand behaviour

Useful Stash should feel:

- practical
- clear
- editorial
- technical without requiring developer culture
- concise
- recognisable
- useful enough to save

It should not feel:

- hacker-themed
- terminal-themed
- generic SaaS
- cyberpunk
- developer-insider-only
- stock-photo-heavy

The positioning idea is:

> **This is useful. Keep it.**
