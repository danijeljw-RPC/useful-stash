# "A container cleanup you can explain" — Author Questionnaire

> Internal working document. Not published or linked from the site, and
> excluded from the npm build because Astro builds `src/` and `public/`, not
> `docs/`. This file is tracked in Git, so treat it as internal repository
> material.
>
> Purpose: give DJ the raw material to turn the 170-word fixture
> `src/content/articles/2026-09-04-a-container-cleanup-you-can-explain.md`
> into a full article under a **new slug**. Generic multi-stage Docker advice
> is everywhere, so this piece only earns its place with a **real image,
> real numbers and a real Dockerfile**. The fixture stays as a
> local-development sample.
>
> Answers don't need to be publish-ready. Paste Dockerfiles, `docker images`
> output and rants as they are.

Answer as many or as few as you want. The questions marked ⭐ are the ones the
article can't really work without.

---

## 0. What's already on record (don't re-answer these)

From the fixture stub:

- **Thesis:** image-size advice turns into a bag of flags. A simpler
  principle gets most of the way: build in one stage, then copy only the
  runtime artefacts into the final stage.
- **Takeaway:** the clearest small image contains only the runtime and the
  artefacts required to run the application.
- **Section 1, "Keep the boundary obvious":** name the build stage and make
  the final copy explicit, so a reviewer can see what crosses into
  production.
- **Section 2, "Measure the result":** record the size before and after, run
  the same smoke test against both; a smaller image that doesn't start
  isn't an optimisation.
- **Tags:** Docker.

---

## 1. The real image

1. ⭐ Which project or image is this about? Language/runtime (Node, .NET, Go,
   Python…), base image, and what the app does (anonymised is fine).

   **Answer:**

   Use a reproducible ASP.NET Core .NET 10 minimal API called `ContainerDemo`, targeting `net10.0`. It exposes `/health` and a JSON response at `/`. The baseline uses `mcr.microsoft.com/dotnet/sdk:10.0`; the replacement uses that SDK for publishing and `mcr.microsoft.com/dotnet/aspnet:10.0` for execution. This is a proposed demonstration, not an identified production image. .NET 10 is selected as the supported LTS release.

2. Why did size matter here: pull time, registry cost, cold starts,
   security scan noise, an edge or IoT target?

   **Answer:**

   The primary benefits are smaller deployment transfers and less unnecessary software in production. SDK tools, compilers and source files are not needed to execute a framework-dependent ASP.NET Core application. Registry storage, pull duration and scanner findings should be measured separately; a smaller image does not automatically improve application startup or eliminate vulnerabilities.

3. Can the Dockerfile be published, or does it need a cleaned-up
   equivalent that still tells the truth?

   **Answer:**

   Publish both demonstration Dockerfiles and the minimal application in the appendix below. No proprietary code, credentials or internal infrastructure are required.

---

## 2. Before and after

1. ⭐ Paste the "before" Dockerfile.

   **Answer:**

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

   This intentionally retains the SDK, source tree and intermediate build artefacts in the shipped image. It is a baseline for comparison, not a recommended production Dockerfile.

2. ⭐ Paste the "after" Dockerfile.

   **Answer:**

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

   The explicit copy is the production boundary. The runtime base supplies the shared framework. Both examples retain the same default user behaviour to isolate the packaging change; production hardening should separately evaluate `USER $APP_UID`.

3. ⭐ Sizes before and after, and how you measured them (`docker images`,
   `docker history`, `dive`, compressed vs uncompressed in the registry).

   **Answer:**

   No measured sizes are available yet. Run the commands in the additional appendix on the same platform and record the exact byte counts. `docker image inspect --format '{{.Size}}'` reports local image size, not compressed registry transfer size. `docker history` helps attribute layer sizes. Calculate percentage reduction as `(before - after) / before * 100`. Do not publish estimated numbers as measured results.

4. Build time before and after, if it changed?

   **Answer:**

   Not measured. Multi-stage builds may require an additional base image pull, while separating restore from source copying can improve incremental builds. Record cold and warm builds separately using the same builder, platform and source revision. Do not claim faster builds solely because the final image is smaller.

---

## 3. The smoke test

1. What's the smoke test you run against both images? Paste the command.

   **Answer:**

   Run the identical smoke test against each image. Verify that the process starts, `/health` returns HTTP 200 and `ok`, and `/` returns the expected JSON. The executable script in the additional appendix performs these checks and cleans up its temporary containers.

