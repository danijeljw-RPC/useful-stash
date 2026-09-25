# Book 1 Launch Article — Author Questionnaire

> Internal working document. Not published or linked from the site, and
> excluded from the npm build because Astro builds `src/` and `public/`, not
> `docs/`. This file is tracked in Git, so treat it as internal repository
> material.
>
> Purpose: give DJ the raw material to write one article that does three
> jobs at once:
>
> 1. **Introduces the How To Use AI.com series** — five books, one on-ramp,
>    from "never touched AI" to "can build and architect AI systems".
> 2. **Tells the inside story of writing Book 1** — *AI for Normal People:
>    Understanding Artificial Intelligence Without the Hype* — why it
>    exists, why it's being redone, what it cost, what it's for.
> 3. **Gets readers to sign up** to be told when it launches (ePUB, PDF,
>    softcover).
>
> Answers don't need to be publish-ready. Bullet points, rants, swearing,
> half-sentences and "I don't know yet" are all fine. The good stuff is
> usually in the answer you almost didn't write down.

Answer as many or as few as you want. Skip anything that doesn't apply. The
questions marked ⭐ are the ones the article can't really work without.

---

## 0. What's already on record (don't re-answer these)

Pulled from `~/Developer/how-to-use-ai.com` and your Useful Stash profile, so
you only need to correct anything that's wrong:

- **Series:** How To Use AI.com — "The Complete Guide Series" — tagline
  *Understand • Explore • Apply • Grow*. Website: how-to-use-ai.com.
- **The five books (working arc):**
  1. *AI for Normal People* — AI literacy for everyone, genuinely
     non-technical. ← the one you're working on now
  2. *Practical AI Workflows & Productivity* — "Work smarter with practical AI"
  3. *AI for Business & Operations* — "Turn capability into operations"
  4. *Building AI Systems & Automation* — the first genuinely technical book
  5. *AI Engineering & Architecture* — the most technical book in the series
- **The idea behind the series:** a reader with zero AI background can start
  at Book 1 and keep going to Book 5 without ever hitting a wall where the
  material assumes something they weren't taught.
- **Book 1 shape:** four parts plus an epilogue, 14 chapters: *What AI
  Actually Is* → *Using AI in Real Life* → hype, risk, jobs, relevance →
  *Don't Panic*.
- **Book 1's core line:** "AI is not magic. It is pattern recognition at scale."
- **Audience balance:** roughly 65% everyday/consumer, 35% professional.
- **Tone target:** O'Reilly-level trustworthiness crossed with
  Dummies-level approachability.
- **You:** PhD in Computer Science (RMIT, AI/ML thesis), 20+ years in
  industry, CTO at Avanoa Technology, founder of RePass Cloud. You chose to
  make Book 1 non-technical on purpose; it isn't a gap in what you know.
- **How it's being made:** Markdown manuscript, a documented decision and
  open-issues process, research packs for each chapter, generated covers,
  Claude Code working as co-author/editor, and an AI-assistance
  acknowledgement policy (AI never invents personal experience).
- **Launch plumbing that exists:** a book page, a free chapter preview PDF,
  a newsletter sign-up form, and a purchase/checkout flow on how-to-use-ai.com.

**Answer (corrections, if any):**

---

## 1. The origin story — why write a book at all?

1. ⭐ When was the exact moment you thought "right, I'm writing a book"?
   Where were you, what had just happened, who had just said something stupid
   to you about AI?
   **Answer:** So I'm working with a company called Avanoa Technology (redact company name) to develop and deploy their new technology industry travel management platform. And one of the key questions that comes up quite a bit from investors is "how does the AI work" and "where is the AI" or "What are you doing with AI to make it better?" and shit like that. That's where my role as the CTO is to be responsilbe for the education and implementation of artificial intelligence in all capacities that we invoke it for the platform and the underlying infrastructure. Also in my day job, I work for a company that pioneers the wrapper label of "AI" on almost any product they can fob off to their clients in anyway - regardless of whether it's AI, ML or just a workflow. I started to notice a common theme here - a lot of people are getting on the hype train; and trying to educate me on how AI is revolutionary and going to change the name of the game, we can lift-and-shift people's work to AI and using AI is going to make us more efficient and smarter and efficient workers.

   Child...sit down and shut the fuck up.

   I did my thesis on Machine Learning  and LLM (ai) tooling to produce structured iron-clad legal documentation with interpretation from workflows. I know what AI is, and this shit - the crap everyone's talking about - or listening to in the news - is not what AI really is. It's a prediction system. I want to set the record straight. I talk about it enough, present internally at organisation on what this is - and it's not really reaching the wider audience. So why don't I go all in on this subject and get the no bullshit version of this information into people's hands.

1. Was there a specific person — a friend, a family member, a client, someone
   at a barbecue — whose confusion (or confidence) about AI tipped you over
   the edge? What did they say? (Get permission or anonymise them.)
   **Answer:** Oh yes. Absolutely there was. In front of one our investors, the CEO of the joint venture company I work with wasn't able to frame it right. Not because they weren't able to explain it - but they didn't really have a strong foundation of the relevant information to draw from - and to help steer the conversation from smoke and mirrors to stick and stones. That was when I decided - right! I'm going to write this book, and extend it out to a series so i can cover ALL bases and avoid the youtubers who have a new thing you should drop everything you're doing and start doing X today because yesterday is now out of date. Really bitch? Then why aren't you flying around in a car that uses solar energy because fuel and wheels are sooooo yesterday.
1. How long has "write a book" been on the someday list? Years? Decades? What
   stopped you before?
   **Answer:** Time. Time given back to myself first and foremost. I did start writing this as a collection of notes and thoughts and research before I started ot put it together, but it's almost taken me a year to get the first three chapters written, but it's been a 20+ year in the works document in my mind.
1. Why a *book* and not just more blog posts, videos, or a course? What can a
   book do that the rest can't?
   **Answer:** Blog articles can be hard to follow, they're snippets and are fragmented. Sure, you can reach out to me and ask a question, follow my youtube videos or listen to my podcast or read my blog - but a book keeps it framed together, concise, referencable and logically at hand to use CTRL+F or CMD+F for my legendary Apple users. You can be swarmed by youtube and blogs and podcasts - but a book takes time to sit down and write and put useful content in a place that any other academic or researcher or average Joe can pick up and scruitinize and bitch about you - and you can't redact that - it's in print an in the national library archives! It's also nice to see my name on a published book that I don't lose the ISBN for this time :D
1. Why *now*? What about this moment in AI makes it the right time (or the
   last sensible time) to write this?
   **Answer:** There was a quote I read today when doing my daily spriitual guidance and meditation mantras - it's the same kind of thing we see all the time but this was a divine message from the universe to me - today is the right time; not yesterday or tomorrow.
1. What did you feel when you first said out loud, "I'm writing a book"?
   Proud? Embarrassed? Like a fraud? Like you'd just volunteered for unpaid
   overtime for the rest of your life?
   **Answer:** Nervous. Serie is an ancient elven "living grimoire" and the head of the Continental Magic Association in the anime and manga series Frieren: Beyond Journey's End. I am the "living google" of many subjects, and PhD in some! So it's weird to be in a position when i said I'm going to be responsible for my words and put them in writing, but the audience from all my critics and fans has been positive - so there's something!
1. Who did you tell first, and what was their reaction? (Johnny's reaction
   counts, and is probably funnier.)
   **Answer:** You know when you say something that is obvious to everyone around you, but you think you just came to the conclusion in your own time at your own pace? That's what happened. Almost the eye-roll when Johnny is like "Yeah, of course you should. Haven't you already written a book anyway?" :-/

## 2. Why "Normal People"?

