---
title: Ask AI for a decision, not a performance
slug: better-ai-decisions-not-better-performances
description: Getting useful answers from AI isn't about elaborate prompts or fictional expertise. It's about defining the decision, providing relevant evidence and understanding the limitations of the answer.
publishedAt: 2026-10-22
draft: false
authors:
  - dj
tags:
  - AI
  - Workflow
  - AI Literacy
  - Decision Making
takeaway: Give AI a decision to help you make, not an opportunity to impress you.
heroImage: /images/articles/confidence-versus-correctness.png
heroImageAlt: A four-quadrant chart from AI for Normal People titled "Apparent Confidence Is Not Correctness", with correct-to-incorrect on one axis and uncertain-sounding to confident-sounding on the other. An answer can sound confident and still be wrong.
socialImage: /images/articles/better-ai-decisions-not-better-performances.png
seo:
  canonical: null
  noindex: false
---

Software architecture is a particularly good place to watch AI go wrong in a very polished way.

When you're building a product, there are dozens of decisions to make about infrastructure, frameworks, databases, security and deployment. You can ask AI to design the best possible architecture for your application, and it will happily produce something that looks incredibly sophisticated. Microservices. Distributed caching. Kubernetes. Message queues. A few other things you'll need to look up.

Everything sounds reasonable until you remember that you're building an early-stage product with a handful of users, limited resources and one person responsible for maintaining most of it.

The answer might be technically sound. It's also practically useless.

The problem usually isn't that the AI got the technology wrong. It's that I hadn't defined the decision I needed to make. I asked it to produce something impressive rather than something appropriate — and it obliged.

## The prompt that sounds fine

A prompt like that looks something like this:

> Design a scalable, secure, enterprise-grade architecture for a modern mobile and web application. Follow industry best practices and recommend the most appropriate technologies.

It sounds perfectly reasonable. The trouble is that almost every important word in it is subjective.

What does *scalable* mean? What does *enterprise-grade* mean? How many users are we expecting? Who is maintaining it? What's the budget? What infrastructure already exists?

Without that information, the AI fills in the blanks. And when a model fills in blanks about "enterprise-grade", it tends to fill them in with whatever enterprise-grade looks like in everything it has read — which is mostly written by and for organisations far bigger than yours.

The cost isn't usually one dramatic disaster. It's time. Time spent researching technologies you don't need, reviewing recommendations that don't fit, and having three more conversations to narrow down what should have been a fairly straightforward decision. And if you actually implement those recommendations, there's a maintenance cost on top: every unnecessary component is another thing to configure, monitor, secure, update and troubleshoot.

AI can make unnecessary complexity look like progress.

## Why performance prompts feel productive

There's an entire culture developing around the idea that you need to speak to AI in some elaborate, highly structured way to get useful results. You've probably seen prompts like this:

> You are a world-class software architect with 30 years of experience, an exceptional IQ and an unparalleled understanding of modern technology. You have worked for the world's largest technology companies and are recognised internationally as an expert in your field. Your mission is to deliver the most comprehensive, innovative and revolutionary solution possible.

What has any of that told the AI about the problem?

Nothing particularly useful. You've spent an entire paragraph establishing fictional credentials instead of explaining what you need.

Telling an AI that it has 30 years of experience doesn't give it 30 years of experience. Telling it that it's an expert doesn't give it access to more information, more evidence or professional qualifications. I'd rather spend those words explaining the problem, the circumstances and what I need to achieve.

A longer prompt is only better when the additional words provide useful information.

### Where a role does earn its place

That doesn't mean roles are useless. There are good reasons to give an AI one.

You might ask it to review a document from the perspective of a customer, challenge a business proposal the way an investor would, or run a mock interview. Asking it to explain something to a beginner rather than an experienced engineer sets the right level of detail.

The distinction is whether the role serves a functional purpose.

"Review this from the perspective of a security engineer and identify potential vulnerabilities" is useful. It tells the model what to look *for*.

"You are the greatest security engineer who has ever lived" is not. It tells the model how to *sound*.

A role can change the perspective of an answer. It cannot manufacture expertise, evidence or authority.

## Decision, constraints, evidence

Here's the shift. Instead of asking for "a comprehensive analysis", say what you'll choose or do once you have the answer. Then add the constraints that would make an otherwise plausible answer wrong, and the evidence the answer should actually use.

- **The decision** establishes the destination.
- **The constraints** establish the boundaries.
- **The evidence** establishes what we actually know.