2. ⭐ Have you had a "smaller but broken" image? What was missing (CA
   certs, timezone data, a shared library, locale, a shell for an
   entrypoint script)?

   **Answer:**

   No personal incident is documented in the supplied material. A reproducible failure case is replacing the ASP.NET runtime image with `mcr.microsoft.com/dotnet/runtime:10.0` while keeping the framework-dependent web application. The image can build successfully but fail at startup because `Microsoft.AspNetCore.App` is missing. Other plausible failure cases include missing CA certificates, ICU libraries or timezone data when switching to more minimal bases. These are examples, not claimed historical incidents.

3. How did you find out: CI, staging, or production?

   **Answer:**

   The proposed failure should be detected in CI by running the built image, not merely checking that `docker build` succeeded. No actual CI, staging or production incident is established.

---

## 4. The tricks you reject

1. Which "bag of flags" advice do you think is overrated or risky
   (`--squash`, chained `rm -rf` in one `RUN`, distroless everywhere,
   `scratch`, `upx`)?

   **Answer:**

   Reject optimisation by obscurity: squashing layers to conceal poor boundaries, deleting files in later layers expecting earlier bytes to disappear, and choosing `scratch`, distroless or UPX purely to win a size comparison. Combining installation and cleanup in one layer is useful when necessary, but it is not a substitute for excluding build dependencies from the final stage.

2. Is there any trick you **do** keep beyond multi-stage builds?
   (`.dockerignore`, pinned base digests, cache mounts…)

   **Answer:**

   Keep `.dockerignore`, explicit stage names, dependency-first copying for cache reuse, and deliberate base-image versioning. Pin digests for reproducibility where an update process exists. BuildKit cache mounts are useful for build performance, but their contents are not automatically part of the final image. Never put secrets into build arguments or copied files; use secret mounts where required.

3. Where do you land on distroless/scratch vs a slim base with a shell
   for debugging?

   **Answer:**

   Use the smallest base that meets operational requirements. A conventional ASP.NET runtime image is a sensible baseline. Chiseled or distroless images can reduce unnecessary packages, but require a debugging strategy and validation of native dependencies, certificates and globalisation. `scratch` is not a drop-in base for a framework-dependent .NET application.

---

## 5. Explainability and review

1. What makes a Dockerfile reviewable to you? Stage names, comments,
   explicit `COPY --from` lines?

   **Answer:**

   Use descriptive stage names (`build`, `runtime`), explicit publish directories, narrow `COPY --from` boundaries and comments explaining non-obvious decisions. A reviewer should be able to identify the runtime, application files, execution user, listening port and entrypoint without reverse-engineering shell scripts.

2. Have you reviewed someone else's "optimised" Dockerfile and been unable
   to tell what shipped? What happened?

   **Answer:**

   No specific review incident is supplied. A representative review problem is a Dockerfile that copies an entire builder filesystem or runs opaque cleanup scripts. The reviewer cannot easily distinguish required runtime files from build leftovers. Prefer a narrow publish-directory copy and inspect the resulting image rather than relying on the author's claim that it is optimised.

---

## 6. Versions and platform

1. Docker / BuildKit versions, and Docker Desktop vs OrbStack vs Colima vs
   CI runner?

   **Answer:**

   Proposed environment: Docker with BuildKit/buildx on macOS or a Linux CI runner. Exact Docker Engine, client and buildx versions must be captured during the experiment using `docker version` and `docker buildx version`. No particular desktop implementation or version has been verified.

2. arm64, amd64, or multi-arch? Any surprises across architectures?

   **Answer:**

   Use `linux/arm64` for a native Apple Silicon run, or `linux/amd64` for an x86 deployment comparison. Do not compare sizes across architectures as if they were equivalent. Native libraries and emulated build performance can differ. Multi-architecture manifests contain separate platform images; test each intended deployment architecture.

3. Anything destructive (pruning, cache clearing) a reader must be warned
   about?

   **Answer:**

   Avoid global `docker system prune -a --volumes` and indiscriminate builder-cache pruning. They can remove unrelated images, caches and unused volumes. The demonstration requires no global pruning. `--no-cache` bypasses build-layer reuse without deleting unrelated data; it does not guarantee a cold registry pull.

---

## 7. The artefact and the article itself

1. Should the article ship a template Dockerfile, a sample repo, or just
   the before/after diff?

   **Answer:**

   Ship a minimal sample repository or downloadable directory containing the project, both Dockerfiles, `.dockerignore` and a measurement/smoke-test script. Include the before/after diff in the article so readers can understand the change without cloning anything.

