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

   **Answer:** Software architecture is a particularly good example of this. When you're building a product, there are dozens of decisions to make about infrastructure, frameworks, databases, security and deployment.

   You can ask AI to design the best possible architecture for an application, and it will happily produce something that looks incredibly sophisticated. It might recommend microservices, distributed caching, Kubernetes, message queues and several other technologies.

   Everything sounds reasonable until you realise that you're building an early-stage product with a handful of users, limited resources and one person responsible for maintaining most of it.

   The answer might be technically sound, but practically useless.

   The problem isn't necessarily that the AI got the technology wrong. It's that I hadn't adequately defined the decision I needed to make. I asked it to produce something impressive rather than something appropriate.

2. What did the bad prompt look like, word for word or close to it?

   **Answer:** A reconstructed example would be:

   > Design a scalable, secure, enterprise-grade architecture for a modern mobile and web application. Follow industry best practices and recommend the most appropriate technologies.

   It sounds like a perfectly reasonable prompt. The problem is that almost every important word in it is subjective.

   What does scalable mean? What does enterprise-grade mean? How many users are we expecting? Who is maintaining it? What is the budget? What infrastructure already exists?

   Without that information, the AI is filling in the blanks.

3. What did it cost you: time, money, a wrong decision, embarrassment?

   **Answer:** The biggest potential cost is time.

   Time spent researching technologies that aren't necessary, reviewing recommendations that don't fit the project, and having additional conversations to narrow down what should have been a relatively straightforward decision.

   There's also a maintenance cost if you actually implement those recommendations. Every unnecessary component becomes another thing to configure, monitor, secure, update and troubleshoot.

   AI can make unnecessary complexity look like progress.

---

## 2. Before and after prompts

1. ⭐ Give one to three real before/after prompt pairs. For each, say what
   changed in the answer and why it was better.

   **Answer:** These examples reflect the kinds of decisions I encounter in software development and product management.

   Example 1 — Infrastructure

   Before:
   > What is the best infrastructure architecture for my application?

   After:
   > I need to decide how to host an early-stage application consisting of a web application, API, PostgreSQL database, authentication service and supporting services.
   >
   > The infrastructure needs to be affordable, manageable by a small team and easy to expand later. Compare a single dedicated server running Docker Compose against multiple virtual machines.
   >
   > Recommend which approach is more appropriate at this stage, explain the trade-offs and identify what would justify moving to the alternative.

   The second prompt gives the AI an actual decision to work towards.

   Instead of producing an architecture diagram filled with fashionable technologies, it can evaluate two realistic options against the circumstances of the project.
   
   Example 2 — Reviewing software development work
   
   Before:
   > Review my project and tell me what needs improvement.

   After:
   > Review the repository, existing GitHub issues, implementation and release acceptance criteria.
   > 
   > Identify what remains incomplete before the Android application can be released. Exclude iOS-specific work for now.
   > 
   > Separate confirmed defects, untested functionality, release blockers and optional improvements. Reference the relevant files and issues. Do not assume that functionality is working simply because the code exists.
   > 
   
   The difference here is enormous.

   The first prompt invites an almost unlimited amount of commentary. The second produces something I can actually use to plan work and make a release decision.

   It also makes the distinction between something being implemented and something being verified.
   
   Example 3 — Troubleshooting an internet connection
   
   Before:
   > Why is YouTube slow on my internet connection?

   After:
   > The YouTube mobile application experiences consistent delays when loading content over my home internet connection. Enabling Cloudflare WARP appears to resolve the problem immediately.
   > 
   > I need to determine whether the issue relates to DNS, routing, IPv6, QUIC/HTTP/3 or something else.
   > 
   > Provide diagnostic tests that can distinguish between these possibilities. Explain what each result would establish and what it would not establish. Do not assume the cause before we have evidence.

   The first question encourages speculation. The second establishes an investigative process.

   The fact that a VPN resolves a problem is useful evidence, but it doesn't automatically establish why the problem exists.

   A good AI response should help me narrow down the possibilities rather than confidently announce a cause.

