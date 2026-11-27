---
title: "A container cleanup you can explain: smaller .NET Docker images"
slug: smaller-dotnet-docker-images-with-multi-stage-builds
description: Cut a .NET 10 Docker image from 1.35 GB to 370 MB with one build stage and one explicit copy, measured, smoke-tested and readable in review.
publishedAt: 2026-11-27
draft: true
authors:
  - dj
tags:
  - Docker
  - .NET
takeaway: Copy what the application needs to run, not what it needed to build.
heroImage: /social-card.png
heroImageAlt: Useful Stash title card
seo:
  canonical: null
  noindex: false
---

Container image advice has a habit of turning into a bag of flags. Squash the layers. Chain every `rm -rf` into one `RUN`. Go distroless. Go `scratch`. Run it through UPX. Each trick shaves something off, and by the end you have a Dockerfile nobody can review and an image nobody can explain.

A simpler principle gets you most of the way: **build in one stage, then copy only the runtime artefacts into the final stage.** That's it. The rest of this article is a measured demonstration of that one idea on a small .NET 10 web API, with the Dockerfiles, the numbers, the smoke test, and the version that's smaller *and broken*.

## The demonstration app

To keep the comparison honest, the app is deliberately boring: an ASP.NET Core minimal API called `ContainerDemo`, targeting `net10.0`, with a health check and one JSON endpoint. This is a reproducible demonstration, not a production image from a real project — the point is that you can run every command below and check my numbers.

`ContainerDemo.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
```

`Program.cs`:

```csharp
var app = WebApplication.CreateBuilder(args).Build();
app.MapGet("/health", () => Results.Text("ok"));
app.MapGet("/", () => Results.Ok(new { service = "container-demo" }));
app.Run();
```

`.dockerignore`:

```text
.git
bin/
obj/
**/bin/
**/obj/
.env
.env.*
*.pfx
*.pem
```

Why does size matter for something this small? Mostly because of what's *in* the bytes. A framework-dependent ASP.NET Core app doesn't need compilers, the SDK, NuGet caches or its own source code to run. Shipping them anyway means bigger transfers on every deploy and more software sitting in production that has no business being there. Registry cost, pull time and scanner noise are all worth measuring separately — a smaller image doesn't automatically start faster or have fewer vulnerabilities.

## Before: one stage, everything ships

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0
WORKDIR /src
COPY . .
RUN dotnet publish ContainerDemo.csproj -c Release -o /app
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "ContainerDemo.dll"]
```

This is the Dockerfile most of us wrote the first time. It works. It also ships the entire .NET SDK, the source tree and every intermediate build artefact into production. It's a baseline for comparison, not a recommendation.

## After: one build stage, one explicit copy

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ContainerDemo.csproj .
RUN dotnet restore ContainerDemo.csproj
COPY . .
RUN dotnet publish ContainerDemo.csproj -c Release --no-restore -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish/ ./
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "ContainerDemo.dll"]
```

Three things changed, and each one is visible on the page:

1. **The stages have names.** `build` and `runtime` tell a reviewer what each half is for without reading a single `RUN` line.
2. **`COPY --from=build /app/publish/ ./` is the production boundary.** Everything that crosses into the shipped image goes through that one line, from one directory you chose on purpose. If you want to know what's in production, that's where you look.
3. **The runtime base is `aspnet`, not `sdk`.** It supplies the shared ASP.NET Core framework the app needs and nothing it needed only to build.

As a bonus, copying the `.csproj` and restoring before copying the rest of the source means a code change doesn't invalidate the restore layer, so incremental builds reuse it.

One thing I kept the same on purpose: both images run as the default user. Production hardening should look at `USER $APP_UID` separately, but changing it here would muddy a comparison that's meant to isolate one packaging change.

## Measure the result

I built both images on an Apple Silicon Mac for `linux/arm64`, with Docker 29.9.3 and buildx 0.38.1, on 27 November 2026:

