# "A container cleanup you can explain" — Author Questionnaire

> Internal working document. Not published or linked from the site, and
> excluded from the npm build because Astro builds `src/` and `public/`, not
> `docs/`. This file is tracked in Git, so treat it as internal repository
> material.
>
> Purpose: give DJ the raw material to turn the 170-word fixture
> `src/content/articles/2026-09-04-a-container-cleanup-you-can-explain.md`
> into a full article under a **new slug**. Generic multi-stage Docker advice
> is everywhere, so this piece only earns its place with a **real image,
> real numbers and a real Dockerfile**. The fixture stays as a
> local-development sample.
>
> Answers don't need to be publish-ready. Paste Dockerfiles, `docker images`
> output and rants as they are.

Answer as many or as few as you want. The questions marked ⭐ are the ones the
article can't really work without.

---

## 0. What's already on record (don't re-answer these)

From the fixture stub:

- **Thesis:** image-size advice turns into a bag of flags. A simpler
  principle gets most of the way: build in one stage, then copy only the
  runtime artefacts into the final stage.
- **Takeaway:** the clearest small image contains only the runtime and the
  artefacts required to run the application.
- **Section 1, "Keep the boundary obvious":** name the build stage and make
  the final copy explicit, so a reviewer can see what crosses into
  production.
- **Section 2, "Measure the result":** record the size before and after, run
  the same smoke test against both; a smaller image that doesn't start
  isn't an optimisation.
- **Tags:** Docker.

---

## 1. The real image

1. ⭐ Which project or image is this about? Language/runtime (Node, .NET, Go,
   Python…), base image, and what the app does (anonymised is fine).

   **Answer:**

2. Why did size matter here: pull time, registry cost, cold starts,
   security scan noise, an edge or IoT target?

   **Answer:**

3. Can the Dockerfile be published, or does it need a cleaned-up
   equivalent that still tells the truth?

   **Answer:**

---

## 2. Before and after

1. ⭐ Paste the "before" Dockerfile.

   **Answer:**

2. ⭐ Paste the "after" Dockerfile.

   **Answer:**

3. ⭐ Sizes before and after, and how you measured them (`docker images`,
   `docker history`, `dive`, compressed vs uncompressed in the registry).

   **Answer:**

4. Build time before and after, if it changed?

   **Answer:**

---

## 3. The smoke test

1. What's the smoke test you run against both images? Paste the command.

   **Answer:**

2. ⭐ Have you had a "smaller but broken" image? What was missing (CA
   certs, timezone data, a shared library, locale, a shell for an
   entrypoint script)?

   **Answer:**

3. How did you find out: CI, staging, or production?

   **Answer:**

---

## 4. The tricks you reject

1. Which "bag of flags" advice do you think is overrated or risky
   (`--squash`, chained `rm -rf` in one `RUN`, distroless everywhere,
   `scratch`, `upx`)?

   **Answer:**

2. Is there any trick you **do** keep beyond multi-stage builds?
   (`.dockerignore`, pinned base digests, cache mounts…)

   **Answer:**

3. Where do you land on distroless/scratch vs a slim base with a shell
   for debugging?

   **Answer:**

---

## 5. Explainability and review

1. What makes a Dockerfile reviewable to you? Stage names, comments,
   explicit `COPY --from` lines?

   **Answer:**

2. Have you reviewed someone else's "optimised" Dockerfile and been unable
   to tell what shipped? What happened?

   **Answer:**

---

## 6. Versions and platform

1. Docker / BuildKit versions, and Docker Desktop vs OrbStack vs Colima vs
   CI runner?

   **Answer:**

2. arm64, amd64, or multi-arch? Any surprises across architectures?

   **Answer:**

3. Anything destructive (pruning, cache clearing) a reader must be warned
   about?

   **Answer:**

---

## 7. The artefact and the article itself

1. Should the article ship a template Dockerfile, a sample repo, or just
   the before/after diff?

   **Answer:**

2. Headline and slug: keep "A container cleanup you can explain", or make
   it more searchable (e.g. name the runtime)?

   **Answer:**

3. Rough length, and any video walkthrough planned?

   **Answer:**

---

## 8. Lightning round (pull-quote fuel)

- The one-line rule for a final stage:
- The Docker tip you wish would die:
- Smallest image you've ever shipped, and was it worth it:

---

## Appendix — suggested article shape

1. **The problem:** the real image and why its size mattered (§1).
2. **Context:** why flag-collecting advice makes Dockerfiles unreadable.
3. **What I tried:** before Dockerfile and numbers (§2).
4. **The decision:** one build stage, an explicit runtime copy.
5. **Working implementation:** after Dockerfile, walked through stage by stage.
6. **Edges:** the smaller-but-broken story and platform surprises (§3, §6).
7. **Artefact/takeaway:** template or diff, measured results, takeaway line.