2. Which part of the "after" prompt did the most work: the decision, the
   constraints, or the evidence?

   **Answer:** It depends on the problem, but generally the decision comes first.

   If the AI doesn't understand what I'm trying to achieve, the constraints and evidence don't have a clear purpose.

   The decision establishes the destination. The constraints establish the boundaries. The evidence establishes what we actually know.

   All three work together.

3. Is there a prompt shape you now reuse almost every time? Paste it.

   **Answer:** I don't necessarily use identical wording every time, but the underlying structure is reasonably consistent.

   > This is what I'm trying to achieve.
   > 
   > This is the decision I need to make.
   > 
   > This is what I already know.
   > 
   > These are my constraints.
   > 
   > Review the available evidence and recommend an approach.
   > 
   > Explain why, identify any assumptions, and tell me what could change your recommendation.
   > 
   > If you don't have enough information to make a reliable recommendation, tell me what is missing.

   I don't need to tell the AI that it has 30 years of experience, an IQ of 180 or that it's the world's leading expert in whatever I'm asking about.

   I need it to understand the problem.

---

## 3. The Mac backup example

1. ⭐ Is the backup comparison a real decision you made? If so, which two
   approaches were they (e.g. Time Machine to a NAS vs a cloud service)?

   **Answer:** I would keep the Mac backup example as an illustration rather than present it as a personal experience.

   It's a good example because almost everyone understands the importance of backing up their files, even if they don't understand the underlying technology.

   Asking AI for the best backup solution is fundamentally different from asking which backup solution best suits your circumstances.

   Someone who travels regularly has different requirements from someone who works exclusively from home. Someone managing several terabytes of video has different requirements from someone primarily storing documents.

   There isn't necessarily a universally correct answer.

2. What did the AI recommend, and what did you actually choose? Did you
   ever test a restore?

   **Answer:** Rather than inventing a backup experience, I would use an actual infrastructure decision from Swoovr.

   During the development of Swoovr, I moved from experimenting with multiple virtual machines to running the UAT environment on a single server using Docker Compose.

   The environment included PostgreSQL, Keycloak, APIs, web applications and Caddy.

   The decision wasn't about which architecture was theoretically superior. It was about which architecture made sense for the current stage of the product.

   Something being capable of supporting a million users doesn't make it appropriate for a product that hasn't publicly launched.

   The single-server approach was selected for UAT. That doesn't mean it will remain the appropriate architecture indefinitely.

3. If it isn't real, do you want to keep it as an illustration or swap in
   a decision you really made?

   **Answer:** Keep both.

   The backup example makes the concept accessible to everyday readers, while the infrastructure example demonstrates how the same principle applies to more complex professional decisions.

---

## 4. Making uncertainty visible

1. ⭐ How exactly do you ask a model to separate verified from inferred?
   Give the wording you use.

   **Answer:** I would use something along these lines:

   > Separate your response into:
   > - What you can verify from the available evidence.
   > - What you are inferring from that evidence.
   > - What assumptions you are making.
   > - What remains unknown.
   > - What additional information could change your recommendation.
   > Do not present assumptions or inferences as established facts.

   Another useful instruction when working with code is:

   > Do not tell me that something works simply because you can see an implementation. Distinguish between implemented, tested and independently verified functionality.

   That distinction is particularly important when using AI agents that can inspect repositories, execute commands and modify files.

   Reading code is not the same as testing it.

2. Tell me about a time that separation caught an error before you acted
   on it.

   **Answer:** A relevant example is a recent issue I experienced with my home internet connection.

   The YouTube and YouTube Music mobile applications were consistently taking around ten seconds to begin loading content. Other internet services appeared to work normally. The applications also worked normally on mobile data and other Wi-Fi networks.

   Enabling Cloudflare WARP on the affected connection immediately resolved the problem.

   It would have been very easy for AI to confidently conclude that this was a DNS problem, an IPv6 problem or an issue with QUIC.

   But the evidence didn't establish any of those things individually.

   What we knew was that changing the network path through WARP changed the behaviour. My internet provider's diagnostics also reported a healthy broadband connection.

   The correct next step was to investigate the differences between those network paths rather than immediately start changing settings based on an unverified diagnosis.

   This illustrates why separating evidence from inference matters. It doesn't establish that AI caught a specific error, but it demonstrates how premature conclusions can be avoided.