If I had to rank them, the decision comes first. If the AI doesn't understand what I'm trying to achieve, the constraints and evidence don't have a clear purpose. But all three work together, and dropping any one of them tends to show up in the answer.

These examples are reconstructed from the kinds of decisions I deal with in software development and product work. They're not word-for-word transcripts, but the shape is real.

### Example 1: infrastructure

**Before:**

> What is the best infrastructure architecture for my application?

**After:**

> I need to decide how to host an early-stage application consisting of a web application, API, PostgreSQL database, authentication service and supporting services.
>
> The infrastructure needs to be affordable, manageable by a small team and easy to expand later. Compare a single dedicated server running Docker Compose against multiple virtual machines.
>
> Recommend which approach is more appropriate at this stage, explain the trade-offs and identify what would justify moving to the alternative.

The second prompt gives the AI an actual decision to work towards. Instead of an architecture diagram full of fashionable technologies, it can evaluate two realistic options against the circumstances of the project — and tell me what would change its mind, which is the bit I'll need in six months.

This one isn't hypothetical. While building Swoovr, I moved from experimenting with multiple virtual machines to running the UAT environment on a single server with Docker Compose: PostgreSQL, Keycloak, the APIs, the web applications and Caddy, all on one box.

The decision wasn't about which architecture was theoretically superior. It was about which made sense for the current stage of the product. Something being capable of supporting a million users doesn't make it appropriate for a product that hasn't publicly launched. The single server was the right call for UAT. That doesn't mean it stays the right call forever — and a good answer should tell you when it stops being one.

### Example 2: reviewing development work

**Before:**

> Review my project and tell me what needs improvement.

**After:**

> Review the repository, existing GitHub issues, implementation and release acceptance criteria.
>
> Identify what remains incomplete before the Android application can be released. Exclude iOS-specific work for now.
>
> Separate confirmed defects, untested functionality, release blockers and optional improvements. Reference the relevant files and issues. Do not assume that functionality is working simply because the code exists.

The difference is enormous. The first prompt invites an almost unlimited amount of commentary. The second produces something I can use to plan work and make a release decision.

It also draws the line between something being *implemented* and something being *verified*. That line matters more every month, because AI agents can now read repositories, run commands and change files. Reading code is not the same as testing it.

### Example 3: a slow internet connection

**Before:**

> Why is YouTube slow on my internet connection?

**After:**

> The YouTube mobile application experiences consistent delays when loading content over my home internet connection. Enabling Cloudflare WARP appears to resolve the problem immediately.
>
> I need to determine whether the issue relates to DNS, routing, IPv6, QUIC/HTTP/3 or something else.
>
> Provide diagnostic tests that can distinguish between these possibilities. Explain what each result would establish and what it would not establish. Do not assume the cause before we have evidence.

The first question encourages speculation. The second sets up an investigation. I'll come back to this one, because it's real and it's a good example of why the next section matters.

### The everyday version

None of this is only for developers. Take something almost everyone understands, like backing up a Mac:

> Compare these two backup approaches for a single Mac. I care about reliable restores and low maintenance more than the lowest monthly price.

Asking for *the best* backup solution is fundamentally different from asking which one best suits your circumstances. Someone who travels constantly has different needs from someone who works at one desk. Someone with several terabytes of video has different needs from someone storing documents. There isn't a universally correct answer — so don't ask for one.

## Make uncertainty visible

Once the AI knows what you're deciding, the next job is making it show its working. Specifically: what it knows, versus what it's guessing.

I use something along these lines:

> Separate your response into:
> - What you can verify from the available evidence.
> - What you are inferring from that evidence.
> - What assumptions you are making.
> - What remains unknown.
> - What additional information could change your recommendation.
>
> Do not present assumptions or inferences as established facts.

And when I'm working with code:

> Do not tell me that something works simply because you can see an implementation. Distinguish between implemented, tested and independently verified functionality.

### Why this matters: the ten-second YouTube problem

Back to that internet connection.

The YouTube and YouTube Music mobile apps on my home connection were consistently taking around ten seconds to start loading anything. Other internet services seemed fine. The same apps worked normally on mobile data and on other Wi-Fi networks. And switching on Cloudflare WARP on the affected connection fixed it instantly.

It would have been very easy for an AI — or me — to confidently announce that this was a DNS problem. Or an IPv6 problem. Or QUIC. All three are plausible. All three come with a satisfying fix you could go and apply right now.

But the evidence didn't establish any of them individually.

What I actually knew was that changing the network path through WARP changed the behaviour, and that my provider's diagnostics reported a healthy broadband connection. That's it. The correct next step was to investigate the *differences* between those two network paths, not to start changing settings based on a diagnosis nobody had earned yet.

