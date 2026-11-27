# "Make a small tool worth keeping" — Author Questionnaire

> Internal working document. Not published or linked from the site, and
> excluded from the npm build because Astro builds `src/` and `public/`, not
> `docs/`. This file is tracked in Git, so treat it as internal repository
> material.
>
> Purpose: give DJ the raw material to turn the 210-word fixture
> `src/content/articles/2026-09-15-make-a-small-tool-worth-keeping.md` into a
> full article under a **new slug**, ideally with a real, tested script as
> the downloadable artefact. The fixture stays as a local-development sample.
>
> Answers don't need to be publish-ready. Bullet points, rants and "I don't
> know yet" are all fine. The script and the stories have to be real.

Answer as many or as few as you want. The questions marked ⭐ are the ones the
article can't really work without.

---

## 0. What's already on record (don't re-answer these)

From the fixture stub:

- **Thesis:** a quick script saves an afternoon; a small, dependable tool
  keeps saving afternoons after you've forgotten how it works.
- **Takeaway:** a useful tool isn't finished when it runs once; it's
  finished when the next person can run it safely.
- **Section 1, "Start with the real job":** write down the input, the
  result, and the failure you most want to avoid. Extra options can wait.
- **Example command:** `./tidy-downloads.sh --preview ~/Downloads`. The
  preview matters more than a clever progress animation.
- **Section 2, "Leave a clean handhold":** a useful `--help`, safe defaults,
  one copyable example, and an honest note about partial failure.
- **Tags:** Tools, Workflow.

---

## 1. The script that bit someone

1. ⭐ Tell me about a real one-off script (yours or someone else's) that
   caused damage or confusion later. What happened?

   **Answer:**

   No verified personal incident has been supplied. Use a reproducible failure instead: a naïve `mv` into a category folder can overwrite an existing file with the same name. Demonstrate this only with disposable files; do not present it as an incident from my career.

2. How long after it was written did it bite? Who ran it, and did they
   know what it did?

   **Answer:**

   Not established. The demonstration is immediate and repeatable; the original author, operator and elapsed time of a real incident remain unknown.

3. What would have prevented it: a preview, a `--help`, a safer default?

   **Answer:**

   Preview by default, explicit `--apply`, no-clobber moves, collision reporting and a documented exit status. Help alone cannot prevent data loss.

---

## 2. The tool itself

1. ⭐ Is `tidy-downloads.sh` a real script you use? If not, should we build
   it for this article, or use a different real tool?

   **Answer:**

   Build it specifically for this article. The implementation and test harness are included below; no claim is made that this was previously a daily-use tool.

2. ⭐ What does "tidy" mean: sort by file type, by age, move to dated
   folders, delete old installers, something else?

   **Answer:**

   Sort recognised top-level regular files by extension into Documents, Images, Archives and Installers. Leave unknown extensions, hidden files, directories and incomplete-download suffixes alone. Do not delete old installers or recursively reorganise folders.

3. Platform: macOS only, or macOS and Linux? Plain bash/zsh, or allowed to
   depend on anything else?

   **Answer:**

   Target macOS and Linux using Bash and standard utilities (`mkdir`, `mv`, `tr`). Avoid GNU-only long options where possible and Bash 4-specific syntax. Linux Bash 5.2 was tested; macOS Bash 3.2 compatibility still requires a native run.

4. Input, result, and the failure you most want to avoid (the stub's own
   three-line spec, for this tool):

   **Answer:**

   - Input: one explicitly supplied directory.
   - Result: recognised files moved into predictable category folders only when requested.
   - Failure to avoid: overwriting an existing file or moving data outside the intended directory.

---

## 3. Preview, help and defaults

1. What should `--preview` output look like? Sketch a few lines.

   **Answer:**

   Example output (shell-escaped paths make spaces visible):

   ```text
   preview ./report.pdf -> ./Documents/report.pdf
   preview ./photo.png -> ./Images/photo.png
   SKIP conflict: ./Archives/backup.zip
   ```

   Preview creates no folders and moves nothing. A conflict returns status 1 even in preview.

2. What's the safest sensible default: preview unless `--apply` is passed,
   or act unless `--preview` is passed?

   **Answer:**

   Preview unless `--apply` is explicitly supplied. Require a directory rather than silently selecting the current directory or Downloads. Reject the filesystem root.

3. Does it ever delete, or only move? Where would deleted or moved files
   go (Trash, a dated folder)?

   **Answer:**

   Only move. Preserve filenames and file contents. No Trash integration, permanent deletion or automatic collision renaming. Existing destination files are left untouched.

4. What goes in `--help`? What's the one copyable example?

   **Answer:**

   Usage, default mode, scope, exclusions, exit codes and one copyable example: `./tidy-downloads.sh --preview ~/Downloads`. The user can then replace `--preview` with `--apply` after inspecting the output.

---

## 4. Partial failure and edge cases

1. What happens if it's interrupted halfway? Can it be re-run safely?

   **Answer:**

   Completed moves remain completed; no transaction or rollback is promised. A rerun ignores category directories and processes remaining top-level files. Conflicts stay in place. Empty category folders may remain after failure. Check the exit status and inspect the output.

2. Name clashes, files still downloading (`.crdownload`, `.part`),
   iCloud placeholders, symlinks: which of these matter to you?

   **Answer:**

   All matter. Skip existing destination names, symlink sources and symlink category directories. Skip common partial-download and iCloud placeholder suffixes. This is not a reliable detector of all active downloads or cloud-managed files; close download clients and use a local, quiescent directory. Do not run concurrent instances.

3. Anything destructive a reader must be warned about in bold?

   **Answer:**

   **Apply mode changes file paths. It can disrupt applications, sync clients and references to those files. Back up important data and preview first. Do not run against shared, actively changing or untrusted directories.** No automatic undo is supplied. The test harness deletes only its own temporary directory.

---

## 5. From script to tool: your habits

1. What's your personal checklist before you keep a script? (Name,
   location, `--help`, `set -euo pipefail`, tests, README…)

   **Answer:**

   Proposed checklist: descriptive name, explicit input, safe default, useful help, quoted paths, predictable exit codes, narrow permissions, test fixtures, documented limitations and a README. Use strict shell options where appropriate; this script deliberately handles individual failures rather than relying on `set -e`.