3. How does this connect to the "confidence versus correctness" idea in
   Book 1? Should that image be the hero for this article?

   **Answer:** One of the most important things people need to understand about generative AI is that confidence and correctness are not the same thing.

   AI can produce a beautifully structured, technically detailed and entirely incorrect answer.

   It doesn't necessarily hesitate when it gets something wrong. It can explain an incorrect conclusion just as convincingly as a correct one.

   Humans tend to associate confidence, professional language and detailed explanations with competence. Generative AI can reproduce all three without necessarily having the evidence to support its conclusions.

   This is why I encourage people to evaluate the substance of an answer rather than its presentation.

   The confidence-versus-correctness image would make an appropriate hero image for this article because it reinforces that distinction.

---

## 5. The fashion you're pushing back on

1. What does "prompt ritual" or "theatrical role-play" mean to you? Give
   the worst example you've seen ("You are a world-class senior…").

   **Answer:**  There is an entire culture developing around the idea that you need to speak to AI in some elaborate, highly structured way to get useful results.

   You see prompts like:

   > You are a world-class software architect with 30 years of experience, an exceptional IQ and an unparalleled understanding of modern technology. You have worked for the world's largest technology companies and are recognised internationally as an expert in your field. Your mission is to deliver the most comprehensive, innovative and revolutionary solution possible.

   What has any of that actually told the AI about the problem?

   Nothing particularly useful.

   You've spent an entire paragraph establishing fictional credentials instead of explaining what you need.

   Telling an AI that it has 30 years of experience doesn't give it 30 years of experience.

   Telling it that it's an expert doesn't give it additional access to information, evidence or professional qualifications.

   I would rather spend those words explaining the problem, the circumstances and what I need to achieve.

2. Is role-play ever useful, in your view? Where's the line?

   **Answer:** Absolutely. There are legitimate reasons to assign a role to an AI.

   You might ask it to review a document from the perspective of a customer, challenge a business proposal from the perspective of an investor, or simulate an interview.

   Those roles establish a useful perspective.

   Similarly, asking AI to explain something to a beginner rather than an experienced software engineer helps establish the appropriate level of detail.

   The distinction is whether the role serves a functional purpose.

   "Review this from the perspective of a security engineer and identify potential vulnerabilities" is useful.

   "You are the greatest security engineer who has ever lived" is not particularly useful.

   A role can change the perspective of an answer. It cannot manufacture expertise, evidence or authority.

3. Who is this article for: Book 1 readers who are nervous of AI, working
   professionals, or developers?

   **Answer:** Anyone who uses AI to help make decisions.

   That includes people comparing household purchases, small business owners evaluating software, professionals reviewing documents, and developers making technical decisions.

   I don't want people to walk away from this article thinking they need to become prompt engineers.

   Most people already know how to explain a problem to another person. They simply need to apply some of those same principles when communicating with AI.

   Explain what you're trying to achieve, provide the relevant information and establish what a useful answer looks like.

   You shouldn't need a course in prompt engineering to ask whether you should repair or replace your washing machine.

---

## 6. Edge cases and warnings