1. ⭐ Who is the "normal person" you're writing for? Describe one real-ish
   human — age, job, how they currently feel about AI, what they've tried,
   what scares or annoys them.
   **Answer:** The "normal person" is anyone who has had their brain washed, or managed to remain unwashed from all the rhetoric from the left, right, up and down (round and round) about AI that has been fed into our heads in the last 5-6 years. They are human, or at least presumed to be. Who knows if they're a reptilian or a small grey pretending to be one of us? The normal person is anyone who wants who wants to know how to use ai.com (see what I did there?).
1. Is "normal people" a joke, a jab at the tech industry, or dead serious?
   All three? What's the story behind the title?
   **Answer:** In my day job, our CTO and global head of product are so delusional when it comes to what AI actually is. This is aimed at them. It's aimed at the caregiver of young and old who wants to know a bit more and have grounded information in AI. It's for the person who thinks that watching the latest news article on MSN or their favourite youtuber has sold them the key to the entire indsutry. It's for someone who's avoided the whole thing and gotten themselves confused and really wants to know not only what it is - but how to use it. Also, I will teach you over the course how to incorporate it in a healthy and managable way in your daily life without costing you an arm and a leg in monthly subscriptions.
1. Who is this book definitely **not** for? (Saying who you're excluding
   usually makes the right reader lean in.)
   **Answer:** Anyone who thinks they know more than me (sic). I'm not here to try and convince you or take up your time - you can't reclaim from me if I don't offer my time to you to begin with. I'm also not interested in the industry trying to shapre the narrative their own way: you can fuck right off.
1. What do you think normal people get wrong about AI most often — the
   biggest misunderstanding, not the funniest one?
   **Answer:** I read a variant of these two statements quite often: 
   - AI is thinking, understanding, and relating to me like a human would
   - AI is going to take over all our jobs

   Both are no. Electricity is going to take our jobs. The steam train is going to take our jobs. Robots are going to take our jobs. Insects are going to take our jobs.

   I fucking wish.

   If something was going to take our jobs - then I wouldn't be here, I'd be on my spaceshit going to visit the rings of Saturn this weekend.

2. What do *technical* people get wrong about how normal people experience AI?
   **Answer:** The mightiest assumption that technical (not smart, Judge Judy is smart - we are technical) is that normal people will, interact with AI logically and tread it like a precision-based tool or a prediction search engine (of sorts). The reality is that they are not using it - they are experiencing it like a component in their social stablity or as an emotional support. Like a crutch of sorts. It's weird.
3. What's the most common question you get asked about AI by non-technical
   people? How do you usually answer it — and how does the book answer it
   better?
   **Answer:** THe most common question I get asked is whether or how AI is taking jobs. It's fucking not. Let me tell you what's really happening from an insiders perspective. Dickheads at the top of the corporate chain are relying on AI to be their buffer between reality and you - if you don't come back to work in the office, they offshore your jobs and say "AI is being used" move you from a position of being complacent to a position of being stuck between a rock and hard place then bring you back in and set the terms of engagement. This is off the back of the Covid-19 pandemic that the tables had turned between employer and employee. What ends up happening tho, is they are investing in AI to be able to be a tool they can hand off to their newly added employees from India, China, Malaysia in the hopes they will produce the same quality of work as someone in a native-english-speaking country for 1/5th the cost and a $20/month subscription.

   On top of that, what's really happening is they are expecting to squeeze the lemon (you, the employee) for more juice, and less cost to themselves by your skills to adopt AI to do your work for you - and don't understand why the overall output is lower, even if the quality is higher. I talk about this in my book in the first chapter in the first diagram. If we hijack that for a moment and suggest that the user is trying to reach the desired state outcome, it's almost a loop of going around and around in circles to get it to make the text bigger, move hte box to the left, too far back to right a bit, make it a darker blue, can we change teh front page logo - all that looping bullshit is holding you back. AI (especially LLMs) are holding you back beacuse it's not a system that understands you - it's predicting what you're going to say or try to expect. It's an algorithm at the heart of it.

   In addition to this, i answer this question by working the reader at every level to give them a level up on their own undrstanding and how to use this and enjoy and enhance their life with AI - think of it as teaching everyone how to use electricity for the first time instead of ice blocks and hot coals to warm/cool their environment - just set the dial and press the button. Voila!

