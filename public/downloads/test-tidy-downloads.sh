#!/usr/bin/env bash
set -euo pipefail
script=$(cd -- "$(dirname -- "$0")" && pwd)/tidy-downloads.sh
work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT
mkdir "$work/input"
d=$work/input
printf original > "$d/a PDF.PDF"
touch "$d/photo.png" "$d/active.crdownload" "$d/.hidden.pdf" "$d/unknown.bin"
ln -s 'a PDF.PDF' "$d/link.pdf"
"$script" "$d"
[[ ! -e $d/Documents && -f "$d/a PDF.PDF" ]]
"$script" --apply "$d"
[[ -f "$d/Documents/a PDF.PDF" && -f $d/Images/photo.png && -f $d/active.crdownload && -L $d/link.pdf && -f $d/.hidden.pdf && -f $d/unknown.bin ]]
"$script" --apply "$d"
printf collision > "$d/a PDF.PDF"
if "$script" --apply "$d"; then exit 1; else [[ $? == 1 ]]; fi
[[ $(cat "$d/Documents/a PDF.PDF") == original && $(cat "$d/a PDF.PDF") == collision ]]
ln -s "$work" "$d/Archives"
touch "$d/a.zip"
if "$script" --apply "$d"; then exit 1; else [[ $? == 1 ]]; fi
[[ -f $d/a.zip && ! -e $work/a.zip ]]
printf 'PASS\n'
