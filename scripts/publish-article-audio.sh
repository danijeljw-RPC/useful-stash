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
#   6. delete the local MP3 (R2 now holds the identical, tagged file)
#
# Re-running for the same article is safe: it reuses the article's episode number
# and GUID, re-tags, and overwrites the same R2 object.
#
# Intro / outro: if podcast-audio/ has the voice + music files (see podcast-audio/README.md),
# the article audio is wrapped as  [music + intro voice] [article] [music + outro voice],
# the music ducks under the voice, and the whole episode is normalised to -16 LUFS.
# An optional per-episode line ("Season 1, episode 3: ...") can sit next to the article
# as <slug>.intro.mp3 (or .wav/.m4a/.flac) and plays straight after the intro voice.
# The finished MP3 is tagged PRODUCED=..., so re-running never adds a second intro.
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
#   --keep-local         keep the local MP3 after a successful upload
#   --no-intro           do not add the intro
#   --no-outro           do not add the outro
#
# --dry-run also writes a listenable preview to output/<file>.mp3.
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

# Intro / outro. Files are looked up as <name>.{wav,flac,aiff,aif,m4a,mp3,ogg} in PODCAST_AUDIO_DIR.
PODCAST_AUDIO_DIR="${PODCAST_AUDIO_DIR:-podcast-audio}"
MUSIC_START="${MUSIC_START:-0}"                     # s; skip into the music track (for tracks with a slow start)
OUTRO_MUSIC_START="${OUTRO_MUSIC_START:-$MUSIC_START}"
INTRO_FADE_IN="${INTRO_FADE_IN:-0.3}"               # s; short, so the sting hits straight away
INTRO_VOICE_DELAY="${INTRO_VOICE_DELAY:-2.0}"       # s of music before the intro voice
EPISODE_INTRO_GAP="${EPISODE_INTRO_GAP:-0.6}"       # s between the intro voice and <slug>.intro.*
INTRO_TAIL="${INTRO_TAIL:-2.5}"                     # s of music after the intro voice ...
INTRO_FADE_OUT="${INTRO_FADE_OUT:-1.5}"             #   ... the last this-many of which fade out
GAP_AFTER_INTRO="${GAP_AFTER_INTRO:-0.4}"           # s of silence before the article
GAP_BEFORE_OUTRO="${GAP_BEFORE_OUTRO:-1.2}"         # s of silence after the article
OUTRO_FADE_IN="${OUTRO_FADE_IN:-1.5}"
OUTRO_VOICE_DELAY="${OUTRO_VOICE_DELAY:-1.5}"       # s of music before the outro voice
OUTRO_TAIL="${OUTRO_TAIL:-4.0}"                     # s of music after the outro voice ...
OUTRO_FADE_OUT="${OUTRO_FADE_OUT:-4.0}"             #   ... fading out over this long
VOICE_LUFS="${VOICE_LUFS:--16}"                     # voice clips + article are matched to this before mixing
MUSIC_LUFS="${MUSIC_LUFS:--22}"                     # music level when nobody is talking
DUCK_THRESHOLD="${DUCK_THRESHOLD:-0.02}"            # sidechain ducking of the music under the voice
DUCK_RATIO="${DUCK_RATIO:-8}"
DUCK_ATTACK="${DUCK_ATTACK:-80}"                    # ms
DUCK_RELEASE="${DUCK_RELEASE:-700}"                 # ms
TARGET_LUFS="${TARGET_LUFS:--16}"                   # final episode loudness (Apple/Spotify spoken word)
TARGET_TP="${TARGET_TP:--1.5}"                      # dBTP; a little under -1 to leave room for MP3 encoding
MP3_BITRATE="${MP3_BITRATE:-128k}"

# -----------------------------------------------------------------------------

die() { echo "Error: $*" >&2; exit 1; }
info() { echo "==> $*"; }

usage() { sed -n '2,/^set -euo/p' "$0" | sed -e '/^set -euo/d' -e 's/^# \{0,1\}//'; }

SEASON="" EPISODE="" EPISODE_TYPE="full" DRY_RUN=0 DO_GIT=1 DO_PUSH=1 KEEP_LOCAL=0 TARGET=""
DO_INTRO=1 DO_OUTRO=1
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
        --keep-local) KEEP_LOCAL=1; shift ;;
        --no-intro) DO_INTRO=0; shift ;;
        --no-outro) DO_OUTRO=0; shift ;;
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

