#!/usr/bin/env bash
set -euo pipefail

# Useful Stash social artwork generator
# SVG-first, with optional PNG conversion.
#
# Recommended on macOS:
#   brew install librsvg

PRESETS=()
TAGS=()
TITLE=""
SUBTITLE=""
SHAPE="circle"
OUTPUT="social-output"
BRAND="auto"
URL_TEXT="USEFULSTASH.COM"
MAKE_SVG=1
MAKE_PNG=1
SAFE_ZONES=0

ALL_PRESETS=(
  youtube
  youtube-short
  instagram-square
  instagram-portrait
  instagram-story
  instagram-reel
  tiktok
  threads
  linkedin
  x
  facebook
  og
)

VERTICAL_PRESETS=(
  youtube-short
  instagram-story
  instagram-reel
  tiktok
)

SOCIAL_PRESETS=(
  instagram-square
  instagram-portrait
  instagram-story
  instagram-reel
  tiktok
  threads
  linkedin
  x
  facebook
)

usage() {
  cat <<'EOF'
Usage:
  generate-social-image.sh [options]

Required:
  --title="text ^highlight^ text"
      Main title. Automatically uppercased.
      Paired ^ markers highlight text in Useful Orange.

Output selection:
  --preset=NAME
      Repeatable.

  --all
      Generate all presets.

  --vertical
      Generate YouTube Short, Instagram Story/Reel and TikTok.

  --social
      Generate Instagram, TikTok, Threads, LinkedIn, X and Facebook.

  --list-presets
      Print presets and dimensions.

If no output selector is supplied, instagram-square is generated.

Content:
  --tag=DOCKER
      Repeatable. Renders [ DOCKER ].

  --subtitle="text ^highlight^ text"
      Optional supporting copy.

  --shape=circle|square|diamond|hexagon|none
      Default: circle

  --brand=auto|primary|stacked
      auto    = stacked on instagram-square, primary elsewhere
      primary = [+] USEFUL/STASH
      stacked = USEFUL / STASH_
      Default: auto

  --url=TEXT
      Footer text. Default: USEFULSTASH.COM
      Pass --url= to suppress it.

Output:
  --output=DIR
      Output directory. Default: social-output

  --png-only
      Keep only PNG files.

  --svg-only
      Generate only SVG files.

  --safe-zones
      Overlay conservative platform UI exclusion guides on vertical artwork.

  -h, --help
      Show help.

Presets:
  youtube             1280x720
  youtube-short       1080x1920
  instagram-square    1080x1080
  instagram-portrait  1080x1350
  instagram-story     1080x1920
  instagram-reel      1080x1920
  tiktok              1080x1920
  threads             1080x1350
  linkedin            1200x627
  x                   1600x900
  facebook            1200x630
  og                  1200x630

PNG conversion order:
  rsvg-convert -> magick -> inkscape

Recommended on macOS:
  brew install librsvg
EOF
}

list_presets() {
  cat <<'EOF'
youtube             1280x720   landscape
youtube-short       1080x1920  vertical
instagram-square    1080x1080  square
instagram-portrait  1080x1350  portrait
instagram-story     1080x1920  vertical
instagram-reel      1080x1920  vertical
tiktok              1080x1920  vertical
threads             1080x1350  portrait
linkedin            1200x627   wide-share
x                   1600x900   landscape
facebook            1200x630   wide-share
og                  1200x630   wide-share
EOF
}

append_group() {
  local item
  for item in "$@"; do
    PRESETS+=("$item")
  done
}

for arg in "$@"; do
  case "$arg" in
    --preset=*) PRESETS+=("${arg#*=}") ;;
    --all) append_group "${ALL_PRESETS[@]}" ;;
    --vertical) append_group "${VERTICAL_PRESETS[@]}" ;;
    --social) append_group "${SOCIAL_PRESETS[@]}" ;;
    --tag=*) TAGS+=("${arg#*=}") ;;
    --title=*) TITLE="${arg#*=}" ;;
    --subtitle=*) SUBTITLE="${arg#*=}" ;;
    --shape=*) SHAPE="${arg#*=}" ;;
    --brand=*) BRAND="${arg#*=}" ;;
    --url=*) URL_TEXT="${arg#*=}" ;;
    --output=*) OUTPUT="${arg#*=}" ;;
    --png-only) MAKE_SVG=0; MAKE_PNG=1 ;;
    --svg-only) MAKE_SVG=1; MAKE_PNG=0 ;;
    --safe-zones) SAFE_ZONES=1 ;;
    --list-presets) list_presets; exit 0 ;;
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