2. Where do your kept tools live? A dotfiles repo, `~/bin`, a stash repo?

   **Answer:**

   Proposed arrangement: versioned source in the Useful Stash repository, with a reviewed release copy under `public/downloads/`. Install frequently used tools into `~/bin` if desired. The actual current personal tool directory has not been established.

3. When do you decide a script **isn't** worth keeping?

   **Answer:**

   When the job is genuinely one-off, maintenance exceeds the time saved, or an existing maintained utility solves it more reliably. Avoid keeping a script that requires undocumented assumptions or broad privileges.

---

## 6. The artefact and the article itself

1. ⭐ Where should the script live for download: this repo (e.g.
   `public/downloads/`), a GitHub gist, or a separate repo?

   **Answer:**

   Use `public/downloads/tidy-downloads.sh` in the Useful Stash repository, with tests kept outside the public directory (for example `tests/tools/`). This keeps the article and downloadable artefact versioned together. Confirm the deployed URL and executable instructions before publishing.

2. Licence for the script?

   **Answer:**

   Proposed MIT licence, subject to repository owner approval. Include the actual copyright notice and full licence text before publishing; do not assume a licence has already been granted.

3. Headline and slug: keep "Make a small tool worth keeping", or change it?

   **Answer:**

   Keep the original phrase as the editorial hook, but use a distinct headline and slug: **Make a small tool worth keeping: a safer Downloads cleanup script**; `make-a-small-tool-worth-keeping-bash`. Preserve the fixture unchanged.

4. Rough length, and any video walkthrough planned?

   **Answer:**

   Approximately 1,200–1,600 words plus code, with an optional 5–8 minute demonstration showing preview, apply, collision and rerun. No video commitment has been established.

---

## 7. Lightning round (pull-quote fuel)

- The one line every script should have: A usage line that tells me what will change before I run it.
- The worst flag name you've ever seen: No verified historical example; `--force` without a precise explanation is a poor interface.
- Your future self, in one sentence: Assume I have forgotten everything except the name of the tool.

---

## Appendix — suggested article shape

1. **The problem:** the script that bit someone (§1).
2. **Context:** why one-off scripts quietly become infrastructure.
3. **What I tried:** turning a real script into a tool (§2–§3).
4. **The decision:** preview first, safe defaults, honest help.
5. **Working implementation:** the full script, walked through.
6. **Edges:** partial failure, clashes and destructive steps (§4).
7. **Artefact/takeaway:** the download link, plus the takeaway line.


---

## Additional material — implementation and verification

The following is newly authored material, not a record of prior personal use.

### Downloadable implementation: `tidy-downloads.sh`

```bash
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
```

### Repeatable tests: `test-tidy-downloads.sh`

Save both scripts in the same directory and run `bash test-tidy-downloads.sh`.

```bash
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
```

### Verification record

- Executed successfully on Linux x86_64, GNU Bash 5.2.37.
- Passed preview without writes, apply, repeat run, uppercase extension, spaces in filenames, hidden and unknown files, partial downloads, source symlinks, destination collisions and symlink category rejection.
- macOS execution, permission failures, interruption, cloud placeholders and concurrent filesystem changes were not tested. The implementation assumes a trusted directory without concurrent writers; checks are not atomic against adversarial path replacement.
- No personal incident has been verified. Obtain an actual anecdote or explicitly use a labelled demonstration in the article.

### Reproduce the unsafe baseline

Run only in a disposable directory. This demonstrates why an ordinary move is not a safe cleanup default.

```bash
work=$(mktemp -d)
mkdir "$work/Documents"
printf old > "$work/Documents/report.pdf"
printf new > "$work/report.pdf"
command mv -f "$work/report.pdf" "$work/Documents/report.pdf"
cat "$work/Documents/report.pdf" # new: previous content replaced
rm -rf -- "$work"
```

The baseline is a proposed demonstration, not a historical incident.
