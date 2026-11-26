---
title: A container cleanup you can explain
slug: a-container-cleanup-you-can-explain
description: Keep a Docker image small by removing work from the final image, not by collecting obscure tricks.
publishedAt: 2026-09-04
draft: false
authors:
  - dj
tags:
  - Docker
takeaway: The clearest small image contains only the runtime and the artefacts required to run the application.
fixture: true
heroImage: /social-card.png
heroImageAlt: Useful Stash title card
seo:
  canonical: null
  noindex: false
---

Container image advice often turns into a bag of flags. A simpler principle gets most of the way there: build in one stage, then copy only the runtime artefacts into the final stage.

## Keep the boundary obvious

Name the build stage and make the final copy explicit. A reviewer should be able to see which files cross into production without mentally executing a long shell pipeline.

## Measure the result

Record the image size before and after, then run the same smoke test against both images. A smaller image that no longer starts is not an optimisation.
