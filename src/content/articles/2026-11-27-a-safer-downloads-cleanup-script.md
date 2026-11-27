---
title: "Make a small tool worth keeping: a safer Downloads cleanup script"
slug: a-safer-downloads-cleanup-script
description: Turn a one-off Bash script into a tool your future self can trust, with preview by default, no-clobber moves, honest help and a test harness. Downloadable and tested on macOS and Linux.
publishedAt: 2026-11-27
draft: true
authors:
  - dj
tags:
  - Tools
  - Workflow
  - Bash
takeaway: A useful tool isn't finished when it runs once; it's finished when the next person can run it safely.
heroImage: /social-card.png
heroImageAlt: Useful Stash title card
seo:
  canonical: null
  noindex: false
---

A quick script can save an afternoon. A small, dependable tool keeps saving afternoons long after you've forgotten how it works.

The difference between the two isn't cleverness. It's what happens the second time someone runs it — maybe you, six months from now, half-remembering what it does, pointing it at a folder full of things you actually care about.

So let's build one properly. The job is deliberately small: tidy a Downloads folder by moving files into a handful of category folders. I wrote this script for this article, rather than pulling one out of my personal toolbox, so everything about it is on the page and [downloadable](/downloads/tidy-downloads.sh).

## The one-liner that quietly eats files

Here's the problem with the obvious version. This is what most of us would type:

```bash
mv ~/Downloads/*.pdf ~/Downloads/Documents/
```

It works the first time. Then one day there's already a `report.pdf` in `Documents`, you download a new `report.pdf`, and you run it again.

You can watch it happen safely in a throwaway directory:

```bash
work=$(mktemp -d)
mkdir "$work/Documents"
printf old > "$work/Documents/report.pdf"
printf new > "$work/report.pdf"
command mv -f "$work/report.pdf" "$work/Documents/report.pdf"
cat "$work/Documents/report.pdf" # new: previous content replaced
rm -rf -- "$work"
```

No warning. No error. The old file is just gone, and the exit status says everything went fine.

That's the failure this tool exists to prevent. Not a dramatic crash — a silent, successful overwrite.

## Start with the real job

Before writing a line of code, write down three things: the input, the result, and the failure you most want to avoid. That's enough scope for a small tool. Extra options can wait until someone actually needs them.

For this one:

- **Input:** one directory, explicitly supplied.
- **Result:** recognised files moved into predictable category folders — only when you ask.
- **Failure to avoid:** overwriting an existing file, or moving anything outside the directory you meant.

Then decide what "tidy" means, narrowly. Here it means: take regular files at the top level of the folder and sort them by extension into `Documents`, `Images`, `Archives` and `Installers`. That's all.

Equally important is what it *doesn't* do. It doesn't recurse into subfolders. It doesn't delete old installers. It doesn't touch hidden files, unknown extensions, directories or symlinks. It doesn't rename things to dodge collisions. Every one of those is a reasonable feature, and every one of them is a new way to surprise someone.

## Preview first, apply on purpose

The single most important design decision: **by default, it does nothing.**

```bash
./tidy-downloads.sh --preview ~/Downloads
```

Running it without `--apply` prints what it *would* do, creates no folders and moves nothing:

```text
preview ./report.pdf -> ./Documents/report.pdf
preview ./photo.png -> ./Images/photo.png
SKIP conflict: ./Archives/backup.zip
```

Paths are shell-escaped, so a file called `a PDF.PDF` shows up as `./a\ PDF.PDF` and you can see exactly where the spaces are. Conflicts are reported even in preview, and they make the script exit with status 1, so you find out *before* anything moves.

Once you've read the preview and you're happy, swap `--preview` for `--apply`. That's the copyable example in the help text, too, and it's the only one you need.

The preview matters more than a clever progress animation. It lets someone see the change before trusting the tool with real files.

A few other defaults that follow from the same idea:

- **It requires a directory.** It won't silently assume the current directory or `~/Downloads`. If you forget the argument, it refuses.
- **It refuses the filesystem root.** There's no good reason to run a tidy-up against `/`.
- **It only moves.** File names and contents are preserved. No Trash, no deletion, no automatic `report (1).pdf` renaming.
- **It never overwrites.** If the destination name already exists, the file stays where it is and you get a `SKIP conflict` line.

## The whole script

It's short enough to read in one go, which is part of the point.

```bash
#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 DJ Wynyard
# https://usefulstash.com/downloads/LICENSE-tidy-downloads.txt
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
CDPATH= cd -P -- "$1" || exit 2
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
```

### Walking through it

**The help text is the interface.** Five lines: usage, the default mode, what it won't do, one example, and what the exit codes mean. If you only read `--help`, you know enough to run it safely. The one line every script should have is a usage line that tells you what will change before you run it.

**Arguments are checked before anything happens.** Exactly one directory, it must exist, and it can't start with `-` (so a typo'd flag isn't mistaken for a folder). Invalid input exits with status 2, which is different from "ran, but skipped something" (status 1). Scripts that call this one can tell those apart.

**`cd -P` resolves the real directory first.** The script works relative to where it actually is, then double-checks it isn't the filesystem root. The `CDPATH=` in front matters more than it looks: if you've exported `CDPATH` in your shell profile, a plain `cd input` can silently land in a *different* `input` folder somewhere on that search path, and the script would tidy the wrong directory. Clearing it for that one command means a relative path only ever means "relative to where you are". Everything after that uses `./`-prefixed paths, so a file named `-rf` is just a file.

