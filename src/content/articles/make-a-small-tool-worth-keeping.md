---
title: Make a small tool worth keeping
description: A short checklist for turning a one-off script into something your future self can use with confidence.
publishedAt: 2026-09-15
updatedAt: 2026-09-16
draft: false
tags:
  - Tools
  - Workflow
takeaway: A useful tool is not finished when it runs once; it is finished when the next person can run it safely.
fixture: true
---

A quick script can save an afternoon. A small, dependable tool can keep saving afternoons long after you have forgotten how it works.

## Start with the real job

Write down the input, the result, and the failure you most want to avoid. That is enough scope for a small tool. Extra options can wait until someone actually needs them.

```bash
./tidy-downloads.sh --preview ~/Downloads
```

The preview matters more than a clever progress animation. It lets someone see the proposed change before trusting the tool with real files.

## Leave a clean handhold

Give the tool a useful `--help` message, choose safe defaults, and include one example that can be copied without editing five placeholders. If a failed operation can leave partial work behind, say so plainly.

[Read more practical notes in the stash](/stash/).
