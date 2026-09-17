#!/usr/bin/env bash
set -euo pipefail

TAGS=()
TITLE=""
SUBTITLE=""
SHAPE="circle"
OUTPUT="youtube-cover"
MAKE_PNG=1

usage() {
  cat <<'EOF'
Usage:
  generate-youtube-cover.sh [options]

Required:
  --title="text ^highlight^ text"
      Main title. Automatically converted to uppercase.

Optional:
  --tag=DOCKER
      Add a tag. Repeat as many times as needed.
      Tags render as: [ DOCKER ] [ .NET ] [ ETC ]

  --subtitle="text ^highlight^ text"
      Supporting line. ^highlight^ uses the primary orange.

  --shape=circle|square|diamond|hexagon|none
      Decorative geometry placed partially off the right edge.
      Default: circle

  --output=NAME
      Output basename, without extension.
      Default: youtube-cover

  --no-png
      Generate only the SVG.

  -h, --help
      Show this help.

Output:
  NAME.svg
  NAME.png     unless --no-png is supplied

PNG conversion:
  The script tries, in order:
    1. rsvg-convert   (recommended)
    2. magick         (ImageMagick)
    3. inkscape

macOS recommended dependency:
  brew install librsvg
EOF
}

for arg in "$@"; do
  case "$arg" in
    --tag=*) TAGS+=("${arg#*=}") ;;
    --title=*) TITLE="${arg#*=}" ;;
    --subtitle=*) SUBTITLE="${arg#*=}" ;;
    --shape=*) SHAPE="${arg#*=}" ;;
    --output=*) OUTPUT="${arg#*=}" ;;
    --no-png) MAKE_PNG=0 ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Unknown argument: $arg" >&2
      echo >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$TITLE" ]]; then
  echo "Error: --title is required." >&2
  exit 1
fi

case "$SHAPE" in
  circle|square|diamond|hexagon|none) ;;
  *)
    echo "Error: --shape must be circle, square, diamond, hexagon, or none." >&2
    exit 1
    ;;
esac