**`shopt -s nullglob`** means an empty folder produces an empty loop, not a literal `./*` file that doesn't exist.

**Only plain files, never symlinks.** `[[ -f $src && ! -L $src ]]` skips directories, symlinks and anything else unusual. Hidden files never match `./*` in the first place.

**Half-downloaded files are left alone.** `.part`, `.crdownload`, `.download`, `.icloud` and `.tmp` are skipped. That catches the common partial-download and iCloud-placeholder names, but it isn't a reliable detector of every active download or cloud-managed file — more on that below.

**Extensions are matched case-insensitively.** `tr` lowercases the extension, so `PHOTO.JPG` and `photo.jpg` both land in `Images`. I used `tr` rather than Bash 4's `${ext,,}` so it works with the Bash 3.2 that macOS still ships.

**The collision check is belt and braces.** Before moving, it skips the file if the category "folder" is actually a symlink, if it exists but isn't a directory, or if the destination name is already taken. Refusing a symlinked category folder matters: otherwise `Archives -> /somewhere/else` would quietly move your files out of the directory you pointed it at.

**The move itself uses `mv -n`, then checks.** `-n` means no-clobber. But `mv -n` doesn't reliably *fail* when it declines to overwrite, so the script then checks whether the source is still there. If it is, that's reported as a failure. The silent-success problem from the one-liner can't happen here.

**One failure doesn't stop the run.** I deliberately didn't use `set -e`. Each file is handled on its own, failures are reported, and the final exit status tells you whether *everything* went cleanly. `set -u` is still on, so a typo'd variable name is an error rather than an empty string.

## Partial failure, said plainly

If a failed operation can leave partial work behind, say so. Here's the honest version for this tool:

- **There's no transaction and no rollback.** If it's interrupted halfway, the moves it already made stay made.
- **Re-running is safe.** Category folders are directories, so they're skipped; it just processes whatever's left at the top level. Conflicts stay where they are.
- **Empty category folders may be left behind** if a move fails after the folder was created.
- **Check the exit status and read the output.** 0 means everything was handled. 1 means something was skipped or failed, and the output says which.

And the warning that deserves bold:

**Apply mode changes file paths. That can break applications, sync clients and anything else that refers to those files by location. Back up anything important and preview first. Don't run it against shared, actively changing or untrusted directories, and don't run two copies at once. There's no undo.**

The checks aren't atomic. If something else is creating or replacing files in the same folder while it runs, a check can pass and the situation can change before the move happens. For a quiet, local Downloads folder that's fine. For anything adversarial, it isn't, and this tool isn't pretending otherwise. Close your download clients first.

## Tests are part of the tool

A tool you can't test is a tool you'll be scared to change. The [test harness](/downloads/test-tidy-downloads.sh) builds a throwaway directory, runs the script against it, and checks the results:

```bash
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
```

Save it next to the script, make the script executable, and run `bash test-tidy-downloads.sh`. It only ever deletes its own temporary directory.

In order, it checks that:

1. **Preview writes nothing** — no `Documents` folder appears, the file stays put.
2. **Apply moves the right things** — an uppercase extension with a space in the name, and a PNG — while leaving a partial download, a symlink, a hidden file and an unknown extension exactly where they were.
3. **A second run is harmless.**
4. **A name collision is refused**, exits with status 1, and *both* files keep their original contents.
5. **A symlinked category folder is refused**, and nothing escapes the target directory.
6. **An exported `CDPATH` can't redirect it** — a relative directory tidies the folder you meant, not a same-named one elsewhere.

Notice the `|| fail "$LINENO"` on every check. That isn't decoration. The Bash 3.2 that macOS ships doesn't stop a `set -e` script when a bare `[[ … ]]` test fails, so without it every assertion would quietly pass on a Mac. A test harness that can't fail is worse than none, because it tells you everything is fine.

It passes on Linux with GNU Bash 5.2.37 and on macOS with the system Bash 3.2.57. What it doesn't cover: permission failures, interruption mid-run, real iCloud placeholders and concurrent changes. Those are the limits, and they're written down.

## From script to tool

Most of what made this a tool rather than a script is a checklist, not code:

- A descriptive name.
- An explicit input, not an assumed one.
- A safe default.
- Useful `--help`, with one copyable example.
- Quoted paths, everywhere.
- Predictable exit codes that mean different things.
- No more permissions than it needs.
- Tests with fixtures.
- Documented limitations.
- Somewhere sensible to live, under version control.

Write the help for someone who has forgotten everything except the tool's name, because that's who you'll be.

It's equally worth knowing when *not* to keep a script. If the job really is one-off, if maintaining it would cost more time than it saves, or if a maintained utility already does it better, let it go. And don't keep anything that only works because of assumptions nobody wrote down, or that needs broad privileges to do a narrow job.

## Grab it

- **Script:** [/downloads/tidy-downloads.sh](/downloads/tidy-downloads.sh)
- **Tests:** [/downloads/test-tidy-downloads.sh](/downloads/test-tidy-downloads.sh) — save it in the same folder as the script.
- **Licence:** [MIT](/downloads/LICENSE-tidy-downloads.txt). Copy it, change it, put it in your dotfiles; just keep the copyright notice.
- **Run it:** `chmod +x tidy-downloads.sh`, then `./tidy-downloads.sh --preview ~/Downloads`. Read the output. Then, and only then, `--apply`.

A useful tool isn't finished when it runs once. It's finished when the next person can run it safely — and the next person is usually you.

[Read more practical notes in the stash](/stash/).
