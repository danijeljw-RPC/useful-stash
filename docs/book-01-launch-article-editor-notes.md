# Book 1 Launch Article — Editor's Notes

> Internal working document, not built by Astro. Companion to
> `src/content/articles/writing-a-book-about-ai-with-ai-without-the-bullshit.md`,
> drafted from `docs/book-01-launch-article-questionnaire.md`.

The article is `draft: true`. Flip it to `false` when you're happy.

## Decisions taken from your answers

- Title: "Writing a book about AI, with AI, without the bullshit" (§12.5).
- First person, prose, about 3,600 words. First draft was about 5,000;
  cut to this. Still above your 2,000–3,000 target; see "Trim
  candidates" below.
- Swearing kept as punctuation, not the whole sentence (§12.2).
- Primary CTA: launch list. Secondary: free preview, Chapters 1–3, no
  email needed (§11.1, §11.7). No price, no date, no hardcover (§11.3–11.6).
- Hero image: the purple Book 1 preview cover. Diagram: "Apparent
  Confidence Is Not Correctness" from Book 1, rendered from
  `how-to-use-ai.com/docs/02-book-01/diagrams/confidence-versus-correctness.mmd`.
- The sign-up link points to the Book 1 page's footer newsletter form:
  `https://how-to-use-ai.com/books/ai-for-normal-people/#footer-newsletter-title`.

## Judgement calls — check these

1. **Company names removed.** You asked to redact the company in §1.1, so
   Avanoa isn't named; you're "a CTO" and the investor story is about "a
   senior executive I work with". Your day-job employer is unnamed too, and
   so are its CTO and head of product (they'd be identifiable to colleagues).
2. **Thesis/PhD (resolved 2026-09-25).** The article uses §1.1: your thesis
   on ML and LLM tooling for structured legal documentation, and a PhD in
   Computer Science as a separate thing. The PhD topic isn't described.
   Don't mine §4.5 for published copy.
3. **Softened for legal risk, but the point stays:**
   - "The only AI lab lying is OpenAI" / Sam Altman is now "start with the
     companies and executives with the most money riding on it". An
     accusation of lying about a named company is a factual claim, not an
     opinion. If you want OpenAI named, word it as your opinion about
     their public statements.
   - The Diary of a CEO episode and Base44 aren't named, and the YouTube
     ad anecdote is compressed to one line. The critique of
     that genre and that ad stays in. Both are fair game under your §12.6
     rule if you want them back.
   - The jobs rant no longer names countries or "native-English-speaking"
     quality comparisons. It reads as xenophobic out of context and
     distracts from your actual point (management using "AI" as cover).
4. **Left out on purpose:** "jealous cunts" (§4.4), the Pieter Levels
   dig (§5.6), the "stupidest question" bit (§5.3), "not for anyone who
   thinks they know more than me" (§2.3), and the thesis deep-dive (§4.5).
   The last one reads as a different voice and makes contested technical
   claims that Book 1 deliberately avoids.
5. **Canonical URL is `null`.** how-to-use-ai.com is live, but this
   article has no page of its own there yet (e.g.
   `https://how-to-use-ai.com/blog/writing-a-book-about-ai-with-ai-without-the-bullshit/`).
   Once that copy is published, set `seo.canonical` to its URL.
6. **LinkedIn links** (Alexander Braun, Jean Lee): kept. DJ will check them
   before going live.
7. **Johnny's "Haven't you already written a book anyway?"** is in (the lost-ISBN line was cut)
   because you wrote it. If readers will ask "what first book?", add a
   line or cut it.

## Trim candidates (to get under ~3,000 words)

- "Why a book": cut the Frieren/Serie paragraph (~70 words).
- "The two big misunderstandings": cut the "stuck in a loop" paragraph
  (~70 words).
- "Why a PhD is writing the beginner book first": cut the Chapter 11
  paragraph (~110 words). The eager-intern bit stands on its own.
- "Writing a book about AI, with AI": fold the research/editing/production
  paragraphs into one (~150 words saved).
- "The scary bit": cut the "if nobody buys it" paragraph (~60 words).
- "The five-book on-ramp": cut the "technical people can skip" paragraph
  (~50 words).

Also removed in the trim: the "technical people think normal people use AI
like a precision tool" point (§2.2), the Book 3/Book 5 excitement (§7.5),
the "brutal feedback" answer (§8.4), and the software-versions view of
rewrites (§3.7). All good material; they didn't fit the length.

## Not done

- No repository screenshot. It needs a real capture from your screen.
- No how-to-use-ai.com version or LinkedIn adaptation yet. That repo has
  uncommitted changes of yours, so I didn't touch it.
