# Podcast intro / outro audio

`scripts/publish-article-audio.sh` wraps each article's narration in an intro and outro
built from the files in this folder. Everything here except this README is gitignored:
royalty-free music licences generally forbid redistributing the raw file, and this repo is public.

| File | Required | What it is |
| --- | --- | --- |
| `intro-voice.*` | for the intro | The spoken intro line, e.g. *"This is Useful Stash. Real tools. Real fixes. No fluff."* |
| `outro-voice.*` | for the outro | The spoken outro, e.g. *"That was Useful Stash. The full article and links are at usefulstash dot com. Thanks for listening."* |
| `music.*` | with either voice | The music bed. Used for the intro, and the outro unless `outro-music.*` exists. Looped if it's shorter than needed. |
| `outro-music.*` | no | A different track for the outro. |

Any of `.wav .flac .aiff .aif .m4a .mp3 .ogg` works; WAV/FLAC is best (the episode is re-encoded once at the end).
Record the voice files **dry**: no music, no leading/trailing silence, no reverb. The script does the timing and levels.

Optional per-episode line: put `<slug>.intro.mp3` (or `.wav`/`.m4a`/…) next to the article in
`src/content/articles/`, e.g. *"Season one, episode three. Writing a book about AI, with AI."*
It plays 0.6 s after `intro-voice`, over the same music, and is deleted with the article MP3 after publishing.

## What the episode sounds like

```
0.0s   music in (0.3 s fade), full level
1.6s   music drops 10 dB over 0.4 s
2.0s   intro voice (+ episode line), music stays down
+0.8s  music (still down) fades out, straight into ...
       article narration
       music fades in over 0.8 s, already 10 dB down
+0.8s  outro voice
+0.4s  music comes back up to full
+4.0s  of music after the voice, fading out over the last 3 s
```

The whole episode is then normalised to -16 LUFS / -1.5 dBTP and encoded as 128 kbps MP3.
Every timing and level is an env var at the top of the script (`INTRO_VOICE_DELAY`, `MUSIC_LUFS`,
`MUSIC_START`, `DUCK_DB`, `OUTRO_TAIL`, ...). For example, to make the music quieter and skip its first 8 seconds:

```sh
MUSIC_LUFS=-25 MUSIC_START=8 npm run audio:dry-run -- my-article
```

`--dry-run` writes a preview you can listen to at `output/<file>.mp3`. `--no-intro` / `--no-outro` skip either part.
The finished MP3 is tagged `PRODUCED=intro+outro`, so re-publishing a file downloaded from R2 only re-tags it.
After a verified upload the script purges the file's `media.usefulstash.com` URL from Cloudflare's cache
(needs `CLOUDFLARE_ZONE_ID_USEFULSTASH` and `CLOUDFLARE_CACHE_PURGE_API_TOKEN_USEFULSTASH` exported; without them it prints the URL to purge by hand).

## Generating the voice files with `say` (macOS)

The current intro/outro voice files come from macOS text-to-speech. Run this from the repo root to regenerate them.
The voice has to be installed first (System Settings → Accessibility → Spoken Content → System Voice → Manage Voices).

```bash
VOICE="Lee (Premium)"
VOICE_RATE="115"
VOICE_INTRO_TEXT="This is Useful Stash. Real tools. Real fixes. No fluff."
VOICE_OUTRO_TEXT="That was Useful Stash. The full article and links are at usefulstash dot com. Thanks for listening."
INTRO_AIFF="podcast-audio/intro-voice.aiff"
OUTRO_AIFF="podcast-audio/outro-voice.aiff"

say \
  -v "$VOICE" \
  -r "$VOICE_RATE" \
  -o "$INTRO_AIFF" \
  "$VOICE_INTRO_TEXT"

say \
  -v "$VOICE" \
  -r "$VOICE_RATE" \
  -o "$OUTRO_AIFF" \
  "$VOICE_OUTRO_TEXT"
```