1. When does this approach fail? (No evidence to give, a decision you
   can't share, a model that ignores constraints, etc.)

   **Answer:** There are several circumstances where even a well-written prompt won't produce a reliable answer.

   - Insufficient information. Sometimes neither you nor the AI has enough information to reach a conclusion.
   - Incorrect information. Providing detailed but incorrect evidence can lead to an equally detailed but incorrect recommendation.
   - Conflicting requirements. You might want something to be inexpensive, fast, secure, reliable and effortless to maintain. Those requirements sometimes compete with one another.
   - Outdated information. The AI may not have access to current prices, legislation, documentation or product specifications.
   - Limited access. Asking AI to review a system it cannot actually inspect will inevitably involve assumptions.
   - Model limitations. Sometimes the AI simply misunderstands the problem, overlooks a constraint or makes a mistake.
   - Confirmation bias. If you frame the question around the answer you already want, you may encourage the AI to reinforce your existing opinion rather than challenge it.

   There is also a point where people need to accept that AI cannot make every decision for them.

   Sometimes the most useful answer is that there isn't enough information to make a decision yet.

   I would rather receive that answer than a confident recommendation based on assumptions nobody has bothered to identify.

1. Anything a reader should **never** paste into an AI tool while making a
   decision like this?

   **Answer:** People need to understand where their information is going and how the service handles it.

   I would avoid providing passwords, API keys, private encryption keys, authentication tokens, unnecessary identity documents, payment card details, confidential customer information or commercially sensitive information to an unapproved AI service.

   That doesn't mean AI cannot be used with sensitive information. There are legitimate enterprise, private and locally hosted AI deployments designed for particular data-handling requirements.

   But you need to understand the environment you're using.

   In many circumstances, you can replace sensitive information with fictional values without affecting the quality of the answer.

   An AI doesn't need your actual database password to help you troubleshoot a database connection.

   Provide enough information to solve the problem, not everything you happen to have available.

---

## 7. The artefact and the article itself

1. Should the article end with a copyable prompt template, a checklist, or
   something else?

   **Answer:** Both. A simple prompt template followed by a short checklist.

   The template should be accessible enough that someone could use it to compare mobile phone plans, evaluate a business decision or review a technical implementation.

   Copyable prompt template:

   ```text
   I need to make the following decision:

   [Describe what you need to decide.]

   My circumstances are:

   [Provide relevant background information.]

   My priorities and constraints are:

   [Explain what matters, including budget, time, requirements and limitations.]

   The information I currently have is:

   [Provide relevant evidence, documents, observations or available options.]

   Please:

   - Evaluate the available options against my requirements.
   - Recommend an approach and explain why.
   - Explain the disadvantages and trade-offs.
   - Separate verified information from assumptions and inferences.
   - Identify anything important that I may have overlooked.
   - Explain what additional information could change your recommendation.

   If there is insufficient information to make a reliable recommendation, explain what is missing rather than forcing a conclusion.
   ```

   The checklist should help people evaluate the response they receive, rather than just the prompt they write.

   [ ] Have I explained what I actually need to decide?
   [ ] Have I provided the relevant circumstances?
   [ ] Have I explained what matters most to me?
   [ ] Have I provided evidence the AI can inspect?
   [ ] Has the AI identified its assumptions?
   [ ] Does the recommendation respect my constraints?
   [ ] Do I understand the trade-offs?
   [ ] Do I know what still needs to be verified?
   [ ] Am I comfortable taking responsibility for the final decision?

2. Headline and slug: keep "Ask AI for a decision, not a performance", or
   change it?

   **Answer:** Keep the headline. It establishes the argument without making exaggerated promises about what AI can do.

   | Field | Suggested value |
| Title | Ask AI for a decision, not a performance |
| New slug | `better-ai-decisions-not-better-performances` |
| Tags | AI, Workflow, AI Literacy, Decision Making |
| Hero image | `/images/articles/confidence-versus-correctness.png` |
| Takeaway | Give AI a decision to help you make, not an opportunity to impress you. |

Suggested description:

Getting useful answers from AI isn't about elaborate prompts or fictional expertise. It's about defining the decision, providing relevant evidence and understanding the limitations of the answer.

3. Should it link to the book's sign-up or to the earlier
   "Writing a book about AI, with AI" article?

   **Answer:** Both, but naturally.

   The article should stand on its own rather than feel like an advertisement for the book.

   When discussing confidence versus correctness, there is a natural opportunity to reference AI for Normal People and the broader concept of understanding how AI works.

   The earlier article, Writing a book about AI, with AI, could also be included as related reading because it demonstrates another practical application of working with AI rather than simply delegating everything to it.

   The book link should direct readers to its current availability or information page rather than necessarily using a sign-up link.

4. Rough length, and any audio or video version planned?

   **Answer:** Approximately 1,800–2,500 words.

   The article should be long enough to demonstrate the concept through several practical examples without becoming another unnecessarily complicated guide to prompting AI.

   It would also translate well into other formats.
   
   | Format | Suggested approach |
   | Article | Full explanation with practical examples and reusable template |
   | YouTube | 8–12 minute demonstration comparing different prompts |
   | Podcast | 15–20 minute discussion about AI, confidence and decision-making |
   | Short-form video | 60–90 seconds showing a theatrical prompt versus a practical prompt |
   | Downloadable resource | One-page decision-making prompt and checklist |

   For a video, I would give the same AI model two different prompts in separate conversations and compare the responses.

   The first would be elaborate and performative but contain very little useful information. The second would establish a clear decision, constraints and evidence.

   Let people see the difference rather than simply telling them that one approach is better.

   No audio or video production is assumed to have been scheduled yet.

---

## 8. Lightning round (pull-quote fuel)

- The one sentence you'd want a reader to remember: The quality of an AI answer depends less on how impressive your prompt sounds and more on how clearly you've defined the problem.
- The prompt habit you'd ban if you could: Assigning fictional qualifications to AI instead of providing it with useful information.
- What a good answer from AI feels like: I understand my options, I understand the trade-offs, I know what remains uncertain, and I'm better equipped to make my own decision.

---

## Appendix — suggested article shape

1. **The problem:** the real bad-prompt story (§1).
2. **Context:** why long or performative prompts feel productive but aren't.
3. **What I tried:** before/after pairs (§2) and the backup decision (§3).
4. **The decision:** decision + constraints + evidence.
5. **Working implementation:** the reusable prompt shape (§2.3).
6. **Edges:** when it fails and what never to paste in (§6).
7. **Artefact/takeaway:** the template or checklist, plus the takeaway line.

---

## Additional pull quotes for the article

These could be used throughout the article, in social media graphics or as promotional excerpts.

- AI can make unnecessary complexity look like progress.
- Telling an AI that it has 30 years of experience doesn't give it 30 years of experience.
- A confident answer is not necessarily an informed answer.
- The objective isn't to get AI to agree with you. It's to understand whether your reasoning holds up.
- A longer prompt is only better when the additional words provide useful information.
- Sometimes the best answer AI can give you is that you don't have enough information to make a decision.
- You can delegate research, analysis and comparison without delegating responsibility.
- AI should reduce the uncertainty surrounding a decision, not disguise it.
- If you cannot explain why you've accepted an AI recommendation, you probably haven't finished evaluating it.

## Suggested closing passage

I don't use AI because I want something else to do my thinking for me. I use it because it can help me explore options, challenge assumptions, identify things I've overlooked and work through problems more efficiently.

But there is a difference between asking AI to help you think and asking it to think on your behalf.

The next time you open an AI tool, resist the temptation to construct some elaborate prompt designed to extract the most impressive answer possible.

Start with a much simpler question: what am I actually trying to decide?

Explain your circumstances. Give it the information you have. Tell it what matters to you. Ask it to challenge your assumptions and acknowledge what it doesn't know.

You don't need an impressive answer.

You need a useful one.

---

Editorial notes: The Swoovr infrastructure and internet troubleshooting examples are grounded in previous discussions. The before-and-after prompts are reconstructed rather than verbatim historical transcripts. The opening anecdote, Mac backup experience and exact personal prompting habits still require your confirmation before being presented as autobiographical facts. The new slug, article length, hero image and media formats are proposed editorial decisions.