2. Headline and slug: keep "A container cleanup you can explain", or make
   it more searchable (e.g. name the runtime)?

   **Answer:**

   Suggested headline: “A container cleanup you can explain: smaller .NET Docker images”. Suggested new slug: `smaller-dotnet-docker-images-with-multi-stage-builds`. Preserve the original fixture and its slug.

3. Rough length, and any video walkthrough planned?

   **Answer:**

   Suggested length: 1,200–1,600 words, with a 5–8 minute optional video demonstrating the build, image inspection and smoke test. No video commitment has been confirmed.

---

## 8. Lightning round (pull-quote fuel)

- The one-line rule for a final stage: Copy what the application needs to run, not what it needed to build.
- The Docker tip you wish would die: Delete everything at the end and call it a small image.
- Smallest image you've ever shipped, and was it worth it: Not established; do not invent a personal record. Size is only valuable when the image still meets its operational requirements.

---

## Appendix — suggested article shape

1. **The problem:** the real image and why its size mattered (§1).
2. **Context:** why flag-collecting advice makes Dockerfiles unreadable.
3. **What I tried:** before Dockerfile and numbers (§2).
4. **The decision:** one build stage, an explicit runtime copy.
5. **Working implementation:** after Dockerfile, walked through stage by stage.
6. **Edges:** the smaller-but-broken story and platform surprises (§3, §6).
7. **Artefact/takeaway:** template or diff, measured results, takeaway line.


---

## Additional appendix — reproducible demonstration and evidence collection

The following is proposed technical content. Docker was not available in the authoring environment, so the builds, smoke tests, sizes and timings remain unverified. Run this experiment before presenting the article as a real measured case study.

### Sample application

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

Save the Dockerfiles from section 2 as `Dockerfile.before` and `Dockerfile.after` in the project directory.

### Build and measure

```bash
#!/usr/bin/env bash
set -euo pipefail

platform="${PLATFORM:-linux/arm64}"
docker version
docker buildx version

for variant in before after; do
  image="container-demo:$variant"
  time docker buildx build --platform "$platform" --load \
    --pull --no-cache -f "Dockerfile.$variant" -t "$image" .
  time docker buildx build --platform "$platform" --load \
    -f "Dockerfile.$variant" -t "$image" .
  docker image inspect --format '{{.Id}} {{.Os}}/{{.Architecture}} {{.Size}}' "$image"
  docker history "$image"
done

before=$(docker image inspect --format '{{.Size}}' container-demo:before)
after=$(docker image inspect --format '{{.Size}}' container-demo:after)
awk -v b="$before" -v a="$after" 'BEGIN {
  printf "Before: %.2f MB\nAfter: %.2f MB\nReduction: %.2f%%\n", b/1000000, a/1000000, (b-a)/b*100
}'
```

The first build bypasses layer caching; base-image blobs may already be cached. For rigorous timing, repeat in isolated builders, record base digests and report median durations. MB here means decimal megabytes.

### Smoke test

Requires Bash, curl and jq on the host. Save as `smoke-test.sh` and run `bash smoke-test.sh`.

```bash
#!/usr/bin/env bash
set -euo pipefail
cid=""
cleanup() { if [[ -n "$cid" ]]; then docker rm -f "$cid" >/dev/null; fi; }
trap cleanup EXIT

for variant in before after; do
  cid=$(docker run -d -p 127.0.0.1::8080 "container-demo:$variant")
  port=$(docker port "$cid" 8080/tcp | head -n 1 | awk -F: '{print $NF}')
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
    docker logs "$cid"
    exit 1
  fi
  curl -fsS --max-time 5 "$url/" | jq -e '.service == "container-demo"' >/dev/null
  echo "$variant: PASS"
  cleanup
  cid=""
done
```

### Results to capture before publication

| Measurement | Before | After |
| --- | --- | --- |
| Local image bytes | Pending | Pending |
| Compressed registry bytes (optional) | Pending | Pending |
| Cache-bypassed build duration | Pending | Pending |
| Warm build duration | Pending | Pending |
| Smoke test | Pending | Pending |
| Platform and base image digests | Pending | Pending |

Record the source revision, test date and tool versions alongside these results. A successful demonstration establishes a measured example, not a universal percentage saving for every .NET application.

### Technical references for editorial verification

- Docker multi-stage builds: https://docs.docker.com/build/building/multi-stage/
- Docker build best practices: https://docs.docker.com/build/building/best-practices/
- .NET container images: https://learn.microsoft.com/en-us/dotnet/core/docker/container-images

These are reference links for subsequent editorial verification; they were not independently retrieved during this draft.