if [[ "$TITLE" == *"^"* ]]; then
  carets="${TITLE//[^^]/}"
  if (( ${#carets} % 2 != 0 )); then
    echo "Error: --title contains an unmatched ^ marker." >&2
    exit 1
  fi
fi

if [[ "$SUBTITLE" == *"^"* ]]; then
  carets="${SUBTITLE//[^^]/}"
  if (( ${#carets} % 2 != 0 )); then
    echo "Error: --subtitle contains an unmatched ^ marker." >&2
    exit 1
  fi
fi

mkdir -p "$(dirname "$OUTPUT")"

TAGS_JOINED=""
if (( ${#TAGS[@]} > 0 )); then
  printf -v TAGS_JOINED '%s\x1f' "${TAGS[@]}"
  TAGS_JOINED="${TAGS_JOINED%$'\x1f'}"
fi

US_TAGS="$TAGS_JOINED" \
US_TITLE="$TITLE" \
US_SUBTITLE="$SUBTITLE" \
US_SHAPE="$SHAPE" \
US_OUTPUT="${OUTPUT}.svg" \
python3 <<'PY'
from __future__ import annotations

import html
import math
import os
from pathlib import Path

WIDTH = 1280
HEIGHT = 720

CARBON = "#0D0F12"
TEXT = "#F3F1EC"
MUTED = "#969CA6"
ORANGE = "#FF6B35"
SOFT_ORANGE = "#FF9A72"

tags = [x for x in os.environ.get("US_TAGS", "").split("\x1f") if x]
title = os.environ["US_TITLE"].upper()
subtitle = os.environ.get("US_SUBTITLE", "")
shape = os.environ.get("US_SHAPE", "circle")
output = Path(os.environ["US_OUTPUT"])

def esc(s: str) -> str:
    return html.escape(s, quote=True)

def parse_marked(text: str):
    parts = []
    buf = []
    highlighted = False
    for ch in text:
        if ch == "^":
            if buf:
                parts.append(("".join(buf), highlighted))
                buf = []
            highlighted = not highlighted
        else:
            buf.append(ch)
    if buf:
        parts.append(("".join(buf), highlighted))
    return parts

def char_weight(ch: str) -> float:
    if ch in "MW@#%":
        return 0.93
    if ch in "I1|!.,:;'`":
        return 0.34
    if ch in "JLT[]()":
        return 0.48
    if ch == " ":
        return 0.33
    if ch in "0123456789":
        return 0.60
    return 0.62

def estimate(text: str, font_size: float) -> float:
    return sum(char_weight(c) for c in text) * font_size

def marked_words(text: str):
    result = []
    for segment, hi in parse_marked(text):
        chunks = segment.split(" ")
        for i, chunk in enumerate(chunks):
            if chunk:
                result.append((chunk, hi))
            if i != len(chunks) - 1:
                result.append((" ", hi))
    return result

def wrap_marked(text: str, font_size: int, max_width: int):
    tokens = marked_words(text)
    lines = []
    current = []
    current_width = 0.0

    for token, hi in tokens:
        token_width = estimate(token, font_size)
        is_space = token.isspace()

        if current and not is_space and current_width + token_width > max_width:
            while current and current[-1][0].isspace():
                current.pop()
            lines.append(current)
            current = []
            current_width = 0.0

        if not current and is_space:
            continue

        current.append((token, hi))
        current_width += token_width

    while current and current[-1][0].isspace():
        current.pop()

    if current:
        lines.append(current)

    return lines

def merge_spans(line):
    merged = []
    for text, hi in line:
        if merged and merged[-1][1] == hi:
            merged[-1] = (merged[-1][0] + text, hi)
        else:
            merged.append((text, hi))
    return merged

def svg_text_line(line, x, y, size, weight=800, letter_spacing="-2"):
    spans = []
    for text, hi in merge_spans(line):
        colour = ORANGE if hi else TEXT
        spans.append(f'<tspan fill="{colour}">{esc(text)}</tspan>')
    return (
        f'<text x="{x}" y="{y}" xml:space="preserve" font-family="Arial, Helvetica, sans-serif" '
        f'font-size="{size}" font-weight="{weight}" letter-spacing="{letter_spacing}">'
        + "".join(spans)
        + "</text>"
    )

def shape_svg(kind: str) -> str:
    OUTER = "#15181D"   # Surface
    INNER = "#1D2127"   # Raised
    W = 22              # same thickness for both rings

    if kind == "circle":
        r_outer = 266
        r_inner = r_outer - W
        return (
            f'<circle cx="1240" cy="388" r="{r_outer}" fill="none" '
            f'stroke="{OUTER}" stroke-width="{W}"/>'
            f'<circle cx="1240" cy="388" r="{r_inner}" fill="none" '
            f'stroke="{INNER}" stroke-width="{W}"/>'
        )

    if kind == "square":
        size_outer = 432
        size_inner = size_outer - (2 * W)
        x_outer = 1038
        y_outer = 186
        x_inner = x_outer + W
        y_inner = y_outer + W
        rx_outer = 34
        rx_inner = max(0, rx_outer - W)
        return (
            f'<rect x="{x_outer}" y="{y_outer}" width="{size_outer}" height="{size_outer}" '
            f'rx="{rx_outer}" fill="none" stroke="{OUTER}" stroke-width="{W}"/>'
            f'<rect x="{x_inner}" y="{y_inner}" width="{size_inner}" height="{size_inner}" '
            f'rx="{rx_inner}" fill="none" stroke="{INNER}" stroke-width="{W}"/>'
        )

    if kind == "diamond":
        size_outer = 412
        size_inner = size_outer - (2 * W)
        x_outer = 1048
        y_outer = 196
        x_inner = x_outer + W
        y_inner = y_outer + W
        rx_outer = 24
        rx_inner = max(0, rx_outer - W)
        return (
            f'<rect x="{x_outer}" y="{y_outer}" width="{size_outer}" height="{size_outer}" '
            f'rx="{rx_outer}" fill="none" stroke="{OUTER}" stroke-width="{W}" '
            f'transform="rotate(45 1254 402)"/>'
            f'<rect x="{x_inner}" y="{y_inner}" width="{size_inner}" height="{size_inner}" '
            f'rx="{rx_inner}" fill="none" stroke="{INNER}" stroke-width="{W}" '
            f'transform="rotate(45 1254 402)"/>'
        )

    if kind == "hexagon":
        cx, cy = 1245, 388
        r_outer = 255
        r_inner = r_outer - W
        outer = []
        inner = []
        for i in range(6):
            angle = math.radians(60 * i - 30)
            outer.append(
                f"{cx + r_outer * math.cos(angle):.1f},{cy + r_outer * math.sin(angle):.1f}"
            )
            inner.append(
                f"{cx + r_inner * math.cos(angle):.1f},{cy + r_inner * math.sin(angle):.1f}"
            )
        return (
            f'<polygon points="{" ".join(outer)}" fill="none" '
            f'stroke="{OUTER}" stroke-width="{W}" stroke-linejoin="round"/>'
            f'<polygon points="{" ".join(inner)}" fill="none" '
            f'stroke="{INNER}" stroke-width="{W}" stroke-linejoin="round"/>'
        )

    return ""

title_size = 88
title_width = 855
title_lines = wrap_marked(title, title_size, title_width)

if len(title_lines) > 3:
    title_size = 76
    title_lines = wrap_marked(title, title_size, title_width)

if len(title_lines) > 3:
    title_size = 66
    title_lines = wrap_marked(title, title_size, title_width)

tag_x = 96
tag_y = 144
tag_rows = 1
tag_fragments = []

for raw in tags:
    rendered = f"[ {raw.upper()} ]"
    tag_width = estimate(rendered, 22) + 30

    if tag_x + tag_width > 1030:
        tag_rows += 1
        tag_x = 96
        tag_y += 36

    tag_fragments.append(
        f'<text x="{tag_x:.0f}" y="{tag_y}" '
        f'font-family="Courier New, monospace" font-size="22" font-weight="700" '
        f'letter-spacing="1.2" fill="{SOFT_ORANGE}">{esc(rendered)}</text>'
    )

    tag_x += tag_width

title_start_y = 310 + ((tag_rows - 1) * 22)
line_gap = int(title_size * 1.02)

title_fragments = []
for idx, line in enumerate(title_lines[:3]):
    title_fragments.append(
        svg_text_line(line, 96, title_start_y + idx * line_gap, title_size)
    )

subtitle_fragment = ""
if subtitle:
    subtitle_size = 36
    subtitle_lines = wrap_marked(subtitle, subtitle_size, 790)
    subtitle_y = title_start_y + min(len(title_lines), 3) * line_gap + 46
    subtitle_parts = []

    for idx, line in enumerate(subtitle_lines[:2]):
        subtitle_parts.append(
            svg_text_line(
                line,
                98,
                subtitle_y + idx * 44,
                subtitle_size,
                weight=700,
                letter_spacing="-0.5",
            )
        )

    subtitle_fragment = "\n".join(subtitle_parts)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg"
     width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}">
  <rect width="{WIDTH}" height="{HEIGHT}" fill="{CARBON}"/>

  {shape_svg(shape)}

  <path d="M96 181 H190" stroke="{ORANGE}" stroke-width="5"/>

  <text x="96" y="82" xml:space="preserve"
        font-family="Courier New, monospace"
        font-size="25" font-weight="700" letter-spacing="1.5"><tspan fill="{ORANGE}">[+]</tspan><tspan fill="{TEXT}" dx="6">USEFUL</tspan><tspan fill="{ORANGE}">/</tspan><tspan fill="{TEXT}">STASH</tspan></text>

  {"".join(tag_fragments)}

  {"".join(title_fragments)}

  {subtitle_fragment}

  <text x="96" y="674"
        font-family="Courier New, monospace"
        font-size="18" font-weight="700" letter-spacing="1"
        fill="{MUTED}">USEFULSTASH.COM</text>
</svg>
'''

output.write_text(svg, encoding="utf-8")
print(f"SVG: {output}")
PY

if (( MAKE_PNG == 1 )); then
  SVG="${OUTPUT}.svg"
  PNG="${OUTPUT}.png"

  if command -v rsvg-convert >/dev/null 2>&1; then
    rsvg-convert \
      --width 1280 \
      --height 720 \
      --output "$PNG" \
      "$SVG"
  elif command -v magick >/dev/null 2>&1; then
    magick \
      -background none \
      -density 144 \
      "$SVG" \
      -resize 1280x720 \
      "$PNG"
  elif command -v inkscape >/dev/null 2>&1; then
    inkscape \
      "$SVG" \
      --export-type=png \
      --export-filename="$PNG" \
      --export-width=1280 \
      --export-height=720 \
      >/dev/null
  else
    cat >&2 <<EOF
SVG generated successfully: ${SVG}

PNG was not generated because no SVG renderer was found.

Recommended on macOS:

  brew install librsvg

Then rerun the command.
EOF
    exit 2
  fi

  echo "PNG: $PNG"
fi
