# "Ask AI for a decision, not a performance" — Author Questionnaire

> Internal working document. Not published or linked from the site, and
> excluded from the npm build because Astro builds `src/` and `public/`, not
> `docs/`. This file is tracked in Git, so treat it as internal repository
> material.
>
> Purpose: give DJ the raw material to turn the 190-word fixture
> `src/content/articles/2026-09-10-ask-ai-for-a-decision-not-a-performance.md`
> into a full article under a **new slug**. The fixture stays as a
> local-development sample.
>
> Answers don't need to be publish-ready. Bullet points, rants, swearing,
> half-sentences and "I don't know yet" are all fine. AI will not invent
> personal experience for this piece, so the examples have to come from you.

Answer as many or as few as you want. The questions marked ⭐ are the ones the
article can't really work without.

---

## 0. What's already on record (don't re-answer these)

From the fixture stub:

- **Thesis:** long prompts aren't automatically good prompts. The useful
  detail is the decision you need to make and the evidence the answer
  should use.
- **Takeaway:** give the model the decision, the constraints, and the
  evidence it can inspect; skip the theatrical role-play.
- **Section 1, "State what changes after the answer":** say what you will
  choose or do next instead of asking for "a comprehensive analysis". Add
  the constraints that would make a plausible answer wrong.
- **Example already in the stub:** "Compare these two backup approaches for
  a single Mac. I care about reliable restores and low maintenance more than
  the lowest monthly price."
- **Section 2, "Make uncertainty visible":** ask the tool to separate what it
  can verify from what it's inferring.
- **Tags:** AI, Workflow.
- **Related material:** *AI for Normal People* (Book 1, How To Use AI.com),
  plus the unused image `public/images/articles/confidence-versus-correctness.png`.

---

## 1. The moment that started it

1. ⭐ Describe a real time a vague or "performance" prompt gave you a
   confident, useless or wrong answer. What were you trying to decide?

   **Answer:**

2. What did the bad prompt look like, word for word or close to it?

   **Answer:**

3. What did it cost you: time, money, a wrong decision, embarrassment?

   **Answer:**

---

## 2. Before and after prompts

1. ⭐ Give one to three real before/after prompt pairs. For each, say what
   changed in the answer and why it was better.

   **Answer:**

2. Which part of the "after" prompt did the most work: the decision, the
   constraints, or the evidence?

   **Answer:**

3. Is there a prompt shape you now reuse almost every time? Paste it.

   **Answer:**

---

## 3. The Mac backup example

1. ⭐ Is the backup comparison a real decision you made? If so, which two
   approaches were they (e.g. Time Machine to a NAS vs a cloud service)?

   **Answer:**

2. What did the AI recommend, and what did you actually choose? Did you
   ever test a restore?

   **Answer:**

3. If it isn't real, do you want to keep it as an illustration or swap in
   a decision you really made?

   **Answer:**

---

## 4. Making uncertainty visible

1. ⭐ How exactly do you ask a model to separate verified from inferred?
   Give the wording you use.

   **Answer:**

2. Tell me about a time that separation caught an error before you acted
   on it.

   **Answer:**

3. How does this connect to the "confidence versus correctness" idea in
   Book 1? Should that image be the hero for this article?

   **Answer:**

---

## 5. The fashion you're pushing back on

1. What does "prompt ritual" or "theatrical role-play" mean to you? Give
   the worst example you've seen ("You are a world-class senior…").

   **Answer:**

2. Is role-play ever useful, in your view? Where's the line?

   **Answer:**

3. Who is this article for: Book 1 readers who are nervous of AI, working
   professionals, or developers?

   **Answer:**

---

## 6. Edge cases and warnings

1. When does this approach fail? (No evidence to give, a decision you
   can't share, a model that ignores constraints, etc.)

   **Answer:**

2. Anything a reader should **never** paste into an AI tool while making a
   decision like this?

   **Answer:**

---

## 7. The artefact and the article itself

1. Should the article end with a copyable prompt template, a checklist, or
   something else?

   **Answer:**

2. Headline and slug: keep "Ask AI for a decision, not a performance", or
   change it?

   **Answer:**

3. Should it link to the book's sign-up or to the earlier
   "Writing a book about AI, with AI" article?

   **Answer:**

4. Rough length, and any audio or video version planned?

   **Answer:**

---

## 8. Lightning round (pull-quote fuel)

- The one sentence you'd want a reader to remember:
- The prompt habit you'd ban if you could:
- What a good answer from AI feels like:

---

## Appendix — suggested article shape

1. **The problem:** the real bad-prompt story (§1).
2. **Context:** why long or performative prompts feel productive but aren't.
3. **What I tried:** before/after pairs (§2) and the backup decision (§3).
4. **The decision:** decision + constraints + evidence.
5. **Working implementation:** the reusable prompt shape (§2.3).
6. **Edges:** when it fails and what never to paste in (§6).
7. **Artefact/takeaway:** the template or checklist, plus the takeaway line.
