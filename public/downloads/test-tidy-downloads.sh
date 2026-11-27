#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 DJ Wynyard
# https://usefulstash.com/downloads/LICENSE-tidy-downloads.txt
set -euo pipefail
# Bash 3.2 (macOS) ignores failed [[ ]] under set -e, so assert explicitly.
fail() { printf 'FAIL at line %s\n' "$1" >&2; exit 1; }
script=$(cd -- "$(dirname -- "$0")" && pwd)/tidy-downloads.sh
work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT
mkdir "$work/input"
d=$work/input
printf original > "$d/a PDF.PDF"
touch "$d/photo.png" "$d/active.crdownload" "$d/.hidden.pdf" "$d/unknown.bin"
ln -s 'a PDF.PDF' "$d/link.pdf"
"$script" "$d"
[[ ! -e $d/Documents && -f "$d/a PDF.PDF" ]] || fail "$LINENO"
"$script" --apply "$d"
[[ -f "$d/Documents/a PDF.PDF" && -f $d/Images/photo.png && -f $d/active.crdownload && -L $d/link.pdf && -f $d/.hidden.pdf && -f $d/unknown.bin ]] || fail "$LINENO"
"$script" --apply "$d"
printf collision > "$d/a PDF.PDF"
if "$script" --apply "$d"; then exit 1; else [[ $? == 1 ]] || fail "$LINENO"; fi
[[ $(cat "$d/Documents/a PDF.PDF") == original && $(cat "$d/a PDF.PDF") == collision ]] || fail "$LINENO"
ln -s "$work" "$d/Archives"
touch "$d/a.zip"
if "$script" --apply "$d"; then exit 1; else [[ $? == 1 ]] || fail "$LINENO"; fi
[[ -f $d/a.zip && ! -e $work/a.zip ]] || fail "$LINENO"
mkdir -p "$work/cwd/input" "$work/cdpath/input"
touch "$work/cwd/input/mine.pdf" "$work/cdpath/input/other.pdf"
(cd "$work/cwd" && CDPATH=$work/cdpath "$script" --apply input >/dev/null)
[[ -f $work/cwd/input/Documents/mine.pdf && -f $work/cdpath/input/other.pdf && ! -e $work/cdpath/input/Documents ]] || fail "$LINENO"
printf 'PASS\n'
