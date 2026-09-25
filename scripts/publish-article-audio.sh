#!/usr/bin/env bash
# Publish the podcast audio for a blog article.
#
# Drop an MP3 next to the article with the same basename:
#
#   src/content/articles/my-article.md
#   src/content/articles/my-article.mp3     (gitignored — never committed)
#
# then run, from the dev branch:
#
#   scripts/publish-article-audio.sh my-article
#
# It will:
#   1. work out the season (publish year: 2026 = 01, 2027 = 02, ...) and the next
#      free episode number in that season (from R2 *and* the local articles)
#   2. rewrite the MP3's ID3 tags from scratch (no re-encode) and embed artwork
#   3. upload it to R2:  s3://usefulstash/blog-articles/audio/season-SS/episode-EEE/<slug>-sSSeEEE.mp3
#   4. write duration / series / episode / audio / podcast into the article frontmatter
#   5. commit the article and push to dev
#
# Re-running for the same article is safe: it reuses the article's episode number
# and GUID, re-tags, and overwrites the same R2 object.
#
# Options:
#   --season N           override the season (default: publish year - 2025)
#   --episode N          override the episode number (default: next free in season)
#   --episode-type T     full | trailer | bonus (default: full)
#   --series NAME        series/show name, used for ID3 album (default: $SERIES)
#   --artwork PATH       square JPG/PNG, 1400-3000px (default: $ARTWORK)
#   --dry-run            tag a temp copy and print the plan; no upload, no file or git changes
#   --no-push            commit but do not push
#   --no-git             do not commit or push
#   -h, --help

set -euo pipefail

# -----------------------------------------------------------------------------
# Configuration (env vars override)
# -----------------------------------------------------------------------------

R2_AWS_PROFILE="${R2_AWS_PROFILE:-cloudflare-r2}"
R2_ENDPOINT_URL="${R2_ENDPOINT_URL:-https://8d7f0c4cf8b2408a145786b0996af45b.r2.cloudflarestorage.com}"
R2_BUCKET="${R2_BUCKET:-usefulstash}"
R2_PREFIX="${R2_PREFIX:-blog-articles/audio}"      # served at https://media.usefulstash.com/<prefix>/...
SITE_URL="${SITE_URL:-https://usefulstash.com}"
GIT_BRANCH="${GIT_BRANCH:-dev}"
FIRST_SEASON_YEAR="${FIRST_SEASON_YEAR:-2026}"     # 2026 = season 01

# ID3 defaults — TODO(DJ): confirm these placeholders.
SERIES="${SERIES:-Useful Stash}"                    # TALB album + frontmatter `series`
ALBUM_ARTIST="${ALBUM_ARTIST:-Useful Stash}"        # TPE2 album artist (keep constant so players group episodes)
GENRE="${GENRE:-Podcast}"                           # TCON
PUBLISHER="${PUBLISHER:-RePass Cloud}"              # TPUB
COPYRIGHT_HOLDER="${COPYRIGHT_HOLDER:-RePass Cloud}" # TCOP -> "© <year> <holder>"
LANGUAGE="${LANGUAGE:-eng}"                         # TLAN, ISO 639-2
ENCODED_BY="${ENCODED_BY:-Useful Stash}"            # TENC
# Square artwork, JPG or PNG. Same file the podcast feed uses; it's shrunk to EMBED_ARTWORK_SIZE before embedding.
ARTWORK="${ARTWORK:-public/images/podcast/useful-stash-podcast.jpg}"
EMBED_ARTWORK_SIZE="${EMBED_ARTWORK_SIZE:-1400}"   # px; keeps the MP3 ~350 KB heavier instead of several MB

# -----------------------------------------------------------------------------

die() { echo "Error: $*" >&2; exit 1; }
info() { echo "==> $*"; }

usage() { sed -n '2,/^set -euo/p' "$0" | sed -e '/^set -euo/d' -e 's/^# \{0,1\}//'; }

