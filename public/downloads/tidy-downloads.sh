#!/usr/bin/env bash
set -u
mode=preview
if [[ ${1-} == --help ]]; then
  printf '%s\n' 'Usage: tidy-downloads.sh [--preview|--apply] DIRECTORY' 'Default: preview; --apply moves regular files into type folders.' 'No recursion, deletion or overwrite. Hidden files and symlinks skipped.' 'Example: ./tidy-downloads.sh --preview ~/Downloads' 'Exit: 0 success, 1 skipped conflict or move failure, 2 invalid input.'
  exit 0
fi
case ${1-} in --preview|--apply) mode=${1#--}; shift;; esac
if [[ $# != 1 || ! -d $1 || $1 == -* ]]; then
  printf '%s\n' 'Invalid directory; see --help.' >&2; exit 2
fi
cd -P -- "$1" || exit 2
[[ $PWD != / ]] || exit 2
shopt -s nullglob
status=0
for src in ./*; do
  [[ -f $src && ! -L $src ]] || continue
  name=${src#./}
  case $name in *.part|*.crdownload|*.download|*.icloud|*.tmp) continue;; esac
  ext=$(printf '%s' "${name##*.}" | tr '[:upper:]' '[:lower:]')
  case $ext in
    pdf|doc|docx|txt|md) folder=Documents;;
    jpg|jpeg|png|gif|webp|heic) folder=Images;;
    zip|gz|tar|7z) folder=Archives;;
    dmg|pkg|exe|msi) folder=Installers;;
    *) continue;;
  esac
  dest=./$folder/$name
  if [[ -L ./$folder || ( -e ./$folder && ! -d ./$folder ) || -e $dest || -L $dest ]]; then
    printf 'SKIP conflict: %q\n' "$dest" >&2; status=1; continue
  fi
  printf '%s %q -> %q\n' "$mode" "$src" "$dest"
  if [[ $mode == apply ]]; then
    if ! mkdir -p -- "./$folder" || ! mv -n -- "$src" "$dest" || [[ -e $src || -L $src ]]; then
      printf 'FAILED or skipped: %q\n' "$src" >&2; status=1
    fi
  fi
done
exit "$status"
