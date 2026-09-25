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
0.0s   music in (0.3 s fade)
2.0s   intro voice (+ episode line), music ducks underneath
+2.5s  music swells back, fades out over the last 1.5 s
+0.4s  silence
       article narration
+1.2s  silence
       music fades in over 1.5 s
+1.5s  outro voice, music ducks
+4.0s  music fades out
```

The whole episode is then normalised to -16 LUFS / -1.5 dBTP and encoded as 128 kbps MP3.
Every timing and level is an env var at the top of the script (`INTRO_VOICE_DELAY`, `MUSIC_LUFS`,
`MUSIC_START`, `OUTRO_TAIL`, ...). For example, to make the music quieter and skip its first 8 seconds:

```sh
MUSIC_LUFS=-25 MUSIC_START=8 npm run audio:dry-run -- my-article
```

`--dry-run` writes a preview you can listen to at `output/<file>.mp3`. `--no-intro` / `--no-outro` skip either part.
The finished MP3 is tagged `PRODUCED=intro+outro`, so re-publishing a file downloaded from R2 only re-tags it.