A VPN fixing a problem is useful evidence. It doesn't tell you why the problem exists. Asking the AI to separate evidence from inference is what stops a plausible guess turning into a configuration change you'll be undoing next week.

### Confidence is not correctness

The image at the top of this article comes from *[AI for Normal People](https://how-to-use-ai.com/books/ai-for-normal-people/)*, the first book in the How To Use AI.com series, and it's probably the single idea I most want people to take away from it.

Confidence and correctness are not the same thing.

AI can produce a beautifully structured, technically detailed and entirely incorrect answer. It doesn't hesitate when it's wrong. It can explain an incorrect conclusion just as convincingly as a correct one.

Humans tend to read confidence, professional language and detail as signs of competence. Generative AI can reproduce all three without having the evidence to back any of it. So evaluate the substance of an answer, not its presentation. Asking the model to label its own assumptions is just a way of making the substance easier to see.

A confident answer is not necessarily an informed answer.

## The shape I reuse

I don't use identical wording every time, but the structure is pretty consistent:

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

I don't need to tell the AI it has 30 years of experience, an IQ of 180, or that it's the world's leading expert in whatever I'm asking about. I need it to understand the problem.

You don't need a course in prompt engineering to ask whether you should repair or replace your washing machine. Most people already know how to explain a problem to another person. This is the same skill.

## When this doesn't work

A well-written prompt isn't magic either. It will still let you down when:

- **There isn't enough information.** Sometimes neither you nor the AI has enough to reach a conclusion.
- **The information is wrong.** Detailed but incorrect evidence produces an equally detailed but incorrect recommendation.
- **Your requirements conflict.** Cheap, fast, secure, reliable and effortless to maintain don't always fit in the same box.
- **The information is out of date.** The model may not know current prices, legislation, documentation or product specifications.
- **It can't see the thing.** Asking AI to review a system it can't actually inspect guarantees assumptions.
- **The model just gets it wrong.** It misunderstands, overlooks a constraint, or makes a mistake. It happens.
- **You've framed it around the answer you want.** Lead the question and you'll get your own opinion handed back to you with better formatting.

The objective isn't to get AI to agree with you. It's to find out whether your reasoning holds up.

And sometimes the most useful answer is that there isn't enough information to decide yet. I'd much rather get that than a confident recommendation built on assumptions nobody bothered to name.

### What not to paste in

Know where your information is going and how the service handles it. I wouldn't hand passwords, API keys, private keys, authentication tokens, unnecessary identity documents, payment card details, confidential customer information or commercially sensitive material to an unapproved AI service.

That doesn't mean AI can never be used with sensitive information — there are enterprise, private and locally hosted deployments built for exactly that. But you need to know which environment you're in.

Most of the time you can swap sensitive details for fictional values without changing the quality of the answer. An AI doesn't need your actual database password to help you troubleshoot a database connection.

Provide enough information to solve the problem, not everything you happen to have lying around.

## Take this with you

Here's a template you can copy and use for anything from mobile phone plans to a business decision to a technical review:

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

The prompt is only half the job. This checklist is for the answer you get back:

- [ ] Have I explained what I actually need to decide?
- [ ] Have I provided the relevant circumstances?
- [ ] Have I explained what matters most to me?
- [ ] Have I provided evidence the AI can inspect?
- [ ] Has the AI identified its assumptions?
- [ ] Does the recommendation respect my constraints?
- [ ] Do I understand the trade-offs?
- [ ] Do I know what still needs to be verified?
- [ ] Am I comfortable taking responsibility for the final decision?

That last one is the important one. You can delegate research, analysis and comparison without delegating responsibility. If you can't explain why you've accepted an AI recommendation, you probably haven't finished evaluating it.

## What am I actually trying to decide?

I don't use AI because I want something else to do my thinking for me. I use it because it helps me explore options, challenge assumptions, spot things I've overlooked and work through problems faster. (I wrote more about where I draw that line in [Writing a book about AI, with AI, without the bullshit](/stash/writing-a-book-about-ai-with-ai-without-the-bullshit/).)

But there's a difference between asking AI to help you think and asking it to think on your behalf.

So the next time you open an AI tool, resist the urge to build some elaborate prompt designed to extract the most impressive answer possible. Start with a much simpler question: what am I actually trying to decide?

Explain your circumstances. Give it the information you have. Tell it what matters to you. Ask it to challenge your assumptions and admit what it doesn't know.

You don't need an impressive answer.

You need a useful one.