```bash
for variant in before after; do
  docker buildx build --platform linux/arm64 --load \
    --pull --no-cache -f "Dockerfile.$variant" -t "container-demo:$variant" .
  docker image inspect --format '{{.Size}}' "container-demo:$variant"
done
```

| Measurement | Before | After |
| --- | --- | --- |
| Local image size (`docker image inspect`) | 1,351,766,073 bytes (1.35 GB) | 370,218,297 bytes (370 MB) |
| `docker save` piped through `gzip` | 343.6 MB | 92.9 MB |
| Warm rebuild, no source changes | 3 s | 1 s |
| Smoke test | Pass | Pass |

That's a **72.6% reduction** in local image size, and about 73% in the gzipped export. The gzipped figure is a rough stand-in for transfer size, not what a registry will actually report, so treat it as indicative. MB here means decimal megabytes.

`docker history` shows exactly where the "before" bytes go. The app itself is tiny — the publish step adds 729 kB, and the copied source 32.8 kB. Everything else is the SDK:

| Layer in the "before" image | Size |
| --- | --- |
| `COPY /dotnet /usr/share/dotnet` (the SDK) | 571 MB |
| `apt-get` build dependencies | 84 MB |
| PowerShell install | 53.1 MB + 18.6 MB package |
| `dotnet publish` output and intermediates | 729 kB |

In the "after" image, the application layer is a single 135 kB `COPY`. That's the published output and nothing else.

### What I'm not claiming

I'm not quoting a cold-build speed-up. The cache-bypassed "before" build took 37 seconds and the "after" build 5 seconds, but that's because the first build pulled the SDK image and the second reused it. A fair comparison needs isolated builders and repeated runs, and for an app this small the difference would be noise anyway. A smaller final image doesn't make the build faster, and multi-stage builds can even mean pulling an extra base image.

I'm also not claiming 72.6% is what *your* app will get. A bigger app with real dependencies will have a bigger publish directory, so the proportion saved will be lower. The base image you remove stays the same size, though, so the absolute saving should be in the same ballpark.

If you want to reproduce the numbers, record your base image digests alongside them. Mine were:

```text
mcr.microsoft.com/dotnet/sdk:10.0      sha256:8c6edfb26c85153f236d26efebd9ad349aec403583f343f201ee67838b23658d
mcr.microsoft.com/dotnet/aspnet:10.0   sha256:aac50ceef10391e78a899e3d2ccd00bbafa2dcb56ccf4586cbccf00edb84fc21
```

## A smaller image that doesn't start isn't an optimisation

Run the same smoke test against both images. Mine starts each container on a random local port, waits for `/health` to return `ok`, checks the JSON from `/`, and cleans up after itself. It needs Bash, `curl` and `jq` on the host:

```bash
#!/usr/bin/env bash
# Usage: bash smoke-test.sh [variant ...]   (default: before after)
set -euo pipefail
if [[ $# -eq 0 ]]; then set -- before after; fi
cid=""
cleanup() { if [[ -n "$cid" ]]; then docker rm -f "$cid" >/dev/null; fi; }
trap cleanup EXIT

for variant in "$@"; do
  cid=$(docker run -d -p 127.0.0.1::8080 "container-demo:$variant")
  sleep 1
  if ! port=$(docker port "$cid" 8080/tcp 2>/dev/null | head -n 1 | awk -F: '{print $NF}') || [[ -z "$port" ]]; then
    echo "$variant: FAIL (container exited)" >&2
    docker logs "$cid" >&2
    exit 1
  fi
  url="http://127.0.0.1:$port"
  ready=0
  for ((i=0; i<30; i++)); do
    if [[ "$(curl -fsS --max-time 2 "$url/health" 2>/dev/null || true)" == ok ]]; then
      ready=1
      break
    fi
    sleep 1
  done
  if [[ "$ready" != 1 ]]; then
    echo "$variant: FAIL (no healthy response)" >&2
    docker logs "$cid" >&2
    exit 1
  fi
  curl -fsS --max-time 5 "$url/" | jq -e '.service == "container-demo"' >/dev/null
  echo "$variant: PASS"
  cleanup
  cid=""
done
```

