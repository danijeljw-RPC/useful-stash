# Useful Stash — Author Profile Questionnaire

> Internal working document. Not published, not linked from the site, and
> excluded from the npm build (Astro only builds `src/` and `public/`; this
> file is also explicitly gitignored so it never gets committed or bundled).
>
> Purpose: help a new or existing Useful Stash author flesh out a real,
> technically credible profile — for the `authors` content collection
> (`src/content/authors/*.md`, schema in `src/schemas/content.ts`), for
> author bio blocks, "about" pages, episode/video intros, and for giving
> readers a reason to trust and follow a specific person, not just the
> brand. Answers don't need to be publish-ready prose — bullet points and
> half-sentences are fine. Whoever writes the final copy (you, an editor, or
> an assistant) will tighten it later.

Fill in as much or as little as you're comfortable with. Skip anything that
doesn't apply. Come back and update this over time — this is meant to be a
living document, not a one-time form.

---

## 1. Identity & positioning

1. Name (as you want it to appear publicly), and any preferred short form
   or handle?
1. Current title/role, and where (company, or "independent")?
1. One-line description of what you do, in your own words — not a job
   title, the actual work (e.g. "I break production Kubernetes clusters on
   purpose so other people don't have to").
1. What's the one thing you want a stranger to know about you within five
   seconds of landing on your profile?
1. If Useful Stash readers only remember one fact about you, what should it
   be?
1. Pronouns (for bylines and any third-person copy about you).
1. Location / timezone (as specific or vague as you're comfortable with —
   city, region, "UTC+10", etc.) — useful for framing "when this was
   written" and for readers deciding if your production advice matches
   their environment (region-specific cloud pricing, compliance regimes,
   etc.).

## 2. Technical background & expertise

1. What are your 2–4 core technical specialties (the stuff you could talk
   about for an hour without notes)?
1. What's your current tech stack — languages, frameworks, cloud
   providers, tools you reach for daily?
1. How many years have you worked in this industry, and what's the shape
   of that path (self-taught, formal education, career change, etc.)?
1. What's a technical opinion you hold that isn't universally agreed on?
   (Strong, specific opinions make for better bridging content than
   neutral summaries.)
1. What's something you used to believe technically that you've since
   changed your mind about? What changed it?
1. What's a mistake, outage, or failure you've learned the most from, that
   you'd be willing to reference publicly (even obliquely)?
1. Any certifications, publications, talks, open source projects, or
   notable contributions worth linking to?
1. What do you deliberately *not* claim expertise in? (Scoping honestly
   builds more trust than implying you know everything.)

## 3. Content philosophy & voice

1. Why do you write/record at all — what's the actual motivation behind
   the time cost?
1. Who is the one reader/viewer you picture when you're writing or
   recording (a past version of yourself, a specific colleague archetype,
   etc.)?
1. What's your content's job: teach a skill, save someone time, change
   someone's mind, entertain, document your own learning — pick the
   primary one.
1. What tone do you naturally write/speak in — and is that different from
   the tone you *think* you should use? (Useful Stash wants the real one.)
1. Is there a running theme, recurring segment, or format signature people
   associate with your content?
1. What do you refuse to do in your content (sponsor content you don't
   believe in, clickbait titles, hype without substance, etc.)?
1. What's a topic you're actively building expertise in right now, that
   you plan to write/record about soon?

## 4. Bridging author and audience

1. What question do people message/comment/email you the most often?
1. What's a misconception your audience commonly has about your area of
   expertise that you'd like to correct?
1. What level of prior knowledge do you assume your audience has — and
   does that vary by series/format?
1. How do you want people to engage with you after reading/watching —
   reply, open an issue, DM, nothing at all?
1. What's the best piece of feedback (positive or critical) you've
   received from your audience, and how did it change what you make?
1. If a reader/viewer is stuck and your content didn't solve their
   problem, where should they go next (your socials, a community, a
   specific resource)?
1. Is there a call-to-action you want consistently attached to your
   profile/byline (newsletter, GitHub sponsor, Discord, etc.)?

## 5. YouTube / video-specific (skip if not applicable)

1. Channel name and URL (if different from your personal brand).
1. What's your on-camera format — talking head, screen share, edited
   tutorial, live coding, podcast-style?
1. Roughly how long is a typical video, and why that length?
1. What's your upload cadence, and is it public/consistent or ad hoc?
1. Do you script, outline, or improvise? How much editing happens after
   recording?
1. Is there a channel trailer, pinned video, or "start here" playlist you
   want linked from your Useful Stash profile?
1. Any recurring visual/audio signature (intro, sign-off phrase, thumbnail
   style) worth describing so it can be referenced in copy about you?

## 6. Blog / written-content-specific (skip if not applicable)

1. Where else do you publish (personal blog, dev.to, Substack, company
   blog)? Should Useful Stash cross-link or syndicate?
1. Roughly how long is a typical post, and what's your usual structure
   (problem → investigation → fix, tutorial steps, opinion essay, etc.)?
1. Do you include runnable code/examples as standard? Any repo you
   maintain as companion material?
1. How technical do your headlines get — do you optimize for search,
   clarity, or curiosity first?

## 7. Working style & behind-the-scenes

1. What does your actual research/writing/recording process look like,
   start to finish?
1. What tools do you use to make your content (editors, recording setup,
   diagramming tools, etc.) — worth a "how I make this" reference?
1. How do you fact-check or validate technical claims before publishing?
1. What's something about your production process that would surprise
   your audience?

## 8. Personal touches (optional, but builds the "human" bridge)

1. Outside of tech, what do you spend time on that you're happy to have
   associated with your public profile?
1. Is there a personal origin story for why you got into this field worth
   a sentence or two?
1. Anything you want explicitly *kept out* of your public profile (boundary-setting
   is useful information too — note it here so editors know not to ask).

## 9. Metadata for the author record

These map fairly directly to `src/content/authors/<slug>.md`
(`authorSchema` in `src/schemas/content.ts`) — answer these last once the
narrative sections above have given you material to draw from.

1. Preferred `slug` (URL-safe, e.g. `jane-doe`).
1. Short `role` line (one phrase, shown under your name).
1. Short `bio` (1–3 sentences, written in third person for byline use).
1. Avatar image (source file/URL) and descriptive `avatarAlt` text.
1. Personal/professional `website` URL.
1. Social links to include: GitHub, X, Bluesky, Mastodon, Twitch, YouTube,
   LinkedIn (leave blank any you don't want listed).
1. Any SEO preferences: canonical URL if your profile is mirrored
   elsewhere, and whether the profile should be `noindex`.

---

*Last updated: unset — update this line when you revise the questionnaire
itself, not when an author fills it out.*
