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

2. How long after it was written did it bite? Who ran it, and did they
   know what it did?

   **Answer:**

3. What would have prevented it: a preview, a `--help`, a safer default?

   **Answer:**

---

## 2. The tool itself

1. ⭐ Is `tidy-downloads.sh` a real script you use? If not, should we build
   it for this article, or use a different real tool?

   **Answer:**

2. ⭐ What does "tidy" mean: sort by file type, by age, move to dated
   folders, delete old installers, something else?

   **Answer:**

3. Platform: macOS only, or macOS and Linux? Plain bash/zsh, or allowed to
   depend on anything else?

   **Answer:**

4. Input, result, and the failure you most want to avoid (the stub's own
   three-line spec, for this tool):

   **Answer:**

---

## 3. Preview, help and defaults

1. What should `--preview` output look like? Sketch a few lines.

   **Answer:**

2. What's the safest sensible default: preview unless `--apply` is passed,
   or act unless `--preview` is passed?

   **Answer:**

3. Does it ever delete, or only move? Where would deleted or moved files
   go (Trash, a dated folder)?

   **Answer:**

4. What goes in `--help`? What's the one copyable example?

   **Answer:**

---

## 4. Partial failure and edge cases

1. What happens if it's interrupted halfway? Can it be re-run safely?

   **Answer:**

2. Name clashes, files still downloading (`.crdownload`, `.part`),
   iCloud placeholders, symlinks: which of these matter to you?

   **Answer:**

3. Anything destructive a reader must be warned about in bold?

   **Answer:**

---

## 5. From script to tool: your habits

1. What's your personal checklist before you keep a script? (Name,
   location, `--help`, `set -euo pipefail`, tests, README…)

   **Answer:**

2. Where do your kept tools live? A dotfiles repo, `~/bin`, a stash repo?

   **Answer:**

3. When do you decide a script **isn't** worth keeping?

   **Answer:**

---

## 6. The artefact and the article itself

1. ⭐ Where should the script live for download: this repo (e.g.
   `public/downloads/`), a GitHub gist, or a separate repo?

   **Answer:**

2. Licence for the script?

   **Answer:**

3. Headline and slug: keep "Make a small tool worth keeping", or change it?

   **Answer:**

4. Rough length, and any video walkthrough planned?

   **Answer:**

---

## 7. Lightning round (pull-quote fuel)

- The one line every script should have:
- The worst flag name you've ever seen:
- Your future self, in one sentence:

---

## Appendix — suggested article shape

1. **The problem:** the script that bit someone (§1).
2. **Context:** why one-off scripts quietly become infrastructure.
3. **What I tried:** turning a real script into a tool (§2–§3).
4. **The decision:** preview first, safe defaults, honest help.
5. **Working implementation:** the full script, walked through.
6. **Edges:** partial failure, clashes and destructive steps (§4).
7. **Artefact/takeaway:** the download link, plus the takeaway line.