Here's why that matters. Swap one word in the "after" Dockerfile — `dotnet/aspnet:10.0` becomes `dotnet/runtime:10.0` — and you get an even smaller image. 327 MB. It builds without a single warning.

It also doesn't work:

```text
broken: FAIL (container exited)
You must install or update .NET to run this application.

App: /app/ContainerDemo.dll
Architecture: arm64
Framework: 'Microsoft.AspNetCore.App', version '10.0.0' (arm64)
.NET location: /usr/share/dotnet/

No frameworks were found.
```

The `runtime` image has the base .NET runtime but not the ASP.NET Core shared framework, so a web app exits immediately with code 150. `docker build` succeeding told you nothing. The only thing that caught it was actually running the image.

That's the cheapest failure on the list. Switching to more aggressively minimal bases can also lose CA certificates, ICU globalisation libraries or timezone data, and those tend to fail later and more quietly. Put the smoke test in CI, against the image you're about to ship, not just a successful build.

## The tricks I'd leave in the bag

Not every size trick is bad, but plenty of them make images *look* smaller while making them harder to understand.

- **Squashing layers to hide a messy boundary.** You've lost the history that would tell a reviewer what went in.
- **Deleting files in a later layer.** The bytes are still in the earlier layer. The image doesn't get smaller; it just gets confusing.
- **Picking `scratch`, distroless or UPX to win a size comparison.** `scratch` isn't a drop-in base for a framework-dependent .NET app at all.
- **Chaining install-and-cleanup into one `RUN` as a substitute for a final stage.** Sometimes you need it. It's not a replacement for keeping build dependencies out of production.

The tricks I do keep are boring: `.dockerignore`, named stages, copying dependency manifests before source for cache reuse, deliberate base image versions, and pinned digests where there's a process to update them. BuildKit cache mounts are great for build speed, and their contents don't land in the final image. And never put secrets in build arguments or copied files; use secret mounts.

On distroless versus a conventional runtime image: use the smallest base that meets your operational requirements. The standard `aspnet` image is a sensible default. Chiseled or distroless images can cut more, but they need a debugging plan and proper testing of native dependencies, certificates and globalisation before you trust them.

## Keep it reviewable

The real test of a Dockerfile isn't its size. It's whether someone else can open it and answer five questions without reverse-engineering a shell script: what's the runtime, which application files ship, which user does it run as, which port does it listen on, and what's the entrypoint?

Descriptive stage names, an explicit publish directory, a narrow `COPY --from` and a comment wherever a decision isn't obvious get you there. If a Dockerfile copies an entire builder filesystem or runs an opaque cleanup script, a reviewer can't tell required runtime files from build leftovers — so inspect the image rather than trusting the claim that it's "optimised".

## Before you go pruning

One warning, because it bites people: you don't need to nuke anything to run this experiment. Avoid `docker system prune -a --volumes` and indiscriminate builder-cache pruning on a machine you care about. They'll happily remove unrelated images, caches and volumes. `--no-cache` bypasses layer reuse for one build without deleting anything else.

And don't compare image sizes across architectures as if they're equivalent. An `arm64` image and an `amd64` image are different images. If you deploy to more than one, measure and smoke-test each.

## The short version

- Name your stages.
- Make one explicit `COPY --from` the boundary into production.
- Use the runtime base that matches your app, not the SDK.
- Record the size before and after, with tool versions and base digests.
- Run the same smoke test against both — and against anything "smaller" someone suggests.

The clearest small image contains only the runtime and the artefacts required to run the application. Everything in this article is about making that true, and making it obvious to the next person who reads the Dockerfile.

Further reading: Docker's guides to [multi-stage builds](https://docs.docker.com/build/building/multi-stage/) and [build best practices](https://docs.docker.com/build/building/best-practices/), and Microsoft's overview of [.NET container images](https://learn.microsoft.com/en-us/dotnet/core/docker/container-images).
