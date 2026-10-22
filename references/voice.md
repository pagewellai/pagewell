# Voice: narration for a story, voice lines for a game

A story can speak — each slide reads its own line aloud — and a game can talk
("Ready… go!", "New best!"). The voice is made once, on this computer, with
**Qwen TTS** (Alibaba Cloud Model Studio, model `qwen3-tts-flash`) and saved as
small audio files next to the page. `publish` uploads them with the page, like
images.

## When

- **Every story speaks.** A story is a narrated slideshow: write a line on
  every slide and run `pagewell voice` before publishing or recording — no
  need to ask first. Run `--dry-run` once to see the character count (it is
  billed to the user's own Alibaba Cloud account, per character). If there is
  no key (`tts_key_missing`), relay the set-up below; the story still plays
  silently on its text timing until the voice is made.
- **A game** gets voice lines only when they ask: "make it talk", "配音",
  "旁白", "有声音", "念出来".

## Story: one line per slide

Write the spoken line on the slide as `data-narration` — the words to be said,
not a copy of what the slide shows:

```html
<section data-slide data-layout="cover" data-narration="Why is the sky blue? The answer is in the air.">
  <p class="kicker">Physics in eight slides</p>
  <h1>Why is the sky blue?</h1>
</section>
```

- Write it the way a person says it out loud: short sentences, no URLs, no
  "as you can see on this slide".
- One idea per line, about as long as the slide deserves: Chinese runs about
  4–5 characters a second, English about 2.5 words a second. A slide stays at
  most 30 s; a longer line gets a warning — split the slide.
- Every slide gets a line; `check` warns about a slide without one (it would
  stay silent on its text timing).
- Write it in the page's language: `<html lang>` sets the voice's language.

Then:

```
pagewell voice story.html --dry-run --json   # no network: the lines, their characters, whether a key is set
pagewell voice story.html --json             # makes voice/story-s01-….mp3 … and writes them into the page
```

It writes `data-voice="voice/…"` and `data-duration` (the line's length plus a
breath) on each slide, so **the slide's timing follows its voice** — a hand-set
`data-duration` on a narrated slide is replaced. Run it again after changing a
line: unchanged lines are reused at no cost, changed ones are made again;
`--force` remakes every line. If a line fails, the page is left as it was and
the lines already made are kept for the next run.

## Game: named voice lines

```html
<audio data-say="go" data-narration="Ready… go!"></audio>
<audio data-say="best" data-narration="New best!"></audio>
```

`pagewell voice game.html --json` fills in each `src`. Play a line from the
game's script:

```js
if (!muted) pagewell.say('go');   // false until the player's first tap
```

The game's first tap (Tap to start) unlocks sound for its effects and its voice
lines; before it, `say` plays nothing and returns `false`. Let the game's own
mute button (`.icon-btn` in the HUD) silence the voice lines too. A new line
cuts off one that is still playing, so keep them short.

## How people hear it

- **On the web a story opens silent** — browsers allow no sound before a tap.
  PageWell shows a sound button under the progress bar, top right; one tap turns
  the narration on, starting the current slide's line from where the slide is.
  It is built in: never add your own sound button, `<audio controls>` or
  autoplaying audio to a story.
- **Captions**: the line being said shows at the bottom of the stage, a
  sentence at a time, taken from `data-narration` — so write it as it should
  read, too. On the web they are on by default and the CC button (or `C`)
  turns them off; in a recording they are always on.
- **A game** speaks after its first tap.
- **A recording** (`pagewell record`) plays the narration by itself.

## The key

The voice uses the user's own Qwen TTS key (Alibaba Cloud Model Studio →
API keys), read from the environment — `DASHSCOPE_API_KEY`, or `TTS_KEY` — and
billed per character on their account. `--dry-run` tells you the character
count before anything is spent.

`tts_key_missing` → say, in these words or close:

> Making the voice needs your own Qwen TTS key (Alibaba Cloud Model Studio →
> API keys). Add `export DASHSCOPE_API_KEY=sk-…` to your shell profile
> (`~/.zshrc` or `~/.bashrc`), then restart the terminal — or this agent — so
> it can see it. Please don't paste the key here.

⛔ Never ask for the key in the chat, never write it into a file in the project,
never put it on a command line. If they paste it anyway, do not repeat it: ask
them to put it in their profile, and mention that it is now in this chat's
history, so they may want to replace it.

Keys belong to a region. A key from the international site works on
`dashscope-intl.aliyuncs.com`; when the Beijing endpoint rejects a key, the CLI
tries the international one by itself (`endpoint` in the result says which
answered). `QWEN_TTS_BASE_URL` pins one.

## Voices and languages

The default voice is `Kai`; `--voice` picks another Qwen TTS voice (for example
`Cherry` or `Ethan`) and `--language` overrides the page's language (`Chinese`,
`English`, `Japanese`, … or `Auto`). An unknown voice comes back as
`tts_rejected` with Qwen's own message — read it out.

## The audio files

With `ffmpeg` on the computer the lines are small MP3s (about 8 KB a second).
Without it, macOS makes `.m4a`; with neither, they stay WAV — about six times
larger, and the result says so: suggest installing ffmpeg, then
`pagewell voice … --force`. The files sit in `voice/` next to the page and
`publish` uploads the ones the page uses (`missing_assets` names any it could
not take). `unused` in the result lists files from earlier versions of the
lines; they are safe to delete.

## Report

Say how many lines were made (and reused), how long the voice is in total,
which voice and language, and that the slide timings now follow the voice. For a
story, say that on the web it opens silent and the sound button (top right)
turns the voice on. If they want it on Douyin / TikTok / Reels, offer to record
it (`references/recording.md`).