WORK="$(mktemp -d "${TMPDIR:-/tmp}/article-audio.XXXXXX")"
trap 'rm -rf -- "$WORK"' EXIT

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
[[ -f "$ARTICLE" ]] || die "Missing article: $ARTICLES_DIR/$SLUG.md"
if [[ ! -f "$MP3" ]]; then
    published="$(node "$HELPER" read "$ARTICLE" | jq -r '.audio.url // empty')"
    [[ -n "$published" ]] || die "Missing audio: $MP3"
    die "Missing audio: $MP3
       Already published (the local copy is removed after upload). To re-tag it, download it back first:
       aws --profile $R2_AWS_PROFILE --endpoint-url $R2_ENDPOINT_URL s3 cp s3://$R2_BUCKET${published#https://media.usefulstash.com} $MP3"
fi

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
# Intro / outro
# -----------------------------------------------------------------------------

# find_audio <path-without-extension> -> the first <path>.<ext> that exists
find_audio() {
    local ext
    for ext in wav flac aiff aif m4a mp3 ogg; do
        [[ -f "$1.$ext" ]] && { echo "$1.$ext"; return 0; }
    done
    return 1
}
duration_of() { ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$1"; }
calc() { awk "BEGIN { printf \"%.3f\", $1 }"; }
# loudness_stats <file> -> loudnorm's JSON analysis (input_i, input_tp, ...)
loudness_stats() {
    ffmpeg -hide_banner -nostats -i "$1" -af "loudnorm=I=$TARGET_LUFS:TP=$TARGET_TP:LRA=11:print_format=json" -f null - 2>&1 \
        | sed -n '/^{/,/^}/p'
}
# gain_to <target-lufs> <file> -> dB of gain that brings the file to the target
gain_to() {
    local have
    have="$(loudness_stats "$2" | jq -r .input_i)"
    [[ "$have" =~ ^-?[0-9.]+$ ]] || die "Could not measure the loudness of $2 (is it silent?)."
    calc "$1 - ($have)"
}

FMT="aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo"
silence() { echo "anullsrc=r=44100:cl=stereo,atrim=0:$1,$FMT"; }
# Strip leading/trailing silence (TTS exports usually pad both ends) so the timings above are exact.
TRIM="silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse"

# build_segment <out.wav> <voice> <music> <music-start> <fade-in> <voice-delay> <tail> <fade-out>
# Music (looped if short) with the voice laid over it after <voice-delay>. The music ducks
# under the voice, runs <tail> seconds past it, and fades out over the last <fade-out>.
build_segment() {
    local out="$1" voice="$2" music="$3" music_start="$4" fade_in="$5" delay="$6" tail="$7" fade_out="$8"
    local voice_gain music_gain len
    voice_gain="$(gain_to "$VOICE_LUFS" "$voice")"
    music_gain="$(gain_to "$MUSIC_LUFS" "$music")"
    len="$(calc "$delay + $(duration_of "$voice") + $tail")"
    ffmpeg -hide_banner -loglevel error -y \
        -stream_loop -1 -ss "$music_start" -i "$music" -i "$voice" \
        -filter_complex "
            [0:a]$FMT,volume=${music_gain}dB,atrim=0:$len,asetpts=PTS-STARTPTS,
                 afade=t=in:d=$fade_in,afade=t=out:st=$(calc "$len - $fade_out"):d=${fade_out}[music];
            [1:a]$FMT,volume=${voice_gain}dB,adelay=delays=$(awk -v d="$delay" 'BEGIN { printf "%d", d * 1000 }'):all=1,apad,asplit[voice][key];
            [music][key]sidechaincompress=threshold=$DUCK_THRESHOLD:ratio=$DUCK_RATIO:attack=$DUCK_ATTACK:release=${DUCK_RELEASE}[ducked];
            [ducked][voice]amix=inputs=2:duration=first:normalize=0[out]" \
        -map "[out]" -c:a pcm_f32le "$out" \
        || die "Could not build $(basename "$out")."
}

SOURCE_AUDIO="$MP3"
PRODUCED="$(ffprobe -v error -show_entries format_tags=PRODUCED -of default=nw=1:nk=1 "$MP3" || true)"
EPISODE_VOICE="$(find_audio "$ARTICLES_DIR/$SLUG.intro" || true)"
INTRO_VOICE="" OUTRO_VOICE="" INTRO_MUSIC="" OUTRO_MUSIC=""

if [[ -n "$PRODUCED" ]]; then
    info "Audio already has its intro/outro ($PRODUCED) — re-tagging only"
    DO_INTRO=0 DO_OUTRO=0 EPISODE_VOICE=""
fi
if [[ $DO_INTRO -eq 1 ]]; then
    INTRO_VOICE="$(find_audio "$PODCAST_AUDIO_DIR/intro-voice" || true)"
    if [[ -z "$INTRO_VOICE$EPISODE_VOICE" ]]; then
        info "No $PODCAST_AUDIO_DIR/intro-voice.* or $ARTICLES_DIR/$SLUG.intro.* — skipping the intro"
        DO_INTRO=0
    else
        INTRO_MUSIC="$(find_audio "$PODCAST_AUDIO_DIR/music")" || die "Found an intro voice but no $PODCAST_AUDIO_DIR/music.*"
    fi
fi
if [[ $DO_OUTRO -eq 1 ]]; then
    OUTRO_VOICE="$(find_audio "$PODCAST_AUDIO_DIR/outro-voice" || true)"
    if [[ -z "$OUTRO_VOICE" ]]; then
        info "No $PODCAST_AUDIO_DIR/outro-voice.* — skipping the outro"
        DO_OUTRO=0
    else
        OUTRO_MUSIC="$(find_audio "$PODCAST_AUDIO_DIR/outro-music" || find_audio "$PODCAST_AUDIO_DIR/music")" \
            || die "Found an outro voice but no $PODCAST_AUDIO_DIR/music.*"
    fi
fi
[[ $DO_INTRO -eq 1 ]] || EPISODE_VOICE=""

if [[ $DO_INTRO -eq 1 || $DO_OUTRO -eq 1 ]]; then
    # Build one concat graph: [intro] [gap] [article] [gap] [outro]
    inputs=() parts=() graph="" n=0

    if [[ $DO_INTRO -eq 1 ]]; then
        info "Building intro"
        intro_voice="$WORK/intro-voice.wav"
        if [[ -n "$INTRO_VOICE" && -n "$EPISODE_VOICE" ]]; then
            ffmpeg -hide_banner -loglevel error -y -i "$INTRO_VOICE" -i "$EPISODE_VOICE" -filter_complex \
                "[0:a]$FMT,${TRIM}[a];$(silence "$EPISODE_INTRO_GAP")[gap];[1:a]$FMT,${TRIM}[b];[a][gap][b]concat=n=3:v=0:a=1[out]" \
                -map "[out]" -c:a pcm_f32le "$intro_voice" || die "Could not join the intro voice files."
        else
            ffmpeg -hide_banner -loglevel error -y -i "${INTRO_VOICE:-$EPISODE_VOICE}" -af "$FMT,$TRIM" -c:a pcm_f32le "$intro_voice" \
                || die "Could not read the intro voice."
        fi
        build_segment "$WORK/intro.wav" "$intro_voice" "$INTRO_MUSIC" "$MUSIC_START" \
            "$INTRO_FADE_IN" "$INTRO_VOICE_DELAY" "$INTRO_TAIL" "$INTRO_FADE_OUT"
        inputs+=(-i "$WORK/intro.wav"); graph+="[$n:a]${FMT}[p$n];"; parts+=("[p$n]"); n=$((n + 1))
        graph+="$(silence "$GAP_AFTER_INTRO")[gap_in];"; parts+=("[gap_in]")
    fi

    article_gain="$(gain_to "$VOICE_LUFS" "$MP3")"
    inputs+=(-i "$MP3"); graph+="[$n:a]$FMT,$TRIM,volume=${article_gain}dB[p$n];"; parts+=("[p$n]"); n=$((n + 1))

    if [[ $DO_OUTRO -eq 1 ]]; then
        info "Building outro"
        ffmpeg -hide_banner -loglevel error -y -i "$OUTRO_VOICE" -af "$FMT,$TRIM" -c:a pcm_f32le "$WORK/outro-voice.wav" \
            || die "Could not read the outro voice."
        build_segment "$WORK/outro.wav" "$WORK/outro-voice.wav" "$OUTRO_MUSIC" "$OUTRO_MUSIC_START" \
            "$OUTRO_FADE_IN" "$OUTRO_VOICE_DELAY" "$OUTRO_TAIL" "$OUTRO_FADE_OUT"
        graph+="$(silence "$GAP_BEFORE_OUTRO")[gap_out];"; parts+=("[gap_out]")
        inputs+=(-i "$WORK/outro.wav"); graph+="[$n:a]${FMT}[p$n];"; parts+=("[p$n]"); n=$((n + 1))
    fi

    info "Mixing the episode"
    graph+="$(printf '%s' "${parts[@]}")concat=n=${#parts[@]}:v=0:a=1[out]"
    ffmpeg -hide_banner -loglevel error -y "${inputs[@]}" -filter_complex "$graph" \
        -map "[out]" -c:a pcm_f32le "$WORK/episode.wav" || die "Could not assemble the episode."

    # Two-pass loudnorm: measure the whole episode, then apply one linear gain to hit the target.
    info "Normalising to $TARGET_LUFS LUFS / $TARGET_TP dBTP"
    stats="$(loudness_stats "$WORK/episode.wav")"
    stat() { jq -r ".$1" <<<"$stats"; }
    ffmpeg -hide_banner -loglevel error -y -i "$WORK/episode.wav" \
        -af "loudnorm=I=$TARGET_LUFS:TP=$TARGET_TP:LRA=11:measured_I=$(stat input_i):measured_TP=$(stat input_tp):measured_LRA=$(stat input_lra):measured_thresh=$(stat input_thresh):offset=$(stat target_offset):linear=true,aresample=44100" \
        -c:a libmp3lame -b:a "$MP3_BITRATE" "$WORK/episode.mp3" || die "Could not encode the episode."

    PRODUCED="$( ( [[ $DO_INTRO -eq 0 ]] || echo intro; [[ $DO_OUTRO -eq 0 ]] || echo outro ) | paste -sd+ -)"
    SOURCE_AUDIO="$WORK/episode.mp3"
fi

# -----------------------------------------------------------------------------
# ID3 tags
# -----------------------------------------------------------------------------

[[ -f "$ARTWORK" ]] || die "Artwork not found: $ARTWORK"
IFS=x read -r art_w art_h < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$ARTWORK")
[[ "$art_w" =~ ^[0-9]+$ && "$art_h" =~ ^[0-9]+$ ]] || die "Could not read artwork dimensions: $ARTWORK"
[[ "$art_w" == "$art_h" ]] || die "Artwork must be square (got ${art_w}x${art_h})."
(( art_w >= 1400 )) || echo "Warning: artwork is ${art_w}px; Apple Podcasts wants 1400–3000px." >&2

COMMENT="$DESCRIPTION  $ARTICLE_URL"

TAGGED="$WORK/tagged.mp3"
EMBED_ART="$WORK/cover.jpg"

embed_size=$(( art_w < EMBED_ARTWORK_SIZE ? art_w : EMBED_ARTWORK_SIZE ))
ffmpeg -hide_banner -loglevel error -y -i "$ARTWORK" \
    -vf "scale=$embed_size:$embed_size:flags=lanczos" -q:v 3 "$EMBED_ART" \
    || die "Could not prepare artwork for embedding."

info "Tagging $SOURCE_AUDIO"
# -map_metadata -1 drops whatever tags came in, so the result is exactly this list.
# ID3v2.3 is the most widely supported; ffmpeg writes `date` as TYER (year) + TDAT (day/month).
ffmpeg -hide_banner -loglevel error -y \
    -i "$SOURCE_AUDIO" -i "$EMBED_ART" \
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
    -metadata PRODUCED="$PRODUCED" \
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
  Intro/outro:  ${PRODUCED:-none}${EPISODE_VOICE:+   (episode line: $EPISODE_VOICE)}
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
    mkdir -p output
    cp "$TAGGED" "output/$FILENAME"
    info "Preview to listen to: output/$FILENAME"
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
UPDATE_JSON="$WORK/update.json"
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

# Only reached after the upload size check, frontmatter write and git steps all succeeded.
if [[ $KEEP_LOCAL -eq 0 ]]; then
    rm -f -- "$MP3" ${EPISODE_VOICE:+"$EPISODE_VOICE"}
    info "Removed local $MP3${EPISODE_VOICE:+ and $EPISODE_VOICE} (published copy is on R2; pass --keep-local to keep it)"
fi

info "Done: $TITLE is S${SS}E$EEE → https://media.usefulstash.com$AUDIO_URL"
