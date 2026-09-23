# Useful Stash — Author Profile Questionnaire

> Internal working document. Not published or linked from the site, and
> excluded from the npm build because Astro builds `src/` and `public/`, not
> `docs/`. This file is tracked in Git, so treat its contents as internal
> repository material rather than private or unrecorded information.
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
   **Answer:** DJ Wynyard or just "DJ"
1. Current title/role, and where (company, or "independent")?
   **Answer:** CTO Avanoa Technology and Founder of RePass Cloud
1. One-line description of what you do, in your own words — not a job
   title, the actual work (e.g. "I break production Kubernetes clusters on
   purpose so other people don't have to").
   **Answer:** I build software, platforms and automation that make complicated things behave like useful things—and when they don't, I work out exactly why, fix them, and explain the lesson without pretending it was obvious.
1. What's the one thing you want a stranger to know about you within five
   seconds of landing on your profile?
   **Answer:** I am technical enough to go all the way down the rabbit hole, but practical enough to know that nobody came here to admire the rabbit hole. You came here because something is broken, confusing, slow, expensive or taking far too much of your life. Let's sort that out.
1. If Useful Stash readers only remember one fact about you, what should it
   be?
   **Answer:** I will tell you what actually worked, what didn't, why I chose it and where it might blow your foot off. I am not here to perform expertise at you. I am here to leave you with something useful enough to steal.
1. Pronouns (for bylines and any third-person copy about you).
   **Answer:** He/Him/God-Tier
1. Location / timezone (as specific or vague as you're comfortable with —
   city, region, "UTC+10", etc.) — useful for framing "when this was
   written" and for readers deciding if your production advice matches
   their environment (region-specific cloud pricing, compliance regimes,
   etc.).
   **Answer:** Adelaide, SA & Sydney, NSW (depends on time of year)

## 2. Technical background & expertise

1. What are your 2–4 core technical specialties (the stuff you could talk
   about for an hour without notes)?

   **Answer:** C# and modern .NET; software and platform architecture; automation and delivery; and practical AI, especially local LLMs and fitting them into real systems rather than PowerPoint presentations.

1. What's your current tech stack — languages, frameworks, cloud
   providers, tools you reach for daily?

   **Answer:** C# and .NET, macOS, Docker, Python 3, PowerShell, Bash when it behaves, Rust when I feel like arguing with a compiler, `llama.cpp`, Cloudflare, Vultr, GitHub and whatever small tool gets the actual job done.

1. How many years have you worked in this industry, and what's the shape
   of that path (self-taught, formal education, career change, etc.)?

   **Answer:** I have worked in the industry for more than 20 years and been obsessed with it for more than 28, which is probably longer than some Useful Stash readers have been alive. I'm old(er). Deal with it.

   It started with a Commodore 64 and the revelation that BASIC could make a machine do what I told it to do. Then came Computer Studies after school in primary school, our first Windows 95 PC, friends, magazines, library books and an obscure mate with an early headless Linux system his dad brought home from Telecom. There was no clean curriculum. I learned by pulling at threads until the whole jumper came apart.

   From there it was self-directed learning, learning on the job, TAFE and eventually a PhD in Computer Science from RMIT. I started close to the metal with C, graduated to C++, landed on C#, and used plenty of languages in between whenever the wind blew another one into the stratosphere.

   I have worked across small business, large enterprise, government and military environments; on-premises and cloud-hosted systems; custom development, platforms, infrastructure and automation. Name a kind of environment and there is a reasonable chance I've either worked in it, migrated it, fixed it, replaced it or been asked why it caught fire.

1. What's a technical opinion you hold that isn't universally agreed on?
   (Strong, specific opinions make for better bridging content than neutral summaries.)

   **Answer:** Rust is shit. I said it. I use Rust, and I'll continue using Rust, but I still think it's really shit.

   The problem is that what Rust was originally designed to solve and what people now seem to think Rust should be used for are becoming two very different things. Rust has some genuinely excellent ideas around ownership, borrowing, concurrency and preventing whole categories of memory errors before the program ever runs. I am not disputing that. What I dispute is the increasingly religious idea that because Rust prevents certain classes of bugs, Rust is therefore automatically the correct language for everything remotely close to systems programming.

   It isn't.

   Rust moves a considerable amount of complexity from runtime behaviour into the language, compiler and development process. Sometimes that's exactly what you want. Sometimes you've just exchanged one set of problems for another.

   The borrow checker is powerful, but anyone pretending it doesn't add cognitive overhead is lying to themselves. Lifetimes are powerful. Traits are powerful. Generics are powerful. `Send`, `Sync`, ownership, borrowing, pinning, interior mutability and async Rust are all powerful. Put enough of those things together and you've created code that is technically very clever while simultaneously becoming considerably harder for another human being to understand.

   And then we arrive at `unsafe`.

   Rust's memory-safety story is strongest when you're operating entirely inside safe Rust. The moment you're interfacing with hardware, operating systems, C libraries, raw pointers, FFI or sufficiently low-level abstractions, `unsafe` starts appearing. That's not some catastrophic flaw in Rust—it exists because systems programming sometimes genuinely requires operations the compiler cannot prove are safe.

   But it does mean we should stop talking about Rust as though merely choosing the language magically makes software safe.

   `unsafe` Rust is still Rust.

   Bad abstractions are still bad abstractions.

   Race conditions, deadlocks, logic bugs, integer problems, resource exhaustion, incorrect validation, bad cryptography, broken protocols and completely stupid architectural decisions do not disappear because the source file ends in `.rs`.

   Memory safety is one dimension of software correctness. An extremely important one, absolutely, but still one dimension.

   This is particularly why I roll my eyes whenever someone suggests rewriting existing C or C++ infrastructure in Rust simply because Rust is supposedly "safer".

   A rewrite is not free.

   You're throwing away decades of implementation experience, obscure bug fixes, hardware workarounds, performance tuning and operational knowledge embedded in an existing codebase. You're then reimplementing that behaviour in a new language, potentially with developers who understand Rust better than they understand the subsystem they're replacing.

   Congratulations. You've eliminated some potential memory bugs while simultaneously creating thousands of opportunities for entirely new bugs.

   That doesn't mean Rust should never enter kernels or other critical infrastructure. There are perfectly reasonable places where new components can be written in Rust and benefit enormously from its safety model. What I object to is the assumption that **C/C++ → Rust = automatic improvement**.

   It doesn't.

   Context matters.

   If you've got a mature C subsystem that works, is well tested, has known behaviour and is maintained by people who understand it, "let's rewrite it in Rust" needs a much better justification than "memory safety".

   New subsystem? Different conversation.

   New driver? Maybe.

   New CLI utility? Absolutely.

   Starting a new systems project where ownership semantics genuinely solve problems you expect to encounter? Rust becomes extremely attractive.

   Rewriting working software because Rust is fashionable? No.

   There's also something I don't particularly like philosophically about treating the language as a substitute for developer understanding.

   I want developers to understand memory.

   I want them to understand what allocation means, what a pointer actually is, what stack and heap allocation mean, what ownership means, what happens when something goes out of scope and why use-after-free is dangerous.

   Rust can enforce ownership rules incredibly effectively, but developers should understand **why those rules exist**, not simply learn how to satisfy the compiler.

   Otherwise we eventually produce developers who know that adding another clone, Arc, Mutex or lifetime annotation makes the angry compiler go away without really understanding what their program is doing.

   That's not fundamentally different from blindly accepting AI-generated code because the tests happen to pass.

   Tools should amplify understanding, not replace it.

   And before the Rust crowd gets too excited: Java is worse.

   Java has caused an astonishing amount of enterprise software to exist that requires seventeen abstractions, six factories, twelve interfaces and an application server simply to move a value from one side of the screen to another.

   Yes, I'm exaggerating.

   Slightly.

   I know exactly what people are going to say next: "You use C#. C# was Microsoft's answer to Java."

   Correct.

   I'm not pretending otherwise.

   C# absolutely carries Java DNA. Early C# in particular made that relationship extremely obvious. The difference is that modern C# and .NET evolved in directions I personally find substantially more practical.

   Properties, LINQ, async/await, pattern matching, records, spans, value types, nullable reference types, excellent generics, increasingly strong native compilation support and the general evolution of the .NET runtime have turned modern C# into a language that feels very different from the Java it originally competed against.

   That doesn't make C# perfect either. Nothing is.

   The .NET ecosystem has its own nonsense. Dependency injection gets abused. Enterprise developers create abstractions for abstractions. People build seventeen-layer "clean architectures" around applications that perform three database queries. ORMs encourage developers to forget SQL exists. And Microsoft's naming department apparently gets paid according to how many times they can rename the same technology.

   Every ecosystem has bullshit.

   That's really my broader objection to Rust evangelism: **there is no universally superior programming language.**

   Languages are tools.

   C gives you extraordinary control and almost no protection from yourself.

   C++ gives you extraordinary control plus approximately four hundred ways to accidentally summon a demon.

   Rust gives you strong compile-time guarantees in exchange for a stricter and substantially more complicated programming model.

   Java gives you portability, an enormous ecosystem and mature tooling, while occasionally making you feel like you're completing government paperwork.

   C# gives you one of the most productive general-purpose development environments available today, while still allowing you to build an architecture diagram containing more boxes than your actual application has users.

   Choose the tool that fits the problem.

   That's why, despite everything I've just said, I use Rust.

   Rust is excellent for self-contained command-line tools. You get good performance, native binaries, strong cross-platform support, a fantastic package manager in Cargo and no requirement for users to install a runtime before running the application. For something I'm building from scratch—particularly a CLI or lower-level utility—Rust can be an extremely good fit.

   Where I become considerably less enthusiastic is when somebody proposes converting an established project purely because Rust is currently considered the enlightened choice.

   If I'm already maintaining something successfully in C, C++, C# or another suitable language, I need an actual engineering reason to rewrite it.

   "Rust is memory safe" isn't enough.

   "Everyone is moving to Rust" definitely isn't enough.

   And "the compiler won't let you write bugs" is complete bullshit.

   The compiler won't let you write **some kinds of bugs**.

   You'll have to write the rest yourself.

1. What's something you used to believe technically that you've since
   changed your mind about? What changed it?

   **Answer:** I used to give far too much comfort to the phrase, "It ran in DEV." Lovely. Production does not give a shit.

   DEV rarely has the same data, traffic, permissions, network boundaries, regional behaviour, secrets, failure modes or humans doing inventive things at exactly the wrong moment. What changed my mind was repetition: watching perfectly respectable software cross an environment boundary and immediately discover a new and exciting way to fail.

   Now I care about the boring checks—clean builds, realistic configuration, migration paths, permissions, observability, rollback and an actual smoke test in the environment that matters. "It worked on my machine" is evidence about your machine, not a release strategy.

1. What's a mistake, outage, or failure you've learned the most from, that
   you'd be willing to reference publicly (even obliquely)?

   **Answer:** The mistake I've learned the most from is treating a successful deployment as proof that the system worked. The pipeline was green, the service started and everybody was ready to declare victory. Then reality arrived: configuration differed, an integration behaved differently, or the one path nobody exercised was the path a real user needed.

   I don't need to turn that into one heroic outage story because I have made versions of the same mistake more than once. The lesson is permanent: deployment is not validation, a backup is not a backup until you restore it, and a system is not healthy merely because its process is still running. Test the thing people actually depend on. Test how it fails. Then test that you can recover it without prayer.

1. Any certifications, publications, talks, open source projects, or
   notable contributions worth linking to?

   **Answer:** I have a PhD in Computer Science and collected a few certifications along the way. I am not going to arrange them behind me like a hostage video. Most certificates date faster than practical experience does, and if one becomes relevant to the subject I am discussing, I will name it properly. Otherwise I would rather show you the work.

1. What do you deliberately *not* claim expertise in? (Scoping honestly
   builds more trust than implying you know everything.)

   **Answer:** I work with databases; I am not a database specialist. I use Rust; I am not a Rust expert. I can operate Kubernetes; I am not the person you hire to rescue a deeply cursed cluster at 3 a.m. Bash and I maintain a functional working relationship, whereas I am a fucking legend in PowerShell.

   More importantly, I will tell you when I am outside my depth. Seniority does not turn every opinion into expertise, and using a tool regularly does not make me the final authority on it.

## 3. Content philosophy & voice

1. Why do you write/record at all — what's the actual motivation behind
   the time cost?

   **Answer:** Two things finally pushed me into it: the people around me kept telling me to start, and the people I've crossed paths with professionally kept telling me I could explain difficult things without making them feel stupid.

   I genuinely enjoy helping somebody get to the next level, including when their current level is "I have absolutely no idea what this button does." There is a particular satisfaction in watching the moment a technical idea stops looking like magic and starts looking like something they can use.

   Having moved to Adelaide, I have more room to make the blog, podcast and videos properly, and I have also joined another podcast as a co-host. More than anything, the timing feels right. I know what I know, I am comfortable saying what I don't know, and I am finally comfortable sharing both without trying to sound like a conference keynote generated by LinkedIn.

1. Who is the one reader/viewer you picture when you're writing or
   recording (a past version of yourself, a specific colleague archetype,
   etc.)?

   **Answer:** I picture the capable person who has been handed a real problem and is one unexplained acronym away from throwing the laptop through a window. They might be a beginner, an experienced developer entering unfamiliar territory, a technical manager who wants the truth without the theatre, or a past version of me trying to piece the answer together from five magazines and a library book.

   The presentation style I admire is informal, comfortable and human. I came across [Jack Roberts](https://www.youtube.com/@Itssssss_Jack) on Instagram and then YouTube, and loved the charisma and complete lack of stuffy-professional cosplay. Who wears a cap indoors while recording a YouTube podcast? He does. Good.

   That has always been closer to how I behave anyway: laid-back enough that closer inspection might once have warranted my termination, but capable enough—and apparently charismatic enough—to keep sailing through. Professional does not have to mean beige, humourless or dead behind the eyes. That attitude was expired when I entered the corporate workforce more than two decades ago.

1. What's your content's job: teach a skill, save someone time, change
   someone's mind, entertain, document your own learning — pick the
   primary one.

   **Answer:** Save someone time.

   That is the primary job. Teaching is part of it, documenting what I learn is part of it, and occasionally changing someone's mind will happen naturally, but if somebody lands on Useful Stash I want them to leave having avoided an hour, a day, or sometimes a week of fucking around figuring something out the hard way.

   There is already more than enough technical content on the internet that tells you what something is. I am much more interested in telling you why you would use it, where you would use it, when you absolutely should not use it, what broke when I tried it, and then giving you the actual thing that worked.

   I don't want to write an article about rsync because rsync exists.

   I want to write:

   > Here's the backup problem I had.  
   > Here's why I chose rsync.  
   > Here's the command.  
   > Here's what every important option does.  
   > Here's the bit that could delete all your shit if you get it wrong.  
   > Here's how I tested it.  
   > Copy this and move on with your life.

   That is Useful Stash.

   The same applies whether I'm talking about .NET, Bash, PowerShell, Rust, Docker, Cloudflare, GitHub Actions, AI, local LLMs, FFmpeg or whatever else I'm currently abusing to make a computer do something useful.

   The problem comes first. The technology is just the implementation.

   I also don't want content to disappear into the void five minutes after somebody consumes it. If I spend hours working something out, there should be something left behind: a script, a command, a configuration file, some source code, a working example, a checklist, a downloadable project, or at minimum a concise explanation that somebody can find six months later when they're stuck on exactly the same problem.

   That's why I like the idea of the site becoming a technical stash rather than simply a blog.

   Some articles might be substantial guides. Some might literally be:

   > Need to find every file larger than 1 GB?  
   > Here.  
   > `find . -type f -size +1G`

   Done.

   Useful does not have to mean complicated.

   I also don't particularly care whether the technology is new. In fact, I'm increasingly suspicious of content that exists purely because something is new. If a twenty-year-old command solves the problem better than this week's shiny framework, I'm going to show you the twenty-year-old command.

   I'm not interested in producing "17 INCREDIBLE AI TOOLS YOU NEED TO TRY" rubbish just because that's what happens to be getting clicks this month.

   I'd rather spend the time showing somebody how to run a model locally, what the context window actually means, why their machine is running out of memory, which quantisation makes sense, and what happens when they actually try to use the thing.

   There is also a selfish side to it: a lot of Useful Stash will inevitably document things I have worked out for myself.

   I've lost count of how many times I've solved something, moved on, and six months later thought:

   > Fuck. How did I do that again?

   So I write it down.

   The difference is that I want to write it down properly enough that somebody who wasn't sitting beside me while I figured it out can understand it as well.

   That means commands should say whether they're for macOS, Linux, Windows PowerShell or anywhere else that matters. Examples should say what they were tested against. Code should be small enough to understand. If something can destroy data, I should tell you before you run it. And if something stopped working because a vendor changed their API six months later, the article should say that too.

   Technical documentation rots incredibly quickly, and nothing pisses me off more than finding the perfect answer only to discover halfway through that it was written for a version of the software that ceased to exist four years ago.

   So the hierarchy is basically:

   **Save someone time first. Teach them enough that they understand what they're doing second. Leave behind something useful third.**

   If you happen to learn a new skill, reconsider some piece of technology, laugh at me fighting with a compiler, or discover a tool you didn't know existed along the way, even better.

   But the test for publishing something is still very simple:

   **Is this actually useful?**

   If the answer is no, I probably don't need to stash it.

1. What tone do you naturally write/speak in — and is that different from
   the tone you *think* you should use? (Useful Stash wants the real one.)

   **Answer:** Laid-back, direct, occasionally unhinged and very close to how I actually speak. When I hit a rhythm I can write almost as quickly as I talk, which means you get the unfiltered version: opinions, side comments, swearing, sharp turns and all.

   I don't want edits that bleach the personality out of the work or cuts that remove the sentence people will actually remember. Clean up the repetition. Fix the typo. Do not put a blazer on my voice.

   WYSIWYG, bitch. 💅

1. Is there a running theme, recurring segment, or format signature people
   associate with your content?

   **Answer:** Problem first. Technology second. Show the real thing working. Explain the dangerous bit before somebody copies it. Leave behind an artefact.

   The recurring pattern should feel like this:

   > Here's the problem.
   >
   > Here's the tempting bullshit.
   >
   > Here's what I actually tried.
   >
   > Here's what broke.
   >
   > Here's the thing that worked.
   >
   > Here—steal this.

   Whether the format is an article, a live build, an interview or a 45-minute fight with Docker, people should associate Useful Stash with practical honesty and something they can use after the tab closes.

1. What do you refuse to do in your content (sponsor content you don't
   believe in, clickbait titles, hype without substance, etc.)?

   **Answer:** I refuse to make bullshit that puts me in the front row while the audience gets nothing. This is not a vanity project where I perform intelligence and hope nobody asks a basic follow-up question. If I don't know the answer, integrity says: _"Tell them you don't know—and then ask, what is it?"_

   Who are you to tell me what I am better than myself? Quote me on that.

   I am not against sponsorship. I am against sponsoring something I do not believe in, hiding the commercial relationship, or selling you a lie. I will not pretend a product is good because somebody put money in an envelope. And yes, I have opinions about how Linus Tech Tips handles that sort of thing. You can probably guess them.

   I am also against clickbait. That's weak. I love propaganda as an object of study; I do not sell it. I can speak from my experience, show my evidence and tell you what I think. I cannot speak on behalf of everybody else, and I refuse to repeat the latest fashionable claim without testing it myself. Critical thinking did not become optional when ChatGPT arrived—if anything, we need much fucking more of it.

1. What's a topic you're actively building expertise in right now, that
   you plan to write/record about soon?

   **Answer:** Funnily enough: LLMs. Not another parade of "what is ChatGPT?" articles or seventeen breathless tools you apparently need before breakfast. I am interested in LLMs in everyday use: how they actually fit into work, what should stay deterministic, what can run locally, what hardware and quantisation really mean, and how we move away from renting every thought from a giant subscription platform.

   My work at Avanoa Technology includes incorporating an LLM and other AI models into the infrastructure of a platform we are building. I cannot publish the interesting parts of that yet; more when it launches. I also have a book at [How To Use AI.com](https://how-to-use-ai.com/) for people who want the broader foundation.

## 4. Bridging author and audience

1. What question do people message/comment/email you the most often?

   **Answer:** "How do I do this in Git?" "Why would I use Docker?" "Can you show me how to do _xyz_?" Usually the real question beneath all three is: "Can you explain this without assuming I already understand the thing I am asking you to explain?"

1. What's a misconception your audience commonly has about your area of
   expertise that you'd like to correct?

   **Answer:** People sometimes mistake confidence, experience and a strong opinion for a claim that I am the world's leading expert on whatever tool is in front of me. I am not.

   What I am unusually good at is getting onto a technology early, scrutinising it, putting it into test projects, breaking it, comparing it with the thing it claims to replace and staying familiar enough to help somebody else get their feet wet later. I can get you from "what the hell is this?" to a working mental model and a useful first implementation. If the next step needs a narrow specialist, I will say so—and I would rather do that than bluff you into a crater.

1. What level of prior knowledge do you assume your audience has — and
   does that vary by series/format?

   **Answer:** It varies by subject and format, but I try to make the entry point accessible without making the useful part painfully basic. I assume the audience contains a complete beginner, an experienced person entering unfamiliar territory and somebody who knows more than I do but wants a second opinion.

   That means I should explain the first principle, label the advanced detour and never confuse unexplained jargon with depth. You can skip the bit you know. The person beside you should not have to pretend they know it too.

1. How do you want people to engage with you after reading/watching —
   reply, open an issue, DM, nothing at all?

   **Answer:** Reply on YouTube, use the [Say hello](https://usefulstash.com/contact/) page, or ping me on X/Twitter. Tell me what worked, tell me what broke, or ask the question I failed to answer. I would much rather have a useful correction than polite silence.

   If you reach me on Instagram, cat memes and videos of people hurting themselves through entirely avoidable stupidity are also accepted. I am terrible. The word is _Schadenfreude_. I have it. :D

1. What's the best piece of feedback (positive or critical) you've
   received from your audience, and how did it change what you make?

   **Answer:** I once gave a Docker session about moving a codebase into containers so the development and build setup would translate cleanly into deployment. I thought I was explaining it from scratch. The audience's response was essentially: "If this is from scratch, why are you going so fast, and why haven't you explained the fundamentals?"

   Fair.

   It taught me that seniority distorts the room. People are not always willing to put their hand up and tell the most senior person to slow down, start again or explain the concept underneath the command. Silence does not mean everybody understands. Now I try to establish the mental model first, show the working thing second, and leave enough space for the question somebody thinks they should already know the answer to.

1. If a reader/viewer is stuck and your content didn't solve their
   problem, where should they go next (your socials, a community, a
   specific resource)?

   **Answer:** Go straight to the [Say hello](https://usefulstash.com/contact/) page and ask. Those messages reach my inbox, and I respond to everything I reasonably can. If the content is on YouTube, leave a comment there so the answer can help the next person too. If I got something wrong, bring evidence. I will not be offended by being corrected; I will be offended if we knowingly leave the wrong answer sitting there.

1. Is there a call-to-action you want consistently attached to your
   profile/byline (newsletter, GitHub sponsor, Discord, etc.)?

   **Answer:** Try the thing. Tell me where it breaks. Then stash the article, subscribe to the YouTube channel, or send the question that should become the next piece. I do not need a ceremonial "smash that like button" speech attached to every byline.

## 5. YouTube / video-specific (skip if not applicable)

1. Channel name and URL (if different from your personal brand).

   **Answer:**
     - `[+] USEFUL/STASH` — <https://usefulstash.com>
     - Instagram — `@usefulstash`
     - X/Twitter — `@usefulstash`
     - YouTube — <https://www.youtube.com/@usefulstash>

1. What's your on-camera format — talking head, screen share, edited
   tutorial, live coding, podcast-style?

   **Answer:** Usually a screen share with my face in the corner: live coding, practical demonstrations and podcast-style discussion. I also invite guests when a subject is better as a conversation than a lecture.

   I edit when editing serves the viewer. Dead air can go. Me getting lost on my own desktop can go. A cat walking across the camera is editorially significant and may stay. I do not want to manufacture a flawless performance out of a real technical process; seeing the mistake and the recovery is often the useful part.

1. Roughly how long is a typical video, and why that length?

   **Answer:** Usually 30–60 minutes. Long enough to explain the problem, build or test something real and show the result; short enough that we do not spend three hours admiring the installation process. A two-minute answer should still be two minutes. The format serves the problem, not an algorithmic stopwatch.

1. What's your upload cadence, and is it public/consistent or ad hoc?

   **Answer:** Currently spontaneous; the goal is a dependable weekly release, with enough finished work in reserve to move towards twice a week when that is sustainable. I would rather hold something until it is useful than race to publish a half-tested opinion because a topic is trending. I also do not care about filling the feed with shitty news. If an announcement does not change what somebody should understand or do, it probably does not need me adding noise to it.

1. Do you script, outline, or improvise? How much editing happens after
   recording?

   **Answer:** I script the intro and outro so the episode starts with a point and ends with one. The middle runs from an outline and is mostly improvised from experience. The outline stops me missing an essential step or disappearing into a live tangent about some unrelated tool that annoyed me in 2017. Editing removes the parts that waste the audience's time, not the parts that prove a human being was there.

1. Is there a channel trailer, pinned video, or "start here" playlist you
   want linked from your Useful Stash profile?

   **Answer:** There will be a channel trailer and a "start here" playlist once enough real work exists to make the recommendation meaningful. Keep the eventual link out of public profile copy until it is actually published. A dead placeholder is not a feature.

1. Any recurring visual/audio signature (intro, sign-off phrase, thumbnail
   style) worth describing so it can be referenced in copy about you?

   **Answer:** The signature is the Useful Stash system already defined in the repository's [`docs`](https://github.com/danijeljw-RPC/useful-stash/tree/main/docs): stark black and white, a sharp orange accent, bracketed tags, oversized plain-spoken headlines and visual proof where it matters—a command, a number, a before-and-after result.

   It should feel technical without looking like generic developer wallpaper. No glowing purple AI brain. No person pointing at a red circle with their mouth open. No visual bullshit. The recognisable pattern is `[+] USEFUL/STASH`, a clear problem and the useful result.

## 6. Blog / written-content-specific (skip if not applicable)

1. Where else do you publish (personal blog, dev.to, Substack, company
   blog)? Should Useful Stash cross-link or syndicate?

   **Answer:** Useful Stash is its own publication and the canonical home for this work. RePass Cloud has a company site at <https://repasscloud.com>, but I do not plan to duplicate full posts there. Cross-linking and properly attributed syndication are fine; uncontrolled republication is not.

   Video episodes will also be available through YouTube and appropriate podcast platforms. Useful Stash has a general site RSS feed plus separate podcast and videocast feeds so people can subscribe to the format they actually want instead of being force-fed everything.

1. Roughly how long is a typical post, and what's your usual structure
   (problem → investigation → fix, tutorial steps, opinion essay, etc.)?

   **Answer:** Length follows the job. A useful post might be a five-line command with one serious warning, a step-by-step tutorial, a problem → investigation → fix write-up, or a gloriously long opinion essay about why an industry fashion has lost its fucking mind.

   The default structure is: name the real problem, establish enough context, show what I tried, explain the decision, provide the working implementation, call out the destructive or surprising edge cases, and finish with the artefact or takeaway. No arbitrary word count. Stop when the reader can do the thing safely.

1. Do you include runnable code/examples as standard? Any repo you
   maintain as companion material?

   **Answer:** Yes. If code, configuration, a command, a diagram, a checklist or a downloadable project makes the piece more useful, it should be included or linked from the article and video description. The artefact is part of the content, not a bonus somebody has to beg for in the comments.

1. How technical do your headlines get — do you optimize for search,
   clarity, or curiosity first?

   **Answer:** Clarity first, search and answer-engine discoverability second, curiosity third. The headline should say what problem we are solving in language the right person would actually search for. I will optimise it enough to be found, but I will not torture it into keyword soup or pretend "This Changes EVERYTHING" when it changes one Dockerfile.

## 7. Working style & behind-the-scenes

1. What does your actual research/writing/recording process look like,
   start to finish?

   **Answer:** It normally starts with irritation. Something takes too long, fails in a stupid way, is badly documented, costs more than it should, or is being explained online by people who have clearly never tried it.

   I define the real problem first. Then I read the primary documentation, compare other people's approaches, build a small test and keep notes on every assumption, dead end and sharp edge. I want the clean path, but I also want to know why the obvious alternatives failed because that is usually the part that saves somebody else's afternoon.

   Once I can reproduce the result, I reduce it to the smallest example that still tells the truth. I rerun it cleanly, check versions and platform assumptions, verify any destructive step, and make sure the downloadable artefact matches the words. Then I write or record around the evidence.

   For video, I prepare the environment, write the opening and closing, keep an outline beside me and run the middle as honestly as possible. Afterwards I remove dead air and genuinely useless detours, produce the article and links, check the final media and publish. Then I inevitably notice one typo twelve seconds later.

1. What tools do you use to make your content (editors, recording setup,
   diagramming tools, etc.) — worth a "how I make this" reference?

   **Answer:** A Maono PD200W microphone through a Maono audio console with more buttons than strictly necessary, a 4K Facecam, OBS for local recording, and a Vultr server running scripted LiveKit rooms and recording workflows. Behind that: custom build scripts, FFmpeg, Docker, Astro, Cloudflare Workers and R2, GitHub, and whatever automation prevents me doing the same boring step twice.

   Yes, the production stack itself will eventually become Useful Stash content. If I built a ridiculous little system to make the show, we may as well get another article out of it.

1. How do you fact-check or validate technical claims before publishing?

   **Answer:** I start with primary documentation and source material where it exists, use good secondary sources to find the disagreements, and then try the thing myself. I record the versions, environment and constraints that matter. If a claim is measurable, I measure it. If a command can destroy data, I test it somewhere disposable. If I cannot verify something, I say that instead of upgrading a guess into a fact.

   The PhD taught me how to interrogate a claim; more than 20 years in technology taught me that production will interrogate it much less politely. Personal experience matters, but experience is evidence with a scope—not a universal law.

1. What's something about your production process that would surprise
   your audience?

   **Answer:** There is no content team hiding behind the logo. It is me: researching, testing, writing, recording, editing, building the site, operating the infrastructure, producing the artwork and discovering why the audio track is wrong at an hour nobody should be awake.

   The casual delivery sits on top of a lot of reading, strong opinions, testing and then more testing. "Laid-back" is the presentation style, not the quality-control process.

## 8. Personal touches (optional, but builds the "human" bridge)

1. Outside of tech, what do you spend time on that you're happy to have
   associated with your public profile?

   **Answer:** I am married to my husband, Johnny. Our household includes four cats—two boys, one girl and one Sphynx—and a big brown dog, so nobody is really in charge and every clean recording is an improbable victory.

   Outside work: lots of coffee, Pokémon GO, cooking at home, dinner and date nights, television, and going for walks—for real, we actually do that. We try to travel internationally for at least three or four weeks each year, which naturally includes playing Pokémon GO in other countries because apparently seeing the world was not enough of an objective. I also code and invent new solutions outside work, which suggests my understanding of "outside tech" may need professional review.

1. Is there a personal origin story for why you got into this field worth
   a sentence or two?

   **Answer:** My mum told me, "Do what you love and it won't feel like work—but don't do it if it is going to exhaust you." I began a Bachelor of Accounting, realised in the first trimester that I was on the wrong side of that advice, and moved into Computer Science. I never looked back. I have looked sideways at accounting software with suspicion ever since.

1. Anything you want explicitly *kept out* of your public profile (boundary-setting
   is useful information too — note it here so editors know not to ask).

   **Answer:** Nothing specific at the moment, but "public profile" does not mean the public owns every part of my life. Keep personal details relevant, do not turn Johnny or the animals into content props, and ask before expanding beyond anything I have already chosen to share here.

## 9. Metadata for the author record

These map fairly directly to `src/content/authors/<slug>.md`
(`authorSchema` in `src/schemas/content.ts`) — answer these last once the
narrative sections above have given you material to draw from.

1. Preferred `slug` (URL-safe, e.g. `jane-doe`).

   **Answer:** `dj`

1. Short `role` line (one phrase, shown under your name).

   **Answer:** `God of Vortexa`—deliberately ridiculous, entirely on-brand, and preferable to another bloodless line like "technology thought leader." If the surrounding context needs a descriptive alternative, use `CTO, founder and practical technologist`.

1. Short `bio` (1–3 sentences, written in third person for byline use).

   **Answer:** DJ Wynyard is a CTO, founder and practical technologist with more than 20 years in software, platforms and automation. He builds complicated systems, breaks fashionable ideas down to their useful parts, and explains what actually worked—with runnable examples, honest caveats and considerably less corporate bullshit.

1. Avatar image (source file/URL) and descriptive `avatarAlt` text.

   **Answer:** Source file: `/my_avatar.png` at the repository root. Use the alt text: `Portrait of DJ Wynyard`.

1. Personal/professional `website` URL.

   **Answer:**
     - Useful Stash — <https://usefulstash.com> (primary profile website)
     - RePass Cloud — <https://repasscloud.com> (my company)
     - Cinturon360 — <https://cinturon360.com> (a platform I am working on)

1. Social links to include: GitHub, X, Bluesky, Mastodon, Twitch, YouTube,
   LinkedIn (leave blank any you don't want listed).

   **Answer:**
     - GitHub — <https://github.com/danijeljw>
     - X/Twitter — `@danijeljw`
     - YouTube — <https://www.youtube.com/@usefulstash>
     - LinkedIn — `danijel.wynyard`
     - Bluesky, Mastodon and Twitch — leave blank unless I add verified profile URLs later

1. Any SEO preferences: canonical URL if your profile is mirrored
   elsewhere, and whether the profile should be `noindex`.

   **Answer:** Use `https://usefulstash.com/authors/dj/` as the canonical URL and keep `noindex: false`. Useful Stash is the authoritative home for this profile; do not point the canonical URL at RePass Cloud, LinkedIn or another social profile.

---

*Last updated: unset — update this line when you revise the questionnaire
itself, not when an author fills it out.*