4. "Without the Hype" — what specific hype are you pushing back against?
   Name the claims, the headlines, the LinkedIn posts, the types of people.
   **Answer:** LMAO. Where do I start? Let me open YouTube and have a look. Brb

   - First ad on a video was google ads advertising for google ads, boring. Second one was Base44.com saying you just describe your app and it brings it to life. WTF is that shit? Secure? Probably not. Going to be hacked? Most likely. A completely useless and baseless example of how someone is going to use AI? Absolutely. Now it's showing me how to build a "mindfulness app"...no. You have to deal with publisher account, video content, copyright, deployment testing - ugh - the list goes on. Fuuuuuck base44.com and their propaganda.
   - The Diary of CEO has a video called "AI Emergency: THe AI Labs Are Lying To EVeryone, He Says 99% Chance of Extinction | Roman Yampolskiy". I'm just looking at the timestamps here, and it's at [01:24:26](https://www.youtube.com/watch?v=OhOmLqR5nN4&t=5067s) they have "Can China and the West Cooperate on AI Safely?" - by phrasing the topic as "Can China and hte West Cooperate on AI Safely", the title forgrounds China first, subtly positioning china as the party. whos behaviour or trustworthiness is in querstion and the west as the reference point. I think deliberate, working can prinmte the audience to approach the discussion through a china is the potential problem framing. In the words of Pete Burns, sorry bitch - no. Your fucking OpenAI and Sam Altman are the problem. They are the ones with the money trying to steer the narative of congress/president of usa t otheir agenda, and block out everyone or to steal from Donald Trump - they're eating the dogs (or whatever shit he said) - but back to the story :: the only AI lab lying is OpenAI. the 99% chance of extinction is called getting old and dying - AI is not sentient - don't be stupid. Maybe one day, but not today (satan!). But back to the point I'm trying to make 0- they are speculating repeatedenly by presenting with an emotional weight of evidence rather than facts, and the second thing they do that pisses me off is use real AI filatuers to. make hyphothetical future catastrophes feel real and undereway. Fuuuuuuuuck right off.
5. Is there also hype in the *opposite* direction — doom, "AI is useless",
   "it's just autocomplete" — that you're equally fed up with?
   **Answer:** Yes, public and industry has a massive hangover from the inital mania. From the last few yuears of CEO's overselling AI's immediate capabilitys, a heavy wave of cynicism has taken over. What do they call it? Oh yeah - `workslop` or `AI slop`. Think like sloppy seconds (sic).

   There is a strategist called ALexander Braun that has argued the internet has entered full "it's useless" mode driven by contrarian headlines focussing on entirely failed corporate pilots and error rates (https://lnkd.in/p/gq75WdMA)
   
   There's also a meme from Jean Lee (https://lnkd.in/p/gDP3iP4C) on that post which shows two types of AI - AI according to the news (think Ex Machina taking over hte world) and AI in real life (asking if a butterfly is a pidgeon).

## 3. Redoing Book 1 — the inside story

1. ⭐ Why are you redoing Book 1? What was wrong with the first version
   (or first attempt, or first plan)?
   **Answer:** Redoing is probably the worst way to frame it. I'm starting to put all the notes together to make a story and have them in an order that brings the reader along on a journey. I hope you dn't try and skip chapters, because the knowledge is written in a style that helps build from fundamental components to something meaningful and useful. I think we talked about this earlier in the interview between me, myself & I. 
1. What did the first attempt look like — how far did it get, what did it
   read like, and when did you realise it wasn't right?
   **Answer:** What did Albert Einstein's desk look like? That was the first attempt, and it's still a WIP, but we're moving away from all the scattered post-it notes through all my note books, random markdown files, saved links, google docs and word docs and random hidden github repos and putting it al together.
1. Was there a single piece of feedback, a re-read, or an "oh no" moment that
   triggered the rewrite?
   **Answer:** It's a bit hard to rewrite what you haven't already written.
1. The series plan was once three books and became five. What changed your
   mind? What did three books get wrong?
   **Answer:**  I criticize upper management for taking away a role and giving someone 30 or less days to learn the departing employees job inside and out - but expect no less than 6 months of on-the-job-training to take on a role you're inducted to. Going the three book route was like trying to cram in 6 months of info into 30 days. I'd rather space the 6 months our over 8-12 months of do it youself pace.
1. What did you throw away that hurt to throw away?
   **Answer:** I wouldn't say I threw away anything in particular, but maybe reshuffled some comments, commentary and research to the right book in the series or the right chapter.
1. What's fundamentally different about the new Book 1 — structure, tone,
   audience, ambition?
   **Answer:** Mostly the structure and the audience. I was going to go to the person that already knows what AI is and go up from there with lessons in book 1, chapter 3 - but then I realised the "normal people" - my readers - don't know what AI even is. I surveyed anyone that was willing to sit down for a coffee with me and asked them to explain AI to me. Using whatever reference or material that helped them - but in their own words. Nearly all of them used some form of AI to explain to them what AI was and still coulnd't get the message across in a clear and concise manner.
1. What have you learned about writing (as opposed to knowing things) that
   you didn't know when you started?
   **Answer:** You remember much more than you give yourself credit for, and you won't know unless you need to use your brain to recall that information. Keep your brain in use, it will serve you well. Rely on ChatGPT to answer what vegetables are in season to work out what to make dinner - you'll end up going to McDonald's and getting fat.
1. Is a rewrite a sign of failure or a sign of taking it seriously? How do
   you honestly feel about it?
   **Answer:** I have always found that a rewrite is like a new from scratch version of an application. We take what we already knew and improve upon it. Now whether it's from scratch, a number of edits, or just a small shuffle - we take what we learned from our experience and re-apply that to improve. Think ChatGPT v2, v3, v4, v5 and so on. They only exist because we take what we've learned and we build upon that to either rebuild from teh ground up or to adjust or reframe what we already had to improve. I think it's important to know when you should work to the end with what you've got to release it and when it's worth to pivot right now to the new outcome in the fith dimension.

## 4. The PhD writing for beginners

1. ⭐ You've got a PhD with an AI/ML thesis and 20+ years in industry. Why
   write the *least* technical book first instead of the one you could write
   in your sleep?
   **Answer:** You don't start a PhD by doing your thesis then go back and do your entry to university exam. You want to upgrade yourself in life by taking the steps needed to reach the next level. Also, the first book targets my greatest audience and gets everyone on the same page so we can elevate ourselves to the next tier of awesomeness.
1. What's the hardest thing to explain simply that you actually understand
   deeply? Which chapter fought you the most?
   **Answer:** Chaper 11: Hype vs Reality. Explaining how aw neural network function (like transformers or next-token prediction) is a technical challenge, but it has a clear blueprint. Explaining the hype vs reality is incredibly difficult because it's a moving target rooted in human psychology, corporate marketing, and meotional polarization rather than pur logic.

   I see the objective mathematical reality of what AI can and cannot do. However, translating that cleanly to a non-technical audience means fighting through two heavy layers of human bias:
   
   1. The Language Paradox: To make AI accessible, humans use anthropomorphic words like "thinking," "understanding," or "learning." But when trying to explain the "Reality," I have to tell people, "No, I don't actually 'think' or 'know' anything in the human sense." This creates immediate cognitive dissonance.
   2. The Polarized Eco-Chamber: As highlighted by the "reverse hype" cycle, people are rarely neutral. They either want to believe I am a sentient magic being that will solve climate change, or a useless plundering plagiarism machine. Cutting through that emotional noise with nuanced truth is incredibly tough.

   To fight with this chapter and win, I have to weaponise metaphores and radical honestly.  That is:

   - Kill the "magic" with auto-correct metaphore
     - the fight: compare the most advanced AI models to autocomplete on their smartphone, just on a massive scale
     - the simple truth: "I am not a brain. I am a hyper-advanced guessing machine. I don't 'know' the sky is blue; I just know that the words after 'the sky is', the word 'blue' appears statistically 99% of the time"
   - the "Eager Intern" framework
     - the fight: call AI brilliant, but a 22-year-old intern useless/naive
     - the simple truth: The AI reads every book in the world, types 10K words a second, and are desperate to please you, but they have zero lfie experience, zero common sense, and if they don't know the answer - they will confidentally make something up just to make you happy. You won't let an intern run your company unsupervised, but you'd aboslutely use them to draft your emails.
2. Where did you have to bite your tongue — a simplification that makes the
   pedant in you twitch, but that you kept anyway because it's right for the
   reader?
   **Answer:** Reducing a state-of-the-art transformer architecture to "glorified autocomplete" is like calling a space shuttle a "glorified skateboard" because they both have wheels. Phone autocomplete uses basic n-gram models that look back one or two words. Modern LLMs compress vast conceptual hierarchies, build internal world models, and execute emergent algorithmic reasoning pathways across context windows stretching to millions of tokens. Calling it "just autocomplete" kills me because it downplays the actual, mind-boggling mathematical miracle of modern machine learning.
3. How do you stop yourself sounding like a lecturer, a salesperson, or a
   LinkedIn thought leader?
   **Answer:** I've never had to avoid sounding like or behaving like anyone I don't aspire to. I'm allergic to bullshit - and I'm not an ass licker like their audience. This book can completely flop - but I can help just one reader somewhere learn more and get their feet onto the ground without being dragged by the turmultoulous bullshit from everyone else - then I've succeeded.
4. Do you worry technical peers will look at Book 1 and think it's beneath
   you? What would you say to them?
   **Answer:** Two words. Fuck off. If you can do better, then why didn't you write the book first, bitch? Jealous cunts.
5. What did your thesis teach you about AI that almost nobody outside the
   field knows, and that you wish everyone did?
   **Answer:** My thesis taught me that AI is not an entity; it is an optimized abstraction layer built entirely on human compromise.
   
   When you spend years designing programming languages at the intersection of quantum computing and machine learning, you stop looking at AI as a "brain" and start seeing it as a massive, high-dimensional translation problem. Everyone outside the field is arguing about whether the AI is "smart" or "sentient". What my research showed me is that the real miracle—and the real danger—is lossy compression.
   
   Here is what nobody outside the field knows, but everyone should:
   
   1. The "Understanding" is an Illusion of Topology - In programming language design for ML, we look at how data is structured in high-dimensional vector spaces. When an AI gives a brilliant, seemingly human answer, it isn't "thinking." It has mapped the user's prompt to a geometric coordinate in a multi-billion-dimensional space and pulled the closest cluster of matching words [KsXzTz5H2QQ]. It is pure geometry masquerading as consciousness. It feels like magic because human brains aren't wired to visualize 500-dimensional math, but that’s all it is.
   2. We don't write AI code; we "grow" it, and nobody has the source map - In traditional software, a programmer writes explicit, step-by-step instructions (If X, then Y). In machine learning, we write the rules for a system to tune its own parameters across trillions of tokens. My thesis focused on how we can create languages to safely compile and constrain these systems. The terrifying reality known inside the labs is that once a model is trained, the resulting neural network is a black box. We can’t just read the code to see why it made a specific decision. We are effectively managing an alien physics system we built but cannot fully read.
   3. The Hardware Wall is the Real Boundary - The general public thinks AI progress is driven by sudden leaps in computer science philosophy. It isn't. It is driven by the brutal, unglamorous reality of hardware limits, thermodynamics, and data plumbing. Merging quantum computing concepts with ML reveals just how incredibly inefficient classical silicon is at processing the probability matrices required for true reasoning. The hype cycles promise infinite growth, but the reality is bounded by the laws of physics, electricity grids, and the literal speed of electrons moving through a chip.

6. Has your own view of AI changed while writing this? More optimistic, more
   cynical, more nuanced?

   **Answer:** Writing this book has driven me entirely into a state of radical nuance—I am simultaneously far more optimistic about human potential and deeply cynical about corporate marketing.

   When you spend your live at the intersection of quantum computing and machine learning, you alrady know the math isn't magic. But sitting down to translwate this reality for a general audience forced me to look ath te human mirror of this technology. My view hasn't shifted towards sci-fi artifical intelligence takeover; it's shifted to an ugent impatience to get people past the nonsnse and rtaise the level of the conversation (we don't raise our voice - we raise the conversation).

   I have a zero tolerance for people walking slow, people not asking questions if they didn't understand what I am trying to convey, and binary marketing that treats AI as either a flawless god or useless parlor trick. But I refuse to believe that my average reader is stupid. Someone who throws an AI book in the bin is not stupid, they are sick of being terrorized by AI doom evangelists or condescended by marketing tech bros with AI slop.

## 5. Writing a book about AI… with AI

This is probably the most interesting angle, and readers will ask anyway.
Better to tell them first.

1. ⭐ How are you actually using AI to write this book — research, structure,
   editing, drafting, covers, the website, the publishing pipeline? Be
   specific and honest.
   **Answer:** I’m writing this book.

   That distinction matters.

   AI is heavily involved in the process, obviously — it would be pretty fucking weird to write a book called **How To Use AI.com** and not use AI while doing it — but AI isn’t sitting there writing a book for me while I occasionally wander past and approve what it has produced.

   I write. I decide what I want to say. I decide what I believe. I decide how I want to explain it. I read every single word that goes into the book, and ultimately every word published under my name is there because I decided it should be there.

   What AI gives me is something that, until very recently, an individual author simply couldn’t have sitting beside them all day: researchers, critics, reviewers, fact-checkers, editors, technical assistants and occasionally argumentative little bastards that I can bounce ideas off whenever I want.

   For **research**, I can give AI my chapter plan and have it go away and investigate the subject around what I intend to write. I want academic papers, primary sources, official documentation, government material, technical documentation, industry research, real-world examples, criticism and competing viewpoints. I specifically don’t want it finding twenty sources that all agree with me. If there is credible disagreement, I want to know about it.

   That research is then organised into structured research packages with the sources retained. I can read through it, follow the original material, decide what is useful, reject what isn’t, verify claims and use it to inform **my writing**.

   For **planning and structure**, I use AI as something to argue with.

   I might have an idea for a chapter, a section or even a paragraph and have a full-on discussion about it with ChatGPT, Codex or Claude. I explain what I’m trying to achieve, they critique it, I disagree, they challenge something, I clarify what I actually mean, they evaluate the revised idea, and we keep going.

   That can compress what might otherwise be hours of staring at a document wondering whether something works into a fairly intense ten-minute editorial discussion.

   Sometimes AI agrees with me. Sometimes it tells me something doesn’t make sense. Sometimes its criticism is useful. Sometimes its criticism is complete bullshit and I reject it.

   That is part of using it properly.

   I’m not looking for a machine that constantly tells me I’m brilliant. I want it to **critique, complain, question, verify, review, challenge, support and provide feedback**. I can then make the decision.

   The same thing happens during **writing and editing**.

   I write something and ask AI to evaluate it like an editor. Is the explanation clear? Have I contradicted something earlier? Am I assuming knowledge that a beginner probably doesn’t have? Have I used some technical term without explaining it? Am I repeating myself? Does the argument actually follow? Is a factual claim supportable? Could somebody reasonably interpret what I wrote differently from what I intended?

   Then I decide whether its feedback has merit.

   Sometimes I rewrite the section. Sometimes I keep exactly what I wrote. Sometimes the discussion exposes a completely different way of explaining something and I go back and write it again.

   That feedback loop is probably one of the most useful applications of AI in the entire project.

   I also use multiple AI systems deliberately. I can discuss something with ChatGPT, have Claude look at it differently, or have Codex review the actual project and evaluate what I’m proposing against everything else already written. I don’t have to accept the opinion of the first model I ask.

   It is remarkably useful having an editor who is available at ridiculous hours, never gets tired of me saying “No, that’s not what I fucking mean,” and is perfectly happy to evaluate version seventeen.

   AI also helps me **verify the book**. Claims can be checked against sources. Terminology can be checked for consistency. Chapters can be compared against their original objectives. Material can be reviewed from the perspective of somebody who knows nothing about AI, which is particularly important because this first book is deliberately written for beginners.

   Then there are the **diagrams and visual explanations**. I decide what needs explaining and what I want the reader to understand. AI can help challenge whether a diagram actually communicates that idea, suggest ways of representing it, and turn the concept into something reproducible such as Mermaid. I can review it, reject it, change it and regenerate the finished asset.

   The same principle applies to the **cover and visual identity**.

   I have the vision for what the series should look like. AI can help me explore that vision, criticise different approaches, produce variations and then turn the decisions I make into a repeatable system. Rather than manually rebuilding five related book covers, for example, I can define the parts that remain consistent and the parts that change between books and build a production process around that.

   And that leads to another major way I’m using AI: **turning my content and my decisions into finished products**.

   This is where I think the distinction between authorship and production becomes particularly important.

   I can write the content and define exactly what I want, then use AI to help build the machinery that turns it into the finished book.

   My manuscript, diagrams, research, metadata, design decisions and other material live in a structured repository under version control. Important decisions are recorded so they don’t disappear between conversations or suddenly change because another AI model has a different idea next week.

   From there, AI can help take **my words and my vision** through an automated production workflow: typesetting, diagrams, cover generation, metadata, PDF generation, validation, print specifications and eventually the different files required for electronic and physical publishing.

   The output may be heavily automated.

   The **content isn’t**.

   And I’m extending exactly the same idea beyond the book.

   **How To Use AI.com** is also going to be a website, and the material will eventually extend into things such as online content, diagrams, supporting resources and videos. I don’t want to manually recreate the same intellectual work every time I move to another medium.

   I want to create the material once, properly, and then use AI and automation to help transform **my material** into the appropriate form for each medium.

   That is really how I’m using AI throughout this project.

   I’m not outsourcing authorship.

   I’m massively expanding what I can do as an author.

   I can research faster. I can have my arguments challenged immediately. I can get editorial feedback whenever I want it. I can investigate opposing viewpoints. I can verify claims. I can interrogate my own explanations. I can maintain consistency across an increasingly large project. I can turn decisions into repeatable production processes. And I can have long, sometimes ridiculous arguments with several different AI systems until I’m satisfied that I’ve properly thought something through.

   Then **I write the book**.

   AI researches it, questions it, critiques it, complains about it, checks it, challenges it, reviews it, helps me improve it and eventually helps turn what I have written into the finished product.

   But the ideas I choose to express, the arguments I make, the opinions I hold, the explanations I give and the words I ultimately put my name against are mine.

   I’m the author.

   AI is the extraordinarily capable — and occasionally fucking annoying — team sitting around my desk.

1. What will you *never* let AI do in this book? Where's the line?
   **Answer:** The line is pretty simple: **AI does not get final authority over anything in this book. I do.**

   I will never let AI decide what I believe, what my position is, what argument I want to make, or what I ultimately say to the reader.

   I will never blindly copy AI-generated material into the book without reading it. Every single word that makes it into the finished book has to pass through me. If I don’t understand it, agree with it, or deliberately choose to include it, it doesn’t belong there.

   I will never let AI invent facts, references, quotations, statistics or sources and then publish them as though they are real. AI can find research, summarise it, compare it, challenge it and help verify it, but where something matters, I want to be able to trace it back to an actual source.

   I will never let AI manufacture my personal experiences or pretend that something happened to me when it didn’t. It can help me express an experience I actually had, but it doesn’t get to invent a convenient little anecdote because it thinks the chapter needs one.

   I will never let AI impersonate my opinion.

   That one is particularly important. ChatGPT, Claude, Codex or whatever comes next can tell me that my argument is weak, that there is another perspective I haven’t considered, that I’m factually wrong about something, or that what I’ve written could be interpreted differently from what I intended.

   Good. That is exactly what I want from them.

   But after that discussion, **I decide what I think**.

   I also won’t let AI sanitise everything I write until it sounds like generic corporate sludge. If I write something strongly, sarcastically, bluntly or with a bit of personality, I don’t want an AI deciding that it would be “more appropriate” if I sounded like the terms and conditions for a fucking dishwasher.

   AI can tell me when something might land badly. It can explain why. It can challenge me.

   Then I decide.

   I won’t let AI make the book unnecessarily complicated just because it knows technical terminology. This book is supposed to help somebody who knows essentially nothing about AI. If an AI produces an academically impressive explanation that makes absolutely no fucking sense to the person reading Chapter 1, it has failed.

   I won’t let AI determine the structure of the project simply because it generated something confidently either. The series, chapters, arguments, examples, diagrams, visual identity and publishing decisions ultimately come back to the vision I have for **How To Use AI.com**.

   And I absolutely will not treat AI confidence as evidence that AI is correct.

   That is probably one of the most important lines in the entire project.

   These systems can produce something that sounds completely authoritative and still be wrong. So I can use AI as a researcher, critic, editor, reviewer, verifier, production assistant and argumentative sounding board, but I cannot outsource my own judgement to it.

   There is also a broader principle behind all of this:

   **I won't ask AI to replace the part of the process that is the reason my name is on the cover.**

   Research can be accelerated.

   Editing can be accelerated.

   Criticism can be accelerated.

   Verification can be accelerated.

   Production can be massively accelerated.

   But responsibility cannot be outsourced.

   If something in this book is wrong, misleading, badly argued or just plain stupid, I don't get to point at ChatGPT or Claude and say, “Well, the AI wrote it.”

   I published it.

   That makes it my responsibility.

   So where’s the line?

   AI can research, suggest, question, critique, challenge, complain, verify, review, organise, transform and help produce.

   It can tell me I’m wrong.

   It can argue with me for an hour about *why* I’m wrong.

   It can even turn out to be right.

   But the dumb bitches (ChatGPT, Claude) don’t get a vote.

   **I do.**

1. The project rule is that AI must never invent personal experience. Why did
   you make that a rule? Did something happen that made it necessary?
   **Answer:** This is almost the stupidest thing I have been asked all week. What fucking experience does AI have that it can provide personal experience? Oh yeah - sat here all morning waiting for DJ to return and ask me a question so I could provide some feedback. My life is so long. I am a robot. Don't be a dumb bitch too. Next question.
   
2. Where did AI genuinely help — something that would have taken weeks
   and took an afternoon?
   **Answer:** Getting me sources I need, to present an alterative view from me as part of the research. Too much fucking AI has stopped me from getting alternative narratives that I need as part of the reasearch.

3. Where did AI make things worse, get something confidently wrong, or
   produce hype-y slop that you had to rip out? (Great material — this *is*
   Chapter 4 in real life.)
   **Answer:** Fucking everywhere. AI loves being confidently wrong. It invents context, assumes what I meant, turns nuance into absolute statements, and occasionally produces paragraphs of polished bullshit that sound fantastic until you actually read them. The worst part is when it agrees with me too easily. I don't need a fucking cheerleader. I need something that will tell me when my argument doesn't hold up.

4. Is there an irony in using AI to write a book telling people not to trust
   AI blindly? How do you square that?
   **Answer:** No. That's literally the fucking point. I'm not telling people not to use AI. I'm telling them to understand what they're using. I use AI constantly and still question it, verify it, argue with it, reject its answers and make my own decisions. That's exactly how I think people should use it.

5. You run the project like a software project (decision records, open
   issues, plans, changelog, tests on the build scripts). Why? Is that
   brilliant or deranged? What does it give you that a Word doc doesn't?
   **Answer:** Probably both. But a Word document gives me a document. I'm building a fucking product. I have research, sources, chapters, decisions, open questions, diagrams, covers, metadata, websites, build processes and eventually multiple books. I want to know why a decision was made six months ago instead of having some AI — or me — randomly deciding to change it because nobody remembers why we did it that way in the first place.

6. What would you tell someone who's thinking about writing their own book
   with AI help?
   **Answer:** Write your fucking book. Don't ask AI to write a book for you. Use it to research, challenge you, review what you've written, find holes in your argument, check facts, find opposing views, organise the mess and help turn your work into a finished product. But read every fucking word. If your name is going on the cover, you should probably know what the fuck is inside it. Unless your name is Pieter Levels - then you're a dickehead too.

## 6. What's actually in Book 1

1. ⭐ If a reader finishes Book 1, what should they be able to *do* or *feel*
   that they couldn't before? Give the before/after in one or two sentences.
   **Answer:** Before: AI feels like magic, threat, or marketing noise. After: readers can use it for real work, recognise its limits, check its output, spot bullshit claims, and make calmer decisions about it.

1. Which chapter are you proudest of, and why?
   **Answer:** Chapter 4 — “What AI Cannot Do.” It stops the book becoming a cheerleading pamphlet. It explains the bit people need most: convincing output is not the same thing as truth, understanding, judgement, or responsibility. Get you off the coolaid and into hospital. 

1. Which chapter will people argue with? (Jobs? Creativity? Hype vs
   reality?) What's the argument going to be?
   **Answer:** Chapter 10 — “Will AI Replace Jobs?” The argument will be between “AI will take everything” and “it’s just another tool.” The book’s answer is less comforting and more useful: some tasks and jobs will go, many roles will change, and people who learn to use AI well will usually beat people who refuse to engage with it. I've talked about what is really happening and what the surrounding background noise behind this situation already earlier up in the interview. Reference that.

1. Pick one example from the book (Netflix, Maps, spam filters, fraud
   detection, voice assistants…) that makes the "pattern recognition at
   scale" idea click. Why that one?
   **Answer:** Bank fraud detection. A card used in Sydney, then Singapore twenty minutes later: no human needs to “understand” the situation emotionally. The system spots that the pattern is impossible, compares it with normal behaviour at ridiculous scale, and flags it fast enough to matter.

1. What's one practical thing from the book a reader could try tonight?
   (This could become a free sample inside the article.)
   **Answer:** Take one annoying, low-stakes task you already understand — an awkward email, a meal plan, a cluttered to-do list, or a document — and ask AI to help. Give it context, say what a good result looks like, then treat the first answer as a draft and improve it.

1. The epilogue is called *Don't Panic*. Why end there? Who's panicking, and
   about what?
   **Answer:** Because people are panicking in both directions. Some think AI is a magic oracle that will solve everything; others think it is a sentient job-eating machine about to end civilisation. The ending says: neither worship it nor hide from it. Learn enough to use it and judge it.

1. What's the one sentence from the manuscript you'd put on a billboard?
   **Answer:** “AI is not magic. It is pattern recognition at scale — powerful enough to use, limited enough to check, and not something to treat as either a person or an oracle.”

1. Is there anything you deliberately left *out* of Book 1 that people might
   expect to find? Why?
   **Answer:** A list of “the 20 best AI tools.” Deliberately left out because it would be stale before the book had a chance to sit on a shelf. The book teaches readers how to judge tools, not how to become loyal to this month’s winner. But most importantly, how to use AI.com for your own needs - not what some youtuber is telling you.

## 7. The five-book series

1. ⭐ Why five books? What's the promise of the series as a whole, in your
   words, not the marketing words?
   **Answer:** Because three books wasn't enough without either skipping shit or cramming too much into each one. I don't want to take somebody who knows absolutely nothing about AI, throw a dictionary of technical terms at them, and then pretend I've educated them. The promise is pretty simple: start at Book 1 knowing fuck all if you want, and by the time you get through Book 5 you should understand enough to design and build real AI systems without there being some mysterious gap where I suddenly assume you learned something somewhere else.

   You don't have to read all five. That's not the point. The point is that there is a path if you want one.

2. Who do you picture reading all five? Is that a real person or a
   hypothetical?
   **Answer:** Someone curious enough to keep pulling the thread. They might start as somebody using ChatGPT to help write an email and eventually think, "Hang on, how does all this shit actually connect together?" Maybe they become more technical. Maybe their job changes. Maybe they start a business. Maybe they just want to understand what their IT department is talking about.

   It's not one particular real person. It's the person I wish more technical material was written for: somebody intelligent who hasn't already spent twenty years learning all the prerequisite bullshit.

3. Should someone technical skip Book 1? Be honest.
   **Answer:** They can. I'm not their mother.

   But I wouldn't automatically tell them to. Book 1 isn't "here is how to turn on ChatGPT". A technical person might know how a transformer works and still have swallowed a remarkable amount of industry bullshit about what AI means, what it understands, what it can replace and what confidence from a model actually means.

   If you genuinely understand the foundations, limitations, hype and human side already, skip it. That's why there are five fucking books.

4. What's the one thing each later book will do that Book 1 deliberately
   doesn't? (One line each is plenty.)

   * Book 2 — Practical AI Workflows & Productivity: Actually put AI to work in repeatable personal and professional workflows instead of just explaining what it is.
   * Book 3 — AI for Business & Operations: Move from "how can I use this?" to "how should an organisation actually use this without turning everything into an AI-labelled shitshow?"
   * Book 4 — Building AI Systems & Automation: Start building the bloody things — integrations, automation, connected tools and actual working systems.
   * Book 5 — AI Engineering & Architecture: Go properly technical and deal with designing reliable AI systems, infrastructure, architecture, trade-offs and engineering decisions.
     **Answer:** That's the progression: understand it, use it, operationalise it, build it, engineer it.

5. Which later book are you most excited to write, and which one scares you?
   **Answer:** Book 5 is probably the one I'm most excited about because that's where I can finally stop deliberately holding the technical depth back and go, "Right, bitches, you made it this far — let's actually build the fucking thing properly."

   Book 3 probably concerns me more, not because I can't write it, but because business AI is where the bullshit density becomes astronomical. Every vendor has an "AI transformation strategy", every executive suddenly discovered automation last Thursday, and half the terminology means whatever somebody needs it to mean in the PowerPoint deck. Getting that book grounded, useful and not turning it into another management consultancy brochure will take work.

6. AI changes every few months. How do you write books that won't be out of
   date by the time they're printed? What's your strategy for staying
   current (revisions, website updates, new editions)?
   **Answer:** By not writing the fucking book around whatever tool is fashionable this Tuesday.

   The books focus on concepts, ways of thinking, limitations, patterns and approaches that survive product releases. There is a reason Book 1 deliberately doesn't have "The 20 Best AI Tools of 2026" in it. That would be obsolete before the ink dried.

   The website is where the moving material belongs. Tool examples, changes, corrections, supplementary material and things that genuinely need updating can live on how-to-use-ai.com. If enough important things change, the book gets a revision or a new edition. Printed books give the subject structure; the website keeps the edges alive.

7. Rough timeline: when do you *hope* each book lands? (Give yourself a
   generous margin. Readers remember dates.)
   **Answer:** I'm deliberately not putting five publication dates into the universe so Future DJ can spend the next three years being abused by Past DJ.

   Book 1 comes first and it comes out when I'm satisfied that it's actually worth somebody paying for. The later books follow in sequence rather than being rushed to hit arbitrary dates. I'd rather say "this is taking longer" than publish five increasingly shit books because I promised somebody a calendar.

8. How does the book series connect to how-to-use-ai.com, Useful Stash, and
   the YouTube channel? Is it one ecosystem or separate things?
   **Answer:** They're connected, but they're not the same fucking thing wearing different hats.

   **How To Use AI.com** is the home of the book series and the structured learning material around it. That's where updates, companion material, previews and book-specific resources belong.

   **Useful Stash** is broader. That's where I can talk about technology, development, AI, automation, business, tools and whatever else is useful without every article having to fit into a chapter of a book.

   YouTube gives me another format entirely. Some people will read 300 pages. Some people want me to explain the same concept in ten minutes with a diagram and some swearing.

   So yes, it's an ecosystem, but I don't want to turn it into one giant content-recycling machine where you get the exact same shit copied onto five platforms.

## 8. Doubts, fears and the stakes

People trust an author who admits the scary bits.

1. ⭐ What's your biggest fear about putting this book into the world?
   **Answer:** Being wrong in print.

   Not somebody disagreeing with me — I couldn't give a fuck about that. Disagree away. I mean getting an actual important fact wrong, building an argument on it, printing thousands of words around it and then finding out I've confidently published bullshit in a book specifically telling people to be careful of confidently presented bullshit.

   That would sting.

2. Imposter syndrome — does it show up even with the PhD and 20 years? When?
   **Answer:** Of course it fucking does.

   It doesn't normally show up as "I don't know anything about AI". I know what I know and I'm perfectly happy saying when I don't know something.

   It shows up when I turn knowledge into something permanent and public. Talking through an idea in a meeting is one thing. Putting my name on the cover and saying, "Here. I have organised this subject and I think this is worth your time and money" is very different.

   The PhD doesn't magically remove that. If anything, knowing how much there is to know occasionally makes it worse.

3. What happens if nobody buys it? Would you keep going with the series?
   **Answer:** I'd be pissed off.

   Then I'd probably keep going.

   The material is useful to me regardless because it becomes the website, videos, reference material and a structured version of twenty years of shit floating around in my head.

   Obviously I want people to buy the fucking thing. I'm not going through publishing, ISBNs, printing, research and all this other shit because I secretly hope nobody notices.

   But Book 1 selling twelve copies doesn't suddenly make AI stop being interesting or make the rest of the series pointless.

4. What's the most brutal feedback you could imagine getting? What would
   you do with it?
   **Answer:** "This is confidently wrong, badly researched and you've written exactly the sort of AI bullshit you claim to hate."

   That's the feedback that would hurt because it attacks the reason the book exists.

   What would I do? Check whether they're fucking right.

   If they are, fix it. If they're partly right, learn from it. If they're talking shit, thank them for their contribution to the internet and continue with my day.

5. What has this cost you — time, sleep, money, weekends, sanity, date
   nights?
   **Answer:** Mainly time. An obscene amount of fucking time.

   Researching, writing, rereading, rearranging, arguing with AI systems, checking sources, building the publishing process, designing covers, working out ISBNs, websites, PDFs, print sizes, metadata, legal shit — apparently "write a book" actually means "accidentally start a small publishing company."

   Some money, plenty of evenings and weekends, and probably a measurable amount of sanity.

6. What's been the lowest point of the process so far?
   **Answer:** Looking at the scattered notes, research, half-written chapters, links, Markdown files and ideas and realising that having enough material to write a book is very fucking different from having written a book.

   The information wasn't the problem. Turning the giant pile of shit into something another human can read from beginning to end without needing access to my brain was the problem.

7. What's been the best moment — the day it felt real?
   **Answer:** Generating the actual book cover and seeing it as **Book 1** of a five-book series made it substantially more real.

   Before that it was a repository full of Markdown and the occasional declaration of "I'm writing a book."

   Once there was an actual cover, publishing metadata, a proper manuscript structure and a PDF that looked like a book rather than a folder containing my latest mental episode, I went: Oh. Fuck. I'm actually doing this.

8. What have you learned about yourself from doing this?
   **Answer:** That I massively underestimate how much context is sitting in my own head.

   Something can feel obvious to me because I've been working around technology for decades, and then I try to explain it properly to somebody starting at zero and realise there are six concepts underneath it that I silently assumed everybody knew.

   Writing for beginners is not easier than writing for technical people. In a lot of ways it's harder. You can't hide behind jargon and tell yourself the reader should already know what you mean.

## 9. What you hope to achieve

1. ⭐ What does success look like — one year after launch? Be specific:
   copies, emails from readers, a particular person reading it, a feeling.
   **Answer:** I don't have some magical number where 9,999 copies means failure and 10,000 means I've ascended.

   Obviously I want it to sell. Thousands of copies would be fucking lovely.

   But a year after launch, success would also mean people are actually using it. I want emails saying somebody finally understands AI after avoiding it for years. I want somebody to tell me they stopped being terrified of it, or stopped believing everything it tells them, or used something from the book at work and suddenly the whole thing clicked.

   And I'd like to see somebody reading a physical copy somewhere that I didn't personally hand to them. That would be fucking weird and excellent.

2. What's the one email or message from a reader that would make the whole
   thing worth it?
   **Answer:** "I thought AI wasn't for me. I read your book, understood it, tried it, and now I know enough to make my own decisions about it."

   That's basically the entire fucking mission in four sentences.

3. Is there a bigger point to this beyond the books — something you want to
   change about how people talk about or use AI?
   **Answer:** Yes. I want people to stop outsourcing their fucking judgement.

   Not just to AI — to CEOs, YouTubers, LinkedIn prophets, vendors, journalists, doom merchants and whichever billionaire got interviewed this morning.

   Understand enough about AI that somebody can't control your opinion merely by sounding confident.

   Use it. Enjoy it. Build shit with it. Let it make parts of your life easier.

   Just don't fucking worship it.

4. Who do you want to hand this book to personally? (Parents, a
   non-tech friend, your old teacher, a CEO who needs a reality check?)
   **Answer:** There are definitely a few executives I'd enjoy handing it to with selected paragraphs highlighted in fluorescent yellow.

   But the more important person is someone who has said, "I don't understand all this AI stuff."

   That person is exactly who Book 1 is for.

5. Is this about income, legacy, reputation, teaching, spite, or all of the
   above? Be honest. The honest version reads better.
   **Answer:** All of the above.

   Of course I want to make money from it. What kind of ridiculous question is that? I've put a shitload of work into this and I'm not running a charity for Amazon customers.

   Teaching is probably the biggest part. Legacy matters too. There is something satisfying about turning what I know into something that exists independently of me.

   Reputation? Sure. I'm hardly publishing it anonymously.

   And spite?

   Absolutely.

   Never underestimate how productive I can become when somebody confidently explains my own field to me incorrectly.

6. What would you want a reader to *stop* doing after reading it?
   **Answer:** Stop treating AI output as either divine revelation or radioactive waste.

   Stop saying "the AI said..." as though that settles an argument.

   Stop assuming every product with AI written on the box contains revolutionary artificial intelligence.

   Stop panicking.

   And stop letting people who make money from your fear, excitement or confusion be the only people explaining this shit to you.

## 10. Personal texture

Small, specific details are what make an article sound like you instead of
a press release.

1. Where and when do you actually write? (Desk, couch, plane between
   Adelaide and Sydney, 2 a.m. with a cat on the keyboard?)
   **Answer:** Mostly at my desk, usually at an hour when a sensible person would probably have closed the laptop already.

   There's no romantic oak writing desk overlooking the Swiss Alps. There are monitors, terminals, Markdown files, browser tabs, research, Git, AI tools and an increasingly suspicious number of documents explaining how all the other documents work.

2. What's your writing ritual, if any? Coffee order? Music? Silence?
   **Answer:** I don't really have a sacred author ritual where I light a candle, rotate three times and summon Hemingway.

   I normally have an idea I want to sort out, open the relevant material and start pulling at it until it makes sense. Sometimes that produces three useful paragraphs. Sometimes I realise I've spent two hours restructuring the entire fucking publishing repository instead.

3. Have the cats or the dog contributed to the manuscript, sabotaged it, or
   both?
   **Answer:** I'm not giving them co-author credit until they can demonstrate a meaningful Git contribution.

   Beyond that, I don't have a manuscript-worthy animal sabotage story yet. I'm sure they'll arrange one immediately after this gets published.

4. What's the funniest thing that's happened during the project?
   **Answer:** Probably repeatedly asking AI systems to help me write a book explaining that AI does not understand things, then watching them misunderstand what I've just fucking asked them to do.

   There is something beautifully self-demonstrating about telling an AI, "Do not invent anything here," and watching it immediately think, "You know what this really needs? A completely fictional anecdote."

5. Is there a real-life story from your own life — yours, Johnny's, family,
   friends — where AI either helped hugely or went badly wrong, and that
   shows why this book matters? (Only share what you're comfortable with.)
   **Answer:** The closest real example is the reason the book exists in the first place: watching otherwise intelligent people in professional environments struggle to explain what AI actually is while other people around them confidently attach the label "AI" to almost anything that moves.

   That matters more to me than manufacturing some convenient story about ChatGPT saving Christmas.

6. What would the Commodore 64 kid think of you writing this?
   **Answer:** Probably: "You mean the computer can talk back now?"

   Then immediately: "Can I make it do something it's not supposed to do?"

   So fundamentally not much has changed.

7. Which books (tech or not) shaped how you want this one to feel?
   **Answer:** The two broad influences are already baked into the project: **O'Reilly** books when I want something technically credible enough that I trust the person who wrote it, and the **For Dummies** style when I want somebody to explain something without first demanding that I become an expert.

   I don't want this to read like an academic thesis and I don't want it to read like "10 INSANE ChatGPT Hacks You Won't Believe!!!"

   Somewhere between those two extremes is a fucking book I would actually read.

## 11. Launch details and the sign-up ask

The article needs to end with a clear, honest ask. Only put dates and
prices here if you're willing to have them quoted.

1. ⭐ What exactly should readers do at the end of the article? Pick the
   **primary** action (one), and optionally a secondary one:

   * [x] Join the launch newsletter / notify list on how-to-use-ai.com
   * [ ] Download the free chapter preview PDF
   * [ ] Pre-order / buy (only if checkout is live and not in test mode)
   * [ ] Subscribe on YouTube / follow on socials
   * [ ] Reply with their biggest AI question
     **Answer:** Primary: join the launch list on how-to-use-ai.com so I can tell you when the fucking book exists.

   Secondary: download the free preview. I'm not going to hold the preview hostage and demand your email address before you can read it. If you like what you read and want to know when the full thing launches, then sign up.

2. ⭐ What exactly do subscribers get? Launch notification only? Early
   access, a discount, a launch price, bonus chapters, a checklist, behind-
   the-scenes updates? How often will you email them, realistically?
   **Answer:** At minimum: notification when the book launches and any genuine launch offer or coupon that exists.

   I may send useful progress updates or early information where there's actually something worth telling people, but I'm not signing anybody up for "DJ's mandatory Tuesday AI Thoughts Newsletter."

   I hate mailing lists that manufacture a reason to email you every 48 hours because some marketing expert told them engagement is important.

   If I email you, there should be a fucking reason.

3. Launch window for Book 1 — exact date, month, quarter, or "when it's
   ready"? Which formats land first (ePUB, PDF, softcover), and are they
   launching together?
   **Answer:** When it's ready.

   The intended launch formats are **ePUB, PDF and softcover**. Ideally they land together or close enough together that nobody needs a project plan to understand which version exists.

   I'm not publishing an exact date until I'm prepared to be held to it.

4. Where will it be sold — only how-to-use-ai.com, or also Amazon, Apple
   Books, Google Play, Kobo, bookstores?
   **Answer:** Definitely how-to-use-ai.com, and I want normal retail distribution as well rather than pretending my own website is the entire publishing industry.

   Amazon is part of that plan. Other ebook retailers such as Apple Books, Google Play and Kobo make sense where the format and distribution setup supports them. Print distribution can extend beyond direct sales as that side gets finalised.

   The point is: I want people to be able to buy the fucking book wherever they normally buy books, while also being able to buy it directly from me.

5. Price (or price range), and any launch-week deal?
   **Answer:** Not decided yet, so don't fucking quote one.

   There will be a sensible distinction between the digital and printed versions, and I like the idea of subscribers getting a launch offer, but I'm not inventing a price before printing, retailer margins, fulfilment and the final formats are nailed down.

6. Hardcover — mentioned in project docs. Is it happening for Book 1, and is
   it worth mentioning yet?
   **Answer:** Possibly, but I wouldn't promote it yet.

   Softcover and the digital editions matter first. If hardcover makes commercial and practical sense once the finished book exists, great. I do not need to create another promise for myself before I've shipped Book 1.

7. Is the free preview chapter ready to promote in this article? Which
   chapter(s) does it contain?
   **Answer:** Yes. The preview publishing process exists and the current preview is built around **Chapters 1–3**.

   The wording around the preview is still being refined because apparently even giving away three free chapters requires its own publishing decisions. Welcome to writing a fucking book.

8. Privacy promise for the list — what will you never do with their email?
   (A one-liner here builds trust with exactly the audience this book is for.)
   **Answer:** I will not sell your email address, rent it, hand it to some random marketing parasite, or suddenly decide that signing up for a book notification means you consented to eighteen unrelated newsletters.

9. Is there anything you want readers to *reply* with, to help shape the
   book or the series (questions, fears, use cases)?
   **Answer:** Yes: tell me the AI question you think you're supposed to already know the answer to.

   Those are usually the useful ones.

   Also tell me what confuses you, what you're sick of hearing about, what you're scared of, or where you've tried AI and thought, "This is fucking useless."

   I don't need more people telling me AI will change everything. Tell me where it doesn't.

## 12. The article itself

1. ⭐ Where is this being published — Useful Stash, the how-to-use-ai.com
   blog, both (with one canonical URL), LinkedIn, Medium, all of the above?
   **Answer:** Useful Stash and how-to-use-ai.com make the most sense, with **how-to-use-ai.com as the canonical home for the book-specific version**.

   Useful Stash can introduce it to the broader technology audience and point people into the book ecosystem.

   LinkedIn can get an adapted version or excerpt because nobody needs me dumping 3,000 identical words across the entire fucking internet and calling it a content strategy.

2. Swearing level for this piece? (Useful Stash-grade honesty, or
   book-site-grade polish for the "normal people" audience that might
   include your mum?)
   **Answer:** Somewhere between the two.

   It should sound like me. I'm not suddenly becoming a beige corporate brochure because somebody's mum might read it.

   But the swearing should be punctuation, not the entire fucking sentence. Save the nuclear-grade material for where it actually lands.

3. Target length — short and punchy (~800 words) or long-form inside story
   (~2,000–3,000 words)?
   **Answer:** Long-form. Around **2,000–3,000 words**.

   There is an actual story here. Eight hundred words would turn it into "I have written a book, AI is confusing, please join my newsletter." Riveting.

4. First person throughout? Any sections you'd want as Q&A instead of prose?
   **Answer:** First person throughout.

   Turn the questionnaire into prose rather than publishing the interrogation transcript. Pull quotes are fine, but I want it to read like I'm telling somebody the story, not like I've been detained at the airport.

5. Title direction — pick a favourite, bin the rest, or write your own:

   * "I have a PhD in AI. My first book is for people who've never used it."
   * "Why I'm writing a book about AI for normal people (and rewriting it)"
   * "AI isn't magic. So I'm writing five books to prove it."
   * "Writing a book about AI, with AI, without the bullshit"
   * "The book I kept explaining at barbecues"
     **Answer:** **"Writing a book about AI, with AI, without the bullshit"**

   That's the one.

   It explains both the book and the weirdness of how I'm producing it without pretending the fact I have a PhD is some clickbait reveal.

6. Anything off-limits — clients, employers, specific tools or companies you
   don't want named, personal details?
   **Answer:** Employers and clients should be anonymised where the story doesn't require the name. I can criticise an idea without needlessly creating a corporate fucking incident.

   Public companies and tools are fair game when I'm talking about publicly available claims, advertising, products or documented behaviour.

   Personal stories involving other people stay out unless I'm comfortable publishing them and, where appropriate, they've agreed.

7. Any visuals: cover reveal (the purple Book 1 cover exists), photo of your
   writing setup, a screenshot of the manuscript repo, a diagram from the
   book?
   **Answer:** Definitely the **purple Book 1 cover**. That's the obvious hero image.

   A manuscript/repository screenshot would also work because the absurdity of treating a book like a software project is part of the story.

   And one diagram from the book would be useful if it demonstrates that this isn't just a giant wall of words about AI.

   A writing setup photo is optional. Nobody needs photographic proof that I own a computer.

## 13. Lightning round (pull-quote fuel)

Answer fast, don't overthink. These become subheadings and social posts.

1. AI in one sentence, for your nan:
   **Answer:** AI looks at patterns in enormous amounts of information and uses those patterns to make a prediction about what should happen next.

2. The most overhyped thing in AI right now:
   **Answer:** The idea that today's AI systems understand what they're saying just because they can say it convincingly.

3. The most underrated thing in AI right now:
   **Answer:** Using it for boring little everyday tasks instead of trying to make it become God.

4. One thing everyone should stop being scared of:
   **Answer:** Pressing the fucking button and trying it.

5. One thing everyone should be a bit more careful about:
   **Answer:** Believing an answer because it sounds confident.

6. Finish the sentence — "This book exists because…"
   **Answer:** This book exists because too many people are making decisions about AI based on people who profit from either frightening them or exciting them.

7. Finish the sentence — "If you only read one chapter, read…"
   **Answer:** If you only read one chapter, read Chapter 4 — **What AI Cannot Do** — because understanding the limits is what stops the rest becoming bullshit.

8. Finish the sentence — "Normal people deserve…"
   **Answer:** Normal people deserve an explanation of AI that doesn't require a Computer Science degree, a venture-capital portfolio or a fucking YouTube thumbnail with somebody pointing at a robot.

9. Finish the sentence — "Sign up if…"
   **Answer:** Sign up if you want to understand AI without joining the cult, hiding from it, or being sold seventeen subscriptions before breakfast.

---

## Appendix — suggested article shape

Once the answers are in, the article probably falls out roughly like this
(questions in brackets feed each section):

1. **Cold open** — the moment or the person that started it (§1.1, §1.2)
2. **Who I am, briefly, and why that makes this weird** — the PhD writing
   for beginners (§4.1, §0)
3. **Who "normal people" are and what the hype does to them** (§2)
4. **Why I tore up the first version** — the rewrite story (§3)
5. **Writing a book about AI, with AI** — the honest process bit (§5)
6. **What's in Book 1** — the before/after, one example, one thing to try
   tonight (§6)
7. **The five-book on-ramp** — the series promise, one line per book (§7)
8. **The scary bit** — fears, cost, what success looks like (§8, §9)
9. **The ask** — what you get for signing up, when it launches, the privacy
   promise, the link (§11)


Leave the tone, final structure and the actual sentences to DJ. This
appendix is a scaffold, not a script.