case "$BRAND" in
  auto|primary|stacked) ;;
  *)
    echo "Error: --brand must be auto, primary, or stacked." >&2
    exit 1
    ;;
esac

validate_markers() {
  local name="$1"
  local value="$2"

  if [[ "$value" == *"^"* ]]; then
    local carets="${value//[^^]/}"
    if (( ${#carets} % 2 != 0 )); then
      echo "Error: $name contains an unmatched ^ marker." >&2
      exit 1
    fi
  fi
}

validate_markers "--title" "$TITLE"
validate_markers "--subtitle" "$SUBTITLE"

if (( ${#PRESETS[@]} == 0 )); then
  PRESETS=(instagram-square)
fi

# Validate + de-duplicate without associative arrays so this works on macOS Bash 3.2.
UNIQUE_PRESETS=()

for preset in "${PRESETS[@]}"; do
  valid=0

  for candidate in "${ALL_PRESETS[@]}"; do
    if [[ "$preset" == "$candidate" ]]; then
      valid=1
      break
    fi
  done

  if (( valid == 0 )); then
    echo "Error: unknown preset '$preset'." >&2
    echo "Use --list-presets to see valid names." >&2
    exit 1
  fi

  seen=0
  for existing in "${UNIQUE_PRESETS[@]}"; do
    if [[ "$preset" == "$existing" ]]; then
      seen=1
      break
    fi
  done

  if (( seen == 0 )); then
    UNIQUE_PRESETS+=("$preset")
  fi
done

mkdir -p "$OUTPUT"

TAGS_JOINED=""
if (( ${#TAGS[@]} > 0 )); then
  printf -v TAGS_JOINED '%s\x1f' "${TAGS[@]}"
  TAGS_JOINED="${TAGS_JOINED%$'\x1f'}"
fi

printf -v PRESETS_JOINED '%s\x1f' "${UNIQUE_PRESETS[@]}"
PRESETS_JOINED="${PRESETS_JOINED%$'\x1f'}"

US_PRESETS="$PRESETS_JOINED" \
US_TAGS="$TAGS_JOINED" \
US_TITLE="$TITLE" \
US_SUBTITLE="$SUBTITLE" \
US_SHAPE="$SHAPE" \
US_BRAND="$BRAND" \
US_URL_TEXT="$URL_TEXT" \
US_OUTPUT_DIR="$OUTPUT" \
US_SAFE_ZONES="$SAFE_ZONES" \
python3 <<'PY'
from __future__ import annotations

import html
import math
import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Useful Stash brand tokens
# ---------------------------------------------------------------------------

CARBON = "#0D0F12"
SURFACE = "#15181D"
RAISED = "#1D2127"
TEXT = "#F3F1EC"
MUTED = "#969CA6"
ORANGE = "#FF6B35"
SOFT_ORANGE = "#FF9A72"

SANS = "Arial, Helvetica, sans-serif"
MONO = "Courier New, monospace"

PRESETS = {
    "youtube":            (1280, 720,  "landscape"),
    "youtube-short":      (1080, 1920, "vertical"),
    "instagram-square":   (1080, 1080, "square"),
    "instagram-portrait": (1080, 1350, "portrait"),
    "instagram-story":    (1080, 1920, "vertical"),
    "instagram-reel":     (1080, 1920, "vertical"),
    "tiktok":             (1080, 1920, "vertical"),
    "threads":            (1080, 1350, "portrait"),
    "linkedin":           (1200, 627,  "wide"),
    "x":                  (1600, 900,  "landscape"),
    "facebook":           (1200, 630,  "wide"),
    "og":                 (1200, 630,  "wide"),
}

selected_presets = [x for x in os.environ["US_PRESETS"].split("\x1f") if x]
tags = [x for x in os.environ.get("US_TAGS", "").split("\x1f") if x]
title = os.environ["US_TITLE"].upper()
subtitle = os.environ.get("US_SUBTITLE", "")
shape = os.environ.get("US_SHAPE", "circle")
brand_option = os.environ.get("US_BRAND", "auto")
url_text = os.environ.get("US_URL_TEXT", "")
output_dir = Path(os.environ["US_OUTPUT_DIR"])
show_safe_zones = os.environ.get("US_SAFE_ZONES", "0") == "1"


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def parse_marked(text: str):
    parts = []
    buffer = []
    highlighted = False

    for char in text:
        if char == "^":
            if buffer:
                parts.append(("".join(buffer), highlighted))
                buffer = []
            highlighted = not highlighted
        else:
            buffer.append(char)

    if buffer:
        parts.append(("".join(buffer), highlighted))

    return parts


def char_weight(char: str) -> float:
    if char in "MW@#%":
        return 0.93
    if char in "I1|!.,:;'`":
        return 0.34
    if char in "JLT[]()":
        return 0.48
    if char == " ":
        return 0.33
    if char.isdigit():
        return 0.60
    return 0.62


def estimate(text: str, font_size: float) -> float:
    return sum(char_weight(c) for c in text) * font_size


def marked_words(text: str):
    result = []

    for segment, highlighted in parse_marked(text):
        chunks = segment.split(" ")

        for index, chunk in enumerate(chunks):
            if chunk:
                result.append((chunk, highlighted))
            if index != len(chunks) - 1:
                result.append((" ", highlighted))

    return result


def wrap_marked(text: str, font_size: int, max_width: int):
    lines = []
    current = []
    current_width = 0.0

    for token, highlighted in marked_words(text):
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

        current.append((token, highlighted))
        current_width += token_width

    while current and current[-1][0].isspace():
        current.pop()

    if current:
        lines.append(current)

    return lines


def merge_spans(line):
    merged = []

    for text, highlighted in line:
        if merged and merged[-1][1] == highlighted:
            merged[-1] = (merged[-1][0] + text, highlighted)
        else:
            merged.append((text, highlighted))

    return merged


def svg_text_line(line, x, y, size, weight=800, letter_spacing="-2"):
    spans = []

    for text, highlighted in merge_spans(line):
        colour = ORANGE if highlighted else TEXT
        spans.append(f'<tspan fill="{colour}">{esc(text)}</tspan>')

    return (
        f'<text x="{x:.1f}" y="{y:.1f}" xml:space="preserve" '
        f'font-family="{SANS}" font-size="{size}" font-weight="{weight}" '
        f'letter-spacing="{letter_spacing}">'
        + "".join(spans)
        + "</text>"
    )


def fit_text(text, max_width, max_lines, sizes):
    fallback = None

    for size in sizes:
        lines = wrap_marked(text, size, max_width)
        fallback = (size, lines)

        if len(lines) <= max_lines:
            return size, lines

    return fallback


def primary_brand(x, y, size):
    return (
        f'<text x="{x:.1f}" y="{y:.1f}" xml:space="preserve" '
        f'font-family="{MONO}" font-size="{size}" font-weight="700" '
        f'letter-spacing="{max(1.0, size * 0.06):.1f}">'
        f'<tspan fill="{ORANGE}">[+]</tspan>'
        f'<tspan fill="{TEXT}" dx="{max(5.0, size * 0.20):.1f}">USEFUL</tspan>'
        f'<tspan fill="{ORANGE}">/</tspan>'
        f'<tspan fill="{TEXT}">STASH</tspan>'
        f'</text>'
    )


def stacked_brand(x, y, size):
    return (
        f'<text x="{x:.1f}" y="{y:.1f}" font-family="{SANS}" '
        f'font-size="{size}" font-weight="850" letter-spacing="-3">'
        f'<tspan x="{x:.1f}" dy="0" fill="{TEXT}">USEFUL</tspan>'
        f'<tspan x="{x:.1f}" dy="{size * 0.84:.1f}" fill="{TEXT}">STASH</tspan>'
        f'<tspan fill="{ORANGE}">_</tspan>'
        f'</text>'
    )


def render_brand(preset_name, x, y, primary_size, stacked_size):
    brand = brand_option

    if brand == "auto":
        brand = "stacked" if preset_name == "instagram-square" else "primary"

    if brand == "stacked":
        return stacked_brand(x, y, stacked_size), y + stacked_size * 0.90

    return primary_brand(x, y, primary_size), y


def render_tags(raw_tags, x, y, max_x, font_size, row_gap):
    if not raw_tags:
        return "", 0

    current_x = x
    current_y = y
    rows = 1
    fragments = []

    for raw in raw_tags:
        rendered = f"[ {raw.upper()} ]"
        tag_width = estimate(rendered, font_size) + font_size * 1.25

        if current_x > x and current_x + tag_width > max_x:
            rows += 1
            current_x = x
            current_y += row_gap

        fragments.append(
            f'<text x="{current_x:.1f}" y="{current_y:.1f}" '
            f'font-family="{MONO}" font-size="{font_size}" font-weight="700" '
            f'letter-spacing="1.2" fill="{SOFT_ORANGE}">{esc(rendered)}</text>'
        )

        current_x += tag_width

    return "".join(fragments), rows


def polygon_points(cx, cy, radius, sides, rotation):
    points = []

    for index in range(sides):
        angle = math.radians(rotation + (360 / sides) * index)
        x = cx + radius * math.cos(angle)
        y = cy + radius * math.sin(angle)
        points.append(f"{x:.1f},{y:.1f}")

    return " ".join(points)


def shape_svg(kind, cx, cy, radius, thickness):
    # Final brand geometry:
    # - equal thickness outer + inner bands
    # - outer = Surface
    # - inner = Raised
    # - bands touch
    # - centre remains transparent to the Carbon backdrop
    if kind == "none":
        return ""

    inner_radius = radius - thickness

    if inner_radius <= thickness:
        raise ValueError("Shape radius is too small for the selected thickness.")

    common = 'fill="none" stroke-linejoin="round"'

    if kind == "circle":
        return (
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{radius:.1f}" '
            f'{common} stroke="{SURFACE}" stroke-width="{thickness:.1f}"/>'
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{inner_radius:.1f}" '
            f'{common} stroke="{RAISED}" stroke-width="{thickness:.1f}"/>'
        )

    if kind in ("square", "diamond"):
        outer_side = radius * 2
        inner_side = inner_radius * 2
        transform = ""

        if kind == "diamond":
            transform = f' transform="rotate(45 {cx:.1f} {cy:.1f})"'

        return (
            f'<rect x="{cx - radius:.1f}" y="{cy - radius:.1f}" '
            f'width="{outer_side:.1f}" height="{outer_side:.1f}" '
            f'rx="{radius * 0.08:.1f}" {common} stroke="{SURFACE}" '
            f'stroke-width="{thickness:.1f}"{transform}/>'
            f'<rect x="{cx - inner_radius:.1f}" y="{cy - inner_radius:.1f}" '
            f'width="{inner_side:.1f}" height="{inner_side:.1f}" '
            f'rx="{inner_radius * 0.08:.1f}" {common} stroke="{RAISED}" '
            f'stroke-width="{thickness:.1f}"{transform}/>'
        )

    if kind == "hexagon":
        outer = polygon_points(cx, cy, radius, 6, -30)
        inner = polygon_points(cx, cy, inner_radius, 6, -30)

        return (
            f'<polygon points="{outer}" {common} stroke="{SURFACE}" '
            f'stroke-width="{thickness:.1f}"/>'
            f'<polygon points="{inner}" {common} stroke="{RAISED}" '
            f'stroke-width="{thickness:.1f}"/>'
        )

    raise ValueError(f"Unknown shape: {kind}")


def footer(x, y, size):
    if not url_text:
        return ""

    return (
        f'<text x="{x:.1f}" y="{y:.1f}" font-family="{MONO}" '
        f'font-size="{size}" font-weight="700" letter-spacing="1" '
        f'fill="{MUTED}">{esc(url_text.upper())}</text>'
    )


def safe_zones(preset_name, width, height):
    if not show_safe_zones:
        return ""

    # Conservative debug guides only. Platform UI placement can change.
    fill = "#FF3B30"
    stroke = "#FF9A72"

    fragments = [
        f'<rect x="2" y="2" width="{width - 4}" height="{height - 4}" '
        f'fill="none" stroke="{stroke}" stroke-width="3" stroke-dasharray="12 10"/>'
    ]

    if preset_name in ("instagram-story", "instagram-reel"):
        fragments += [
            f'<rect x="0" y="0" width="{width}" height="220" fill="{fill}" fill-opacity="0.10"/>',
            f'<rect x="0" y="{height - 310}" width="{width}" height="310" fill="{fill}" fill-opacity="0.10"/>',
            f'<rect x="{width - 145}" y="260" width="145" height="{height - 590}" fill="{fill}" fill-opacity="0.08"/>',
        ]
    elif preset_name == "tiktok":
        fragments += [
            f'<rect x="0" y="0" width="{width}" height="190" fill="{fill}" fill-opacity="0.08"/>',
            f'<rect x="0" y="{height - 390}" width="{width}" height="390" fill="{fill}" fill-opacity="0.10"/>',
            f'<rect x="{width - 175}" y="300" width="175" height="{height - 650}" fill="{fill}" fill-opacity="0.10"/>',
        ]
    elif preset_name == "youtube-short":
        fragments += [
            f'<rect x="0" y="0" width="{width}" height="180" fill="{fill}" fill-opacity="0.08"/>',
            f'<rect x="0" y="{height - 300}" width="{width}" height="300" fill="{fill}" fill-opacity="0.09"/>',
            f'<rect x="{width - 150}" y="300" width="150" height="{height - 600}" fill="{fill}" fill-opacity="0.08"/>',
        ]

    return "".join(fragments)


def document(width, height, body, debug_svg):
    return f'''<svg xmlns="http://www.w3.org/2000/svg"
  width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <rect width="{width}" height="{height}" fill="{CARBON}"/>
  {body}
  {debug_svg}
</svg>
'''


def layout_profile(preset_name, width, height, layout):
    if layout == "landscape":
        scale = min(width / 1280, height / 720)
        return {
            "margin": width * 0.075,
            "brand_y": height * 0.114,
            "brand_size": max(22, int(25 * scale)),
            "stacked_size": max(48, int(56 * scale)),
            "tag_y": height * 0.20,
            "tag_size": max(19, int(22 * scale)),
            "tag_row_gap": max(32, int(36 * scale)),
            "content_right": width * 0.72,
            "rule_y": height * 0.251,
            "title_y": height * 0.43,
            "title_width": width * 0.67,
            "title_lines": 3,
            "title_sizes": [max(48, int(x * scale)) for x in (88, 78, 68, 58)],
            "subtitle_size": max(27, int(36 * scale)),
            "subtitle_width": width * 0.62,
            "shape_cx": width * 0.97,
            "shape_cy": height * 0.54,
            "shape_radius": min(width, height) * 0.35,
            "shape_thickness": min(width, height) * 0.05,
            "footer_y": height - height * 0.064,
            "footer_size": max(16, int(18 * scale)),
        }

    if layout == "wide":
        return {
            "margin": width * 0.065,
            "brand_y": height * 0.105,
            "brand_size": 22,
            "stacked_size": 46,
            "tag_y": height * 0.205,
            "tag_size": 19,
            "tag_row_gap": 30,
            "content_right": width * 0.75,
            "rule_y": height * 0.275,
            "title_y": height * 0.46,
            "title_width": width * 0.67,
            "title_lines": 3,
            "title_sizes": [68, 60, 54, 48],
            "subtitle_size": 28,
            "subtitle_width": width * 0.58,
            "shape_cx": width * 0.98,
            "shape_cy": height * 0.55,
            "shape_radius": height * 0.39,
            "shape_thickness": height * 0.055,
            "footer_y": height - 35,
            "footer_size": 16,
        }

    if layout == "square":
        return {
            "margin": 76,
            "brand_y": 92,
            "brand_size": 24,
            "stacked_size": 56,
            "tag_y": 224,
            "tag_size": 22,
            "tag_row_gap": 37,
            "content_right": width - 76,
            "rule_y": 292,
            "title_y": 438,
            "title_width": width - 152,
            "title_lines": 4,
            "title_sizes": [100, 92, 84, 76, 68, 60],
            "subtitle_size": 38,
            "subtitle_width": width - 152,
            "shape_cx": width * 0.91,
            "shape_cy": height * 0.82,
            "shape_radius": 285,
            "shape_thickness": 48,
            "footer_y": height - 58,
            "footer_size": 18,
        }

    if layout == "portrait":
        return {
            "margin": 76,
            "brand_y": 92,
            "brand_size": 24,
            "stacked_size": 56,
            "tag_y": 190,
            "tag_size": 22,
            "tag_row_gap": 38,
            "content_right": width - 76,
            "rule_y": 260,
            "title_y": 440,
            "title_width": width - 152,
            "title_lines": 5,
            "title_sizes": [104, 96, 88, 80, 72, 64],
            "subtitle_size": 40,
            "subtitle_width": width - 152,
            "shape_cx": width * 0.94,
            "shape_cy": height * 0.79,
            "shape_radius": 300,
            "shape_thickness": 50,
            "footer_y": height - 66,
            "footer_size": 18,
        }

    # Vertical variants intentionally differ even though all are 1080x1920.
    vertical = {
        "youtube-short": {
            "brand_y": 220, "tag_y": 330, "rule_y": 400, "title_y": 640,
            "shape_cx": 925, "shape_cy": 1410, "footer_y": 1650,
            "content_right": 900,
        },
        "instagram-story": {
            "brand_y": 225, "tag_y": 340, "rule_y": 410, "title_y": 650,
            "shape_cx": 930, "shape_cy": 1410, "footer_y": 1650,
            "content_right": 900,
        },
        "instagram-reel": {
            "brand_y": 235, "tag_y": 350, "rule_y": 420, "title_y": 665,
            "shape_cx": 925, "shape_cy": 1390, "footer_y": 1640,
            "content_right": 900,
        },
        "tiktok": {
            "brand_y": 230, "tag_y": 340, "rule_y": 410, "title_y": 650,
            "shape_cx": 900, "shape_cy": 1370, "footer_y": 1585,
            "content_right": 850,
        },
    }[preset_name]

    return {
        "margin": 82,
        "brand_y": vertical["brand_y"],
        "brand_size": 25,
        "stacked_size": 58,
        "tag_y": vertical["tag_y"],
        "tag_size": 23,
        "tag_row_gap": 40,
        "content_right": vertical["content_right"],
        "rule_y": vertical["rule_y"],
        "title_y": vertical["title_y"],
        "title_width": vertical["content_right"] - 82,
        "title_lines": 6,
        "title_sizes": [108, 100, 92, 84, 76, 68, 60],
        "subtitle_size": 42,
        "subtitle_width": vertical["content_right"] - 82,
        "shape_cx": vertical["shape_cx"],
        "shape_cy": vertical["shape_cy"],
        "shape_radius": 325,
        "shape_thickness": 54,
        "footer_y": vertical["footer_y"],
        "footer_size": 19,
    }


def render(preset_name):
    width, height, layout = PRESETS[preset_name]
    p = layout_profile(preset_name, width, height, layout)

    brand_svg, brand_bottom = render_brand(
        preset_name,
        p["margin"],
        p["brand_y"],
        p["brand_size"],
        p["stacked_size"],
    )

    tag_y = p["tag_y"]
    if brand_option == "stacked":
        tag_y = max(tag_y, brand_bottom + 55)

    tags_svg, tag_rows = render_tags(
        tags,
        p["margin"],
        tag_y,
        p["content_right"],
        p["tag_size"],
        p["tag_row_gap"],
    )

    rule_y = max(
        p["rule_y"],
        tag_y + 55 + max(0, tag_rows - 1) * p["tag_row_gap"],
    )

    title_size, title_lines = fit_text(
        title,
        int(p["title_width"]),
        p["title_lines"],
        p["title_sizes"],
    )

    title_y = max(p["title_y"], rule_y + (145 if layout != "vertical" else 210))
    line_gap = title_size * (1.02 if layout == "landscape" else 0.99)

    title_svg = "".join(
        svg_text_line(
            line,
            p["margin"],
            title_y + index * line_gap,
            title_size,
        )
        for index, line in enumerate(title_lines[:p["title_lines"]])
    )

    subtitle_svg = ""

    if subtitle:
        subtitle_lines = wrap_marked(
            subtitle,
            p["subtitle_size"],
            int(p["subtitle_width"]),
        )

        subtitle_y = (
            title_y
            + min(len(title_lines), p["title_lines"]) * line_gap
            + (62 if layout == "vertical" else 46)
        )

        subtitle_line_gap = p["subtitle_size"] * 1.25
        max_subtitle_lines = 3 if layout == "vertical" else 2

        subtitle_svg = "".join(
            svg_text_line(
                line,
                p["margin"] + 2,
                subtitle_y + index * subtitle_line_gap,
                p["subtitle_size"],
                weight=700,
                letter_spacing="-0.5",
            )
            for index, line in enumerate(subtitle_lines[:max_subtitle_lines])
        )

    body = (
        shape_svg(
            shape,
            p["shape_cx"],
            p["shape_cy"],
            p["shape_radius"],
            p["shape_thickness"],
        )
        + f'<path d="M{p["margin"]:.1f} {rule_y:.1f} '
          f'H{p["margin"] + 108:.1f}" stroke="{ORANGE}" stroke-width="6"/>'
        + brand_svg
        + tags_svg
        + title_svg
        + subtitle_svg
        + footer(p["margin"], p["footer_y"], p["footer_size"])
    )

    svg = document(
        width,
        height,
        body,
        safe_zones(preset_name, width, height),
    )

    return width, height, svg


output_dir.mkdir(parents=True, exist_ok=True)

for preset_name in selected_presets:
    width, height, svg = render(preset_name)
    path = output_dir / f"{preset_name}.svg"
    path.write_text(svg, encoding="utf-8")
    print(f"SVG {width}x{height}: {path}")
PY

if (( MAKE_PNG == 1 )); then
  renderer=""

  if command -v rsvg-convert >/dev/null 2>&1; then
    renderer="rsvg"
  elif command -v magick >/dev/null 2>&1; then
    renderer="magick"
  elif command -v inkscape >/dev/null 2>&1; then
    renderer="inkscape"
  else
    cat >&2 <<EOF
SVG files were generated successfully in:
  ${OUTPUT}

PNG files were not generated because no SVG renderer was found.

Recommended on macOS:
  brew install librsvg
EOF
    exit 2
  fi

  for preset in "${UNIQUE_PRESETS[@]}"; do
    SVG="${OUTPUT}/${preset}.svg"
    PNG="${OUTPUT}/${preset}.png"

    case "$preset" in
      youtube) WIDTH=1280; HEIGHT=720 ;;
      youtube-short) WIDTH=1080; HEIGHT=1920 ;;
      instagram-square) WIDTH=1080; HEIGHT=1080 ;;
      instagram-portrait) WIDTH=1080; HEIGHT=1350 ;;
      instagram-story) WIDTH=1080; HEIGHT=1920 ;;
      instagram-reel) WIDTH=1080; HEIGHT=1920 ;;
      tiktok) WIDTH=1080; HEIGHT=1920 ;;
      threads) WIDTH=1080; HEIGHT=1350 ;;
      linkedin) WIDTH=1200; HEIGHT=627 ;;
      x) WIDTH=1600; HEIGHT=900 ;;
      facebook) WIDTH=1200; HEIGHT=630 ;;
      og) WIDTH=1200; HEIGHT=630 ;;
    esac

    if [[ "$renderer" == "rsvg" ]]; then
      rsvg-convert \
        --width "$WIDTH" \
        --height "$HEIGHT" \
        --output "$PNG" \
        "$SVG"
    elif [[ "$renderer" == "magick" ]]; then
      magick \
        -background none \
        -density 144 \
        "$SVG" \
        -resize "${WIDTH}x${HEIGHT}!" \
        "$PNG"
    else
      inkscape \
        "$SVG" \
        --export-type=png \
        --export-filename="$PNG" \
        --export-width="$WIDTH" \
        --export-height="$HEIGHT" \
        >/dev/null
    fi

    echo "PNG ${WIDTH}x${HEIGHT}: $PNG"
  done
fi

if (( MAKE_SVG == 0 )); then
  for preset in "${UNIQUE_PRESETS[@]}"; do
    rm -f "${OUTPUT}/${preset}.svg"
  done
fi