SEASON="" EPISODE="" EPISODE_TYPE="full" DRY_RUN=0 DO_GIT=1 DO_PUSH=1 TARGET=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --season) SEASON="$2"; shift 2 ;;
        --episode) EPISODE="$2"; shift 2 ;;
        --episode-type) EPISODE_TYPE="$2"; shift 2 ;;
        --series) SERIES="$2"; shift 2 ;;
        --artwork) ARTWORK="$2"; shift 2 ;;
        --dry-run) DRY_RUN=1; shift ;;
        --no-push) DO_PUSH=0; shift ;;
        --no-git) DO_GIT=0; DO_PUSH=0; shift ;;
        -h|--help) usage; exit 0 ;;
        -*) die "Unknown option: $1 (see --help)" ;;
        *) [[ -z "$TARGET" ]] || die "Only one article at a time."; TARGET="$1"; shift ;;
    esac
done

for cmd in ffmpeg ffprobe aws jq node git; do
    command -v "$cmd" >/dev/null || die "'$cmd' is required but not installed."
done

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"
ARTICLES_DIR="src/content/articles"
HELPER="scripts/lib/article-audio.mjs"

r2() { aws --profile "$R2_AWS_PROFILE" --endpoint-url "$R2_ENDPOINT_URL" "$@"; }

# -----------------------------------------------------------------------------
# Resolve the article + MP3 pair
# -----------------------------------------------------------------------------

if [[ -z "$TARGET" ]]; then
    candidates=()
    for mp3 in "$ARTICLES_DIR"/*.mp3; do
        [[ -e "$mp3" ]] || continue
        base="${mp3%.mp3}"
        [[ -f "$base.md" || -f "$base.mdx" ]] && candidates+=("$mp3")
    done
    [[ ${#candidates[@]} -gt 0 ]] || die "No .mp3 in $ARTICLES_DIR with a matching article."
    if [[ ${#candidates[@]} -gt 1 ]]; then
        echo "More than one MP3 has a matching article — pick one:" >&2
        printf '  %s\n' "${candidates[@]##*/}" >&2
        exit 1
    fi
    TARGET="${candidates[0]}"
fi

SLUG="$(basename "${TARGET%.mp3}")"
SLUG="${SLUG%.md}"; SLUG="${SLUG%.mdx}"
MP3="$ARTICLES_DIR/$SLUG.mp3"
ARTICLE="$ARTICLES_DIR/$SLUG.md"
[[ -f "$ARTICLE" ]] || ARTICLE="$ARTICLES_DIR/$SLUG.mdx"
[[ -f "$MP3" ]] || die "Missing audio: $MP3"
[[ -f "$ARTICLE" ]] || die "Missing article: $ARTICLES_DIR/$SLUG.md"

if [[ $DO_GIT -eq 1 && $DRY_RUN -eq 0 ]]; then
    current_branch="$(git rev-parse --abbrev-ref HEAD)"
    [[ "$current_branch" == "$GIT_BRANCH" ]] || die "Run this from the '$GIT_BRANCH' branch (currently on '$current_branch'), or pass --no-git."
fi

META="$(node "$HELPER" read "$ARTICLE")"
field() { jq -r "$1 // empty" <<<"$META"; }

TITLE="$(field .title)"
DESCRIPTION="$(field .description)"
PUBLISHED_AT="$(field .publishedAt)"
FM_SLUG="$(field .slug)"
[[ "$FM_SLUG" == "$SLUG" ]] || die "Frontmatter slug '$FM_SLUG' does not match filename '$SLUG'."
[[ "$PUBLISHED_AT" =~ ^([0-9]{4})-[0-9]{2}-[0-9]{2} ]] || die "publishedAt must be YYYY-MM-DD (got '$PUBLISHED_AT')."
RELEASE_DATE="${PUBLISHED_AT:0:10}"
RELEASE_YEAR="${BASH_REMATCH[1]}"

