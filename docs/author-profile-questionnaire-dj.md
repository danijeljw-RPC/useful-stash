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
   **Answer:** DJ Wynyard or just "DJ"
1. Current title/role, and where (company, or "independent")?
   **Answer:** CTO Avanoa Technology and Founder of RePass Cloud
1. One-line description of what you do, in your own words — not a job
   title, the actual work (e.g. "I break production Kubernetes clusters on
   purpose so other people don't have to").
   **Answer:**
1. What's the one thing you want a stranger to know about you within five
   seconds of landing on your profile?
   **Answer:**
1. If Useful Stash readers only remember one fact about you, what should it
   be?
   **Answer:**
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

   **Answer:** DOTNET framework, database, automation

1. What's your current tech stack — languages, frameworks, cloud
   providers, tools you reach for daily?

   **Answer:** C#/dotnet, macOS, Docker, llama.cpp, Python3, Cloudflare, Vultr

1. How many years have you worked in this industry, and what's the shape
   of that path (self-taught, formal education, career change, etc.)?

   **Answer:** I have worked in this industry for over 20 years now and had a genuine interest in the field for over 28 years. Quite a long time and probably more years than some of the consumers of this blog and podcast series. I'm old(er). (sic.). I started years ago in my formative years being intersted in the Commodore64 and how the BASIC language worked to do things. I thought this is going to revolutionise the world and we got our first computer after many hours spent in Computer Studies after school in primary school with Windows 95. From there I dove right in, learning from friends, magazines, books at the library and even from the obscure friend who had an earlier version of a Linux headless OS he got from his dad at the national telecommunications provider back in the day - Telecom. Since then a lot of self-paced learning, on the job, attending TAFE and then RMIT to get my PhD in Computer Science and continuining on every opportunity from there. Whilst most people might go out snowboarding, running races, or raising families - I have been always working across low-level programming languages starting with C, graduating to C++ and then finally landing on C# with a lot of languages in between when the flavours of the wind blew something else into the stratosphere. I have worked in small business, large business, enterprise and govt, military with on-prem, cloud-hosted solutions, custom development and solutions - you know it or can name it - I've been there.

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

   **Answer:** It ran in DEV so it must work in PROD. How many times have we forgot to run the basic checks in DEV or UAT 

1. What's a mistake, outage, or failure you've learned the most from, that
   you'd be willing to reference publicly (even obliquely)?

   **Answer:**

1. Any certifications, publications, talks, open source projects, or
   notable contributions worth linking to?

   **Answer:** I have my PhD in Computer Science and few other certifications along the way, but nothing really relevant to come back to today and show off in front of anyone. I will have to go do some more work and update my CV.

1. What do you deliberately *not* claim expertise in? (Scoping honestly
   builds more trust than implying you know everything.)

   **Answer:** Database, Rust, Kubernetes, bash scripting (I am a legend in PowerShell tho!). Other stuff - not sure. Rust. As often as you'll see me working with and using Database, I am not the person you should be relying on for your Database help. Or Kubernetes. 

## 3. Content philosophy & voice

1. Why do you write/record at all — what's the actual motivation behind
   the time cost?

   **Answer:** Two things, being egged on by the people around me and being supported by the people that cross-paths with me in my professional life. I've heard it all too often that I should host my own training course, blog, or do youtube videos on any subject because I've got a natural way to explain it, patience and really enjoy helping people to get to the next level - even from the start. Having just moved to Adelaide, I have more time on my hands so I am starting this blog and podcast and I also have joined another podcast as a co-host. It's just the right time in my life and I'm comfortale with what I do and how to share that knowledge.

1. Who is the one reader/viewer you picture when you're writing or
   recording (a past version of yourself, a specific colleague archetype,
   etc.)?

   **Answer:** There's a youtuber I came across in recent months called Jack Roberts. I think I saw him on Instragram first and found him on YouTube. Probably a Gen Z'er or the generate before that. It's his style of presentation, informality, charisma and his overall style - like who wears a cap inside whilst doing a youtube podcast? He does. And I love that. It's the embodiement of how I've always presented and behaved throughout my career. I've always had a laid back attitude that upon closer inspection warrants my termination without much notice - but my charisma has always kept me sailing through. I'm not a stuffy old professional - I don't know why you need to be stuffy to be a professional - that attitude is expired and was expired over 26 years ago when I entered the corporate workforce. So yeah - I picture being comfortable within my own skin as who I really am like Jake ROberts. Go check out his youtube channel: [Jack Roberts](https://www.youtube.com/@Itssssss_Jack)

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

   **Answer:** Very laid back, almost how I talk is how I write when it's unhinged, sometimes I can write almost as fast as I speak which means you get all the unfiltered version of me. I don't like edits, and I don't like cuts. WYSIWYG, bitch (pink nails emoji)

1. Is there a running theme, recurring segment, or format signature people
   associate with your content?

   **Answer:**

1. What do you refuse to do in your content (sponsor content you don't
   believe in, clickbait titles, hype without substance, etc.)?

   **Answer:** I refuse to do bullshit that's going to be putting me in the front row to the audience. That's not what I"m about. I'm not Sam Altman who lies out his fucking arse and then can't answer even a basic question when it's put to him. If I don't know an answer - the integrity says _"Tell them, you don't know! And ask what is it?"_ Why? Because who are you to tell me what I am better than myself? <- Quote me on that. It's my personal quote.

   I'm not against sponsorship, but I don't sponsor something I don't believe in, and I won't sell you a lie (Linus Tech Tips). Also Linus Tech Tips is a dickhead. Just saying.

   I'm also completely against clickbait titles - that's weak. I love propaganda - but I don't sell propaganda. I can only sell from my personal experience to you - I can't speak on behalf of other people and I refuse to repeat the latest info without having tested it myself. I have critical thinking - a skill not very strong with people these days since the availability of ChatGPT (god).

1. What's a topic you're actively building expertise in right now, that
   you plan to write/record about soon?

   **Answer:** Funnily enough, LLM. I'm not going to jump from article to article about LLMs, or what they are and how to use them - I have a book that incorporates that you might want to read - [How To Use AI.com](https://how-to-use-ai.com/) - go check it out. But yes - LLMs in everyday use and how we can move away from the subscription model of big agencies to a more local model that is going to serve the purpose you need. I work for a company called Avanoa Technology and currently part of my role requires me to incorporate an LLM amongst other AI models into the infrastructure of a project we are building. More on that when we launch.

## 4. Bridging author and audience

1. What question do people message/comment/email you the most often?

   **Answer:** How do I do this in Git? Why would I use Docker? Can you show me how to xyz.

1. What's a misconception your audience commonly has about your area of
   expertise that you'd like to correct?

   **Answer:** I am not an expert in what I talk about - I just got on the bandwagon for each technology when they land, scruitinised it and kept up to date and kept trying to incorporate it into many test projects to get familiarity with it so I know how to help someone get their feet wet when they decide to use it later and come asking for help.

1. What level of prior knowledge do you assume your audience has — and
   does that vary by series/format?

   **Answer:** It really varies by what I'm talking about and what you're asking. I assume everyone is new, or an expert, and everything in between. There are some things you'll know better than me and want a second opinion, advice or feedback. It's all relative to the listener/reader really.

1. How do you want people to engage with you after reading/watching —
   reply, open an issue, DM, nothing at all?

   **Answer:** You can reply on YouTube videos, go to the blog site and drop me a direct line in our [Say hello.](https://usefulstash.com/contact/) page or ping me on Twitter. If you're going to reach me on Instagram, send me cat memes or videos people hurting themselves. I'm a total schardenfraude :D

1. What's the best piece of feedback (positive or critical) you've
   received from your audience, and how did it change what you make?

   **Answer:** I was doing a lecture on Docker once and why we should transition the code base to be built and developed in docker, and that will also translate directly into our deployment configuration too. The first thing that came back from the greater audiece was if I'm going to teach them tech they're asking about, and starting from scratch - why am I going so fast and why am I not explaining the fundamentals to help them grasp the concept. That clearly indeicated to me that because of my seniority in roles I've taken in industry people aren't alwasy willing to put their hand up and ask me to either slow down, ensure we understand a concept from teh ground up, or make adjustments for my delivery to the audience I'm targeting.

1. If a reader/viewer is stuck and your content didn't solve their
   problem, where should they go next (your socials, a community, a
   specific resource)?

   **Answer:** Go staight to our blog and go to the [Say hello.](https://usefulstash.com/contact/) page and ask a question. I respond to everything, or if this is on YouTube - leave a comment and I will try to get back to you - but it's much easier to drop me a line through the main site - they come to my inbox.

1. Is there a call-to-action you want consistently attached to your
   profile/byline (newsletter, GitHub sponsor, Discord, etc.)?

   **Answer:**

## 5. YouTube / video-specific (skip if not applicable)

1. Channel name and URL (if different from your personal brand).

   **Answer:** 
     - [+]USEFUL/STASH -> https://usefulstash.com
     - Instagram -> @usefulstash
     - Twitter -> @usefulstash
     - YouTube -> https://www.youtube.com/@usefulstash

1. What's your on-camera format — talking head, screen share, edited
   tutorial, live coding, podcast-style?

   **Answer:** I do a screenshare with my face in the corner, live coding, podcasting style, i also invite guests and we record a session to maybe discuss something, edited tutorial (if it's necessary to edit - I try to keep it running through, but like to skip gaps of silence or me getting lost on my desktop or the cat walks across teh camera)

1. Roughly how long is a typical video, and why that length?

   **Answer:** Depends, but usually between 30-60 mins.

1. What's your upload cadence, and is it public/consistent or ad hoc?

   **Answer:** My upload cadence is currently spontaneious, but I am working to getting to a weekly upload and also getting a backlog of things to be prepared at once to upload on a weekly or twice a week cycle to keep information flowing. I might gatekeep information for a while to ensure it's useful rather than trying to race ahead. Also i don't really focus on shitty news.

1. Do you script, outline, or improvise? How much editing happens after
   recording?

   **Answer:** I script my intro and outro so I don't lose track of what i'm trying to say, but I usually use an outline or improvise - mostly it's all from the top of my head. I like to keep an outline on hand to ensure i cover off all the topics and stay on track rather than going off in live tangents.

1. Is there a channel trailer, pinned video, or "start here" playlist you
   want linked from your Useful Stash profile?

   **Answer:** There will be, I just have to publish it. Make a placeholder, but comment it out for now so when it's ready i can upload it.

1. Any recurring visual/audio signature (intro, sign-off phrase, thumbnail
   style) worth describing so it can be referenced in copy about you?

   **Answer:** Refer to the pages here to work that out: https://github.com/danijeljw-RPC/useful-stash/tree/main/docs

## 6. Blog / written-content-specific (skip if not applicable)

1. Where else do you publish (personal blog, dev.to, Substack, company
   blog)? Should Useful Stash cross-link or syndicate?

   **Answer:** Useful Stash is it's own blog, I do have a company blog at https://repasscloud.com but I won't really cross-post to there, and I don't like having content republished - but it can be syndicated. The video blogs (youtube) will be published to spotify and audio places to be consumed too, i also have a RSS feed for the website, and separate for the video blogs.

1. Roughly how long is a typical post, and what's your usual structure
   (problem → investigation → fix, tutorial steps, opinion essay, etc.)?

   **Answer:** That pretty much sums it up.

1. Do you include runnable code/examples as standard? Any repo you
   maintain as companion material?

   **Answer:** Yes, all useful code will be available and linked to in the description or on our blog article related to the video or the blog article that's not tied to a video podcast.

1. How technical do your headlines get — do you optimize for search,
   clarity, or curiosity first?

   **Answer:** I try to get them to be SEO friendly and GEO friendly but don't try to curate them too much - I want the message of what we're discussing to be clear and ensure that information that is being conveyed is accurate and reaches the right audience.

## 7. Working style & behind-the-scenes

1. What does your actual research/writing/recording process look like,
   start to finish?

   **Answer:**

1. What tools do you use to make your content (editors, recording setup,
   diagramming tools, etc.) — worth a "how I make this" reference?

   **Answer:** I use Maono PD200W microphone, a maono box with buttons that my micrphone plugs into, a facecam 4K, vultr server with scripts to start up and run livekit, scripts to setup rooms and recording etc., obs if i'm doing local work, custom build scripts, ffmepg, docker, cloudflare pages, Astro node website, cloudflare R2, github.

1. How do you fact-check or validate technical claims before publishing?

   **Answer:** I research against articles posted, then try things out myself - I am a PhD - so i do a lot of critical thinking. Most of this is personal experience too.

1. What's something about your production process that would surprise
   your audience?

   **Answer:** I don't have a team - I do this on my own. Lots of reading, opinons, testing and more testing.

## 8. Personal touches (optional, but builds the "human" bridge)

1. Outside of tech, what do you spend time on that you're happy to have
   associated with your public profile?

   **Answer:** Married to Johnny my husband, we have 4 cats (2 boys, 1 girl, 1 spynx cat), big brown dog, lots of coffee, Pokemon Go, dinner, date nights, tv, going for walks (for real, we actually do that), travel around the world at least 3-4 weeks of the year (to play pokemon go in other countries too!), cooking at home, coding, developing new solutions.

1. Is there a personal origin story for why you got into this field worth
   a sentence or two?

   **Answer:** My mum said Do what you love, and it won't feel like work. But don't do it if it's going to exhaust you. So i started my Bachelor of Accounting and shifted to Computer Science in the first trimester of uni. Never looked back.

1. Anything you want explicitly *kept out* of your public profile (boundary-setting
   is useful information too — note it here so editors know not to ask).

   **Answer:** Not really.

## 9. Metadata for the author record

These map fairly directly to `src/content/authors/<slug>.md`
(`authorSchema` in `src/schemas/content.ts`) — answer these last once the
narrative sections above have given you material to draw from.

1. Preferred `slug` (URL-safe, e.g. `jane-doe`).

   **Answer:** `dj`

1. Short `role` line (one phrase, shown under your name).

   **Answer:** `God of Vortexa`

1. Short `bio` (1–3 sentences, written in third person for byline use).

   **Answer:**

1. Avatar image (source file/URL) and descriptive `avatarAlt` text.

   **Answer:** root of this repo, is a file i added my_avatar.png << that

1. Personal/professional `website` URL.

   **Answer:**
     - `https://repasscloud.com` (my company) RePass Cloud
     - Cinturon360 `https://cinturon360.com` (platform i am working on)

1. Social links to include: GitHub, X, Bluesky, Mastodon, Twitch, YouTube,
   LinkedIn (leave blank any you don't want listed).

   **Answer:**
     - GitHub > https://github.com/danijeljw
     - X/Twitter > danijeljw
     - LinkedIn > danijel.wynyard

1. Any SEO preferences: canonical URL if your profile is mirrored
   elsewhere, and whether the profile should be `noindex`.

   **Answer:** ?

---

*Last updated: unset — update this line when you revise the questionnaire
itself, not when an author fills it out.*