# Artist = the article's authors, by display name.
ARTISTS=()
while IFS= read -r author; do
    [[ -n "$author" ]] || continue
    name="$(node "$HELPER" read "src/content/authors/$author.md" 2>/dev/null | jq -r '.name // empty' || true)"
    ARTISTS+=("${name:-$author}")
done < <(jq -r '.authors[]?' <<<"$META")
ARTIST="$(IFS=';'; echo "${ARTISTS[*]:-$ALBUM_ARTIST}" | sed 's/;/; /g')"

# -----------------------------------------------------------------------------
# Season / episode
# -----------------------------------------------------------------------------

EXISTING_EPISODE="$(field .episode)"
EXISTING_SEASON="$(field .podcast.season)"
EXISTING_GUID="$(field .podcast.guid)"

if [[ -z "$SEASON" ]]; then
    SEASON="${EXISTING_SEASON:-$(( RELEASE_YEAR - FIRST_SEASON_YEAR + 1 ))}"
fi
[[ "$SEASON" =~ ^[0-9]+$ && "$SEASON" -ge 1 ]] || die "Season must be a positive number (publish year $RELEASE_YEAR gives '$SEASON')."
SEASON=$((10#$SEASON))
SS="$(printf '%02d' "$SEASON")"
SEASON_PREFIX="$R2_PREFIX/season-$SS/"

info "Listing s3://$R2_BUCKET/$SEASON_PREFIX"
# Fail loudly on credentials/bucket problems — an empty listing would otherwise look like "no episodes yet".
r2 s3api head-bucket --bucket "$R2_BUCKET" >/dev/null || die "Cannot reach R2 bucket '$R2_BUCKET' with profile '$R2_AWS_PROFILE'."
R2_KEYS="$(r2 s3api list-objects-v2 --bucket "$R2_BUCKET" --prefix "$SEASON_PREFIX" --query 'Contents[].Key' --output text)" \
    || die "Could not list s3://$R2_BUCKET/$SEASON_PREFIX"
R2_KEYS="$(tr '\t' '\n' <<<"$R2_KEYS" | grep -v '^None$' || true)"

if [[ -z "$EPISODE" && -n "$EXISTING_EPISODE" && "${EXISTING_SEASON:-}" == "$SEASON" ]]; then
    EPISODE="$EXISTING_EPISODE"
fi
if [[ -z "$EPISODE" ]]; then
    # Already uploaded under some episode number? Reuse it.
    EPISODE="$(grep -E "/episode-[0-9]{3}/$SLUG-s[0-9]{2}e[0-9]{3}\.mp3$" <<<"$R2_KEYS" | sed -E 's#.*/episode-([0-9]{3})/.*#\1#' | head -1 || true)"
fi
if [[ -z "$EPISODE" ]]; then
    max_r2="$(grep -oE 'episode-[0-9]{3}/' <<<"$R2_KEYS" | grep -oE '[0-9]{3}' | sort -n | tail -1 || true)"
    max_local="$(node "$HELPER" used-episodes "$ARTICLES_DIR" "$SEASON" | awk -v s="$SLUG" '$2 != s {print $1}' | sort -n | tail -1)"
    EPISODE=$(( $(( 10#${max_r2:-0} > ${max_local:-0} ? 10#${max_r2:-0} : ${max_local:-0} )) + 1 ))
fi
[[ "$EPISODE" =~ ^[0-9]+$ && "$EPISODE" -ge 1 ]] || die "Episode must be a positive number (got '$EPISODE')."
EPISODE=$((10#$EPISODE))
EEE="$(printf '%03d' "$EPISODE")"

# Guard against two articles claiming the same episode.
clash="$(node "$HELPER" used-episodes "$ARTICLES_DIR" "$SEASON" | awk -v e="$EPISODE" -v s="$SLUG" '$1 == e && $2 != s {print $2}')"
[[ -z "$clash" ]] || die "Season $SEASON episode $EPISODE is already used by '$clash'."
r2_clash="$(grep -E "/episode-$EEE/" <<<"$R2_KEYS" | grep -vE "/$SLUG-s${SS}e$EEE\.mp3$" | head -1 || true)"
[[ -z "$r2_clash" ]] || die "R2 already has another file in episode-$EEE: $r2_clash"

FILENAME="$SLUG-s${SS}e$EEE.mp3"
R2_KEY="$R2_PREFIX/season-$SS/episode-$EEE/$FILENAME"
AUDIO_URL="/$R2_KEY"
GUID="${EXISTING_GUID:-$(node "$HELPER" uuid7)}"
ARTICLE_URL="$SITE_URL/stash/$SLUG/"

# -----------------------------------------------------------------------------
# ID3 tags
# -----------------------------------------------------------------------------

[[ -f "$ARTWORK" ]] || die "Artwork not found: $ARTWORK"
IFS=x read -r art_w art_h < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$ARTWORK")
[[ "$art_w" =~ ^[0-9]+$ && "$art_h" =~ ^[0-9]+$ ]] || die "Could not read artwork dimensions: $ARTWORK"
[[ "$art_w" == "$art_h" ]] || die "Artwork must be square (got ${art_w}x${art_h})."
(( art_w >= 1400 )) || echo "Warning: artwork is ${art_w}px; Apple Podcasts wants 1400–3000px." >&2

COMMENT="$DESCRIPTION  $ARTICLE_URL"

TAGGED="$(mktemp -t "article-audio.XXXXXX").mp3"
EMBED_ART="$(mktemp -t "article-audio-cover.XXXXXX").jpg"
trap 'rm -f "$TAGGED" "$EMBED_ART"' EXIT

embed_size=$(( art_w < EMBED_ARTWORK_SIZE ? art_w : EMBED_ARTWORK_SIZE ))
ffmpeg -hide_banner -loglevel error -y -i "$ARTWORK" \
    -vf "scale=$embed_size:$embed_size:flags=lanczos" -q:v 3 "$EMBED_ART" \
    || die "Could not prepare artwork for embedding."

info "Tagging $MP3"
# -map_metadata -1 drops whatever tags came in, so the result is exactly this list.
# ID3v2.3 is the most widely supported; ffmpeg writes `date` as TYER (year) + TDAT (day/month).
ffmpeg -hide_banner -loglevel error -y \
    -i "$MP3" -i "$EMBED_ART" \
    -map 0:a:0 -map 1:v:0 -map_metadata -1 -map_chapters -1 \
    -c:a copy -c:v copy \
    -id3v2_version 3 -write_id3v1 1 \
    -metadata title="$TITLE" \
    -metadata artist="$ARTIST" \
    -metadata album_artist="$ALBUM_ARTIST" \
    -metadata album="$SERIES" \
    -metadata track="$EPISODE" \
    -metadata disc="$SEASON" \
    -metadata genre="$GENRE" \
    -metadata date="$RELEASE_DATE" \
    -metadata comment="$COMMENT" \
    -metadata publisher="$PUBLISHER" \
    -metadata copyright="© $RELEASE_YEAR $COPYRIGHT_HOLDER" \
    -metadata language="$LANGUAGE" \
    -metadata encoded_by="$ENCODED_BY" \
    -metadata RELEASEDATE="$RELEASE_DATE" \
    -metadata RELEASEYEAR="$RELEASE_YEAR" \
    -metadata DESCRIPTION="$DESCRIPTION" \
    -metadata URL="$ARTICLE_URL" \
    -metadata PODCASTURL="$SITE_URL/podcast.xml" \
    -metadata PODCASTID="$GUID" \
    -metadata EPISODE="s${SS}e$EEE" \
    -metadata:s:v title="Album cover" \
    -metadata:s:v comment="Cover (front)" \
    -disposition:v attached_pic \
    "$TAGGED"

DURATION_SECONDS="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$TAGGED")"
DURATION="$(awk -v t="$DURATION_SECONDS" 'BEGIN { s = int(t + 0.5); h = int(s / 3600); m = int((s % 3600) / 60); if (h) printf "%d:%02d:%02d", h, m, s % 60; else printf "%d:%02d", m, s % 60 }')"
BYTES="$(wc -c <"$TAGGED" | tr -d ' ')"

cat <<EOF

  Article:      $ARTICLE
  Title:        $TITLE
  Artist:       $ARTIST
  Album:        $SERIES   (album artist: $ALBUM_ARTIST)
  Season/Ep:    disc $SEASON / track $EPISODE   (s${SS}e$EEE, $EPISODE_TYPE)
  Released:     $RELEASE_DATE
  Artwork:      $ARTWORK (${art_w}px, embedded at ${embed_size}px)
  Duration:     $DURATION   ($BYTES bytes)
  GUID:         $GUID
  Upload to:    s3://$R2_BUCKET/$R2_KEY
  Public URL:   https://media.usefulstash.com$AUDIO_URL

EOF

if [[ $DRY_RUN -eq 1 ]]; then
    info "Dry run — tags written to a temp file only:"
    ffprobe -v error -show_entries format_tags -of default=nw=1 "$TAGGED" | sed 's/^/    /'
    ffprobe -v error -select_streams v -show_entries stream=codec_name,width,height:stream_disposition=attached_pic \
        -of compact=p=0 "$TAGGED" | sed 's/^/    artwork: /'
    exit 0
fi

# Keep the local copy identical to what is published.
cp "$TAGGED" "$MP3"

# -----------------------------------------------------------------------------
# Upload
# -----------------------------------------------------------------------------

info "Uploading to R2"
r2 s3 cp "$MP3" "s3://$R2_BUCKET/$R2_KEY" \
    --content-type "audio/mpeg" \
    --cache-control "public, max-age=86400" \
    --content-disposition "inline; filename=\"$FILENAME\"" \
    || die "Upload failed."

remote_bytes="$(r2 s3api head-object --bucket "$R2_BUCKET" --key "$R2_KEY" --query ContentLength --output text)"
[[ "$remote_bytes" == "$BYTES" ]] || die "Uploaded size $remote_bytes does not match local $BYTES."

# -----------------------------------------------------------------------------
# Frontmatter
# -----------------------------------------------------------------------------

info "Updating $ARTICLE"
UPDATE_JSON="$(mktemp -t "article-audio-update.XXXXXX")"
trap 'rm -f "$TAGGED" "$EMBED_ART" "$UPDATE_JSON"' EXIT
jq -n \
    --arg duration "$DURATION" --arg series "$SERIES" --argjson episode "$EPISODE" \
    --arg url "$AUDIO_URL" --argjson bytes "$BYTES" \
    --arg guid "$GUID" --argjson season "$SEASON" --arg type "$EPISODE_TYPE" \
    '{duration: $duration, series: $series, episode: $episode,
      audio: {url: $url, bytes: $bytes},
      podcast: {guid: $guid, season: $season, episodeType: $type}}' >"$UPDATE_JSON"
node "$HELPER" write "$ARTICLE" "$UPDATE_JSON"
node "$HELPER" validate "$ARTICLE" || die "Updated frontmatter does not pass the article schema."

# -----------------------------------------------------------------------------
# Git
# -----------------------------------------------------------------------------

if [[ $DO_GIT -eq 1 ]]; then
    info "Committing"
    git add -- "$ARTICLE"
    git commit -m "Add podcast audio for $SLUG (S${SS}E$EEE)" -- "$ARTICLE"
    if [[ $DO_PUSH -eq 1 ]]; then
        info "Pushing to origin/$GIT_BRANCH"
        git push origin "$GIT_BRANCH"
    fi
fi

info "Done: $TITLE is S${SS}E$EEE → https://media.usefulstash.com$AUDIO_URL"
