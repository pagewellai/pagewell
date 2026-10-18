# Vertical pages: `story` and `game`

Two kinds of running page that PageWell **plays** instead of laying out:

- **story** — a sequence of full-screen vertical slides that advances on its
  own, like a short video or Instagram Stories. Tap to go on, hold to pause.
- **game** — a small game on a vertical stage, played with one thumb.

Both open the same way everywhere: full screen on a phone, a centred phone on a
computer, and the same inside X's in-app browser. PageWell adds one control: a
small floating button in the bottom-right corner (story and game alike) that
opens a bar with the author, Copy link, Pause / Restart and ⋯. You write only what happens on the stage.

Both wear **PageWell's stage style** (`stage-1`, below): one set of layouts,
type, colours and motion for every story and every game. You write the
content and pick a layout; you do not design.

## Which one

| The request | Template |
|---|---|
| "make it vertical", "like a short video / reel / TikTok / Stories", "one screen at a time", "vertical slides", "for X", "竖屏", "像短视频" | `story` |
| "a game", "a mini game", "something to play", "小游戏" | `game` |
| "explain how X works with a demo" (one control, one mechanism) | `principle` — not a story |
| "an article" that also has a demo | `article` + one `embed` |

```
pagewell templates use story -o story.html     # or: game -o game.html
```

## The stage — both kinds

- One HTML file declaring
  `<meta name="pagewell:display" content="story">` (or `game`),
  `<meta name="pagewell:style" content="stage-1">` and
  `<meta name="viewport" content="width=360">`. The scaffold has all three.
- The stage is **360 × 640 CSS px** (9:16): `<body>` is laid out at exactly
  that size and PageWell scales it to the screen like a video. **Design for
  exactly that size.** No media queries, no `vw` maths, no scaling yourself.
  The window around it (`innerWidth`, `vw`) is whatever the screen gives — never
  read it.
- **Event coordinates are window coordinates.** Use `pagewell.point(event)` for
  `{x, y}` on the stage (0–360 × 0–640; touch events work too), or for a
  canvas `(e.clientX - rect.left) * 360 / rect.width`.
- **Safe zone: y 48–592.** On most phones the stage fills the width and up to
  48 px at the top and at the bottom are cut off. The style already pads every
  slide and places the game's screens and HUD inside it; anything you draw
  yourself keeps text, buttons and scores between y = 48 and y = 592.
  `pagewell.visible` tells you `{top, bottom}`.
- Images: a relative path next to the file (`publish` uploads it), `data:`, or
  inline SVG. Keep each under 300 KB and the HTML under 1 MiB — it must open in
  about a second on a phone.
- Video: `<video src="clip.mp4" muted playsinline loop>` only. Without `muted`
  and `playsinline` in-app browsers jump to full screen; `check` fails it.
- `localStorage` works but **only in memory** — it is gone when the page
  closes. Say "best this session", never "all-time".
- The artifact rules still apply: no `fetch`, no `<form>`, no second page, no
  remote scripts, and a `<noscript>` that says what it is.

## The style — `stage-1`

PageWell adds the style when it serves the page (and in `pagewell preview` and
`pagewell export`): every size, colour, font and entrance animation. Your file
holds content, `data-layout`, `data-tone` and the style's classes.

**Write no CSS for colours, fonts or font sizes.** `pagewell check` warns about
every colour (`#hex`, `rgb()`, `hsl()`, a colour name) in CSS, in SVG
attributes and in scripts, every `font-family`, every font size off the scale,
and every layout or tone the style does not have — fix each one. Colours are
PageWell's own only; variety comes from alternating layouts and tones.

| | |
|---|---|
| Tones (`data-tone`) | `ink` (dark, the default) · `pine` (brand green; cover and end by default) · `paper` (light) · `mint` (light green). On a slide, or on `<body>` for a whole game |
| Layouts (`data-layout`, story) | `cover` (slide 1: kicker, title, hook — words low, a dot field or an `.art` drawing above) · `statement` (one 42 px line under an accent rule) · `number` (kicker, `.big`, what it means) · `quote` (`<blockquote>` + `<cite>`) · `figure` (kicker, headline, `svg.art`, `.note`) · `image` (an `<img>` or muted `<video>` first, words on a dark fade) · `end` (the line to remember) · none (a centred column) |
| Text | `.kicker` (mono, upper case) · `h1` · `h2` · `h3` · `.lead` · `p` · `.note` · `.big` (a number; its unit in `<small>`) · `<mark>` / `.hl` for one phrase · `.foot` (a source line at the bottom) |
| Blocks | `.chips` > `.chip` · `.card` · `.stats` (2 × 2: `<div><span class="v">48</span>label</div>`) · `.bars` (`<li style="--v:72%">Label <b>72%</b></li>`) · `.steps` (`<li><b>Step</b>detail</li>`) · `.points` · `.vs` (two cards; the first is the subject) |
| Drawings | inline `<svg class="art" viewBox="…">`; shapes use `fill="currentColor"` or `stroke="currentColor"` with a class `c-1` … `c-4` (four data colours) or `c-ink`, `c-dim`, `c-line`, `c-accent`. Inline `style="fill: var(--pw-c2)"` works too |
| Motion | the style brings every slide's children in, one after another. Add only `draw` (an SVG line draws itself; give it `pathLength="1"`), `pop` or `pulse`; `style="--d: .8s"` delays it |
| Game | `canvas.field` · `[data-screen="start"]` / `[data-screen="over"]` · `.hud` > `.score`, `.stat`, `.icon-btn` · `.btn` / `.btn.ghost` · `.toast` |
| Type scale | 14 · 17 · 20 · 24 · 30 · 42 · 64 · 96 px — nothing in between, nothing smaller than 14 |
| CSS variables | `--pw-bg` `--pw-surface` `--pw-raise` `--pw-ink` `--pw-ink-2` `--pw-dim` `--pw-line` `--pw-accent` `--pw-strong` `--pw-c1`…`--pw-c4` `--pw-font` `--pw-mono` — for the rare rule of your own (a position, a size of a drawing) |

For a canvas (it cannot read CSS variables): `pagewell.colors` gives
`{bg, surface, raise, ink, ink2, dim, line, accent, accentInk, strong, c1, c2, c3, c4}`
for the current tone, and `pagewell.font` the font stack —
`ctx.font = '700 24px ' + pagewell.font`. After writing a number into a
`.big` that was hidden (a game's final score), call `pagewell.fit()`: a number
too long for the stage steps down a size instead of overflowing.

## story

```html
<section data-slide data-layout="cover">
  <p class="kicker">Physics in eight slides</p>
  <h1>Why is the sky blue?</h1>
  <p class="lead">Sunlight is white. The air picks out the blue.</p>
</section>
<section data-slide data-layout="number">
  <p class="kicker">Air</p>
  <p class="big">1,000<small>×</small></p>
  <p class="lead">Air molecules are over a thousand times smaller than a wave of light.</p>
</section>
<section data-slide data-tone="paper">
  <h2>At sunset, the path is long</h2>
  <ol class="steps"><li><b>Light crosses far more air</b></li><li><b>The blue scatters away</b></li></ol>
</section>
<section data-slide data-layout="end">
  <h2>Tiny things scatter short waves.</h2>
</section>
<noscript>The whole story in one paragraph.</noscript>
```

- **One `<section data-slide>` per screen**, in order. Each fills the stage;
  only one shows at a time. Give each one layout and, if it should not be
  dark, one tone. **Never two slides in a row with the same layout and the
  same tone** — that is what makes a story read as a slideshow.
- **The cover is also the link preview.** PageWell photographs the first slide
  (after its entrance animations finish) and puts it in the card X, WeChat and
  Slack show for the link. Make it readable at a glance: a short title, a
  one-line hook, nothing important in the bottom-right corner (a small play
  badge sits there on the card).
- 3–12 slides is the sweet spot; 20 is a lot; 40 is the limit.
- **At most 140 characters of text per slide.** Split, don't shrink.
- How long a slide stays: the length of its text (about reading time + 2 s,
  between 4 and 12 s). Set `data-duration="7"` (2–30) on a slide with a
  diagram or a number that needs a beat longer.
- `<meta name="pagewell:autoplay" content="off">` makes it a tap-through deck
  instead (slides wait for a tap). Default is autoplay.
- The progress bar sits at the top of the visible area; on a light tone
  PageWell draws it dark. Holding a finger down pauses every animation.
- JavaScript on a slide (a canvas, a counter) listens for `pagewell:slide`
  (`event.detail.index`), `pagewell:pause`, `pagewell:play`, `pagewell:end`
  on `window`. `window.pagewell` has `next()`, `prev()`, `goTo(i)`, `play()`,
  `pause()`, `restart()` and read-only `index`, `count`, `paused`.
- Buttons, links and inputs on a slide work normally (a tap on them does not
  turn the page). Mark anything else that should take taps with
  `data-interactive`.
- **Never** build your own navigation, progress bar, autoplay timer, swipe
  handling, "next" button or sound button — PageWell's are already there (and
  already work on iPhones) and two of them fight.

What the reader can do (you do not implement it): tap the right two thirds →
next, the left third → back, hold → pause, swipe → next / back, ←/→ and
Space on a keyboard. After the last slide PageWell shows Replay and Share.

## game

- **The first frame is the start screen**, in plain HTML:
  `<section data-screen="start">` with a small `svg.art` of the game, the name
  (`h1`), one line on how to play (`.lead`) and one `.btn` "Tap to start".
  Nothing moves until they tap. It is also the link preview: PageWell
  photographs it (about 0.7 s after load) for the card X shows.
- **While playing**, the field is a `<canvas class="field">` (or plain DOM)
  drawn with `pagewell.colors`, under the `.hud` (`.score`, at most two
  `.stat`s, a mute `.icon-btn` with `data-interactive`). **The score, titles
  and messages are HTML, never drawn on the canvas**; a passing message is a
  `<p class="toast">` added to the body and removed after 0.9 s.
- **Game over** is `<section data-screen="over">`: the verdict as a `.kicker`,
  the score in `.big` (then `pagewell.fit()`), "Best this session" in `.note`,
  and "Play again"; a tap restarts without reloading. (Restart in PageWell's
  bar reloads the stage — that is for when something went wrong, not the
  normal loop.) The script only flips `hidden` on these three pieces.
- **Playable with one thumb** using `pointerdown` / `pointermove` /
  `pointerup` (they cover a finger and a mouse), **plus a `click` fallback**
  (below). Keyboard is a bonus. No long-press, no two fingers, no hover.
  PageWell already stops the page from scrolling, zooming or selecting text
  under the thumb.
- **Keep the bottom-right 60 × 60 px free**: PageWell's floating button sits
  there. No buttons or score in that corner (stories too).
- **Pause** your loop on `pagewell:pause` and resume on `pagewell:play`
  (PageWell sends them when the page is hidden or a menu covers the stage).
- **Crisp canvas**: size the backing store to `360 × pagewell.pixelRatio` by
  `640 × pagewell.pixelRatio`, `ctx.setTransform(pr, 0, 0, pr, 0, 0)`, and
  redo it on `pagewell:resize`. The scaffold does this.
- **Sound**: create or `resume()` the `AudioContext` in a `pointerup` /
  `touchend` / `keydown` listener. On a touch screen `pointerdown` is not a
  user gesture, and a context made there stays silent (on iOS, for good).
  Play effects from anywhere after that.
- A light game: `<body data-tone="paper">` (or `mint`).

## Sound

- **A story can speak.** Write each slide's spoken line in `data-narration`
  and run `pagewell voice story.html`: it makes the audio with Qwen TTS, saves
  it next to the page and writes `data-voice` and `data-duration` on the slide,
  so the slide stays as long as its line. On the web a voiced story opens
  silent — browsers allow no sound before a tap — and PageWell shows a sound
  button under the progress bar, top right; one tap turns the narration on
  from where the slide is. Captions of the line being said (from
  `data-narration`) show at the bottom, on by default, with a CC button to
  turn them off; videos always have them. Never add your own sound button,
  captions, `<audio controls>` or autoplaying audio to a story. Only when they ask for a voice:
  `references/voice.md`.
- **A game** makes its own sound effects (an `AudioContext` unlocked on
  `pointerup`, above) and can have voice lines:
  `<audio data-say="go" data-narration="Ready… go!"></audio>`, made by
  `pagewell voice game.html` and played with `pagewell.say('go')` — it plays
  nothing until the player's first tap. Its mute button mutes the lines too.

## Phone rules

A page that works in a desktop browser or a simulator can still break on a
phone. `pagewell check` flags the first block; fix every flag.

| Never | Because | Write instead |
|---|---|---|
| `vw` `vh` `dvh` `svh` `vmin` `cqw` in CSS | they measure the browser around the stage, which differs in X, WeChat, Safari | px against the 360 × 640 stage |
| `tan()` / `atan2()` (or any CSS math) to scale | wrong on real iPhones | nothing — PageWell scales the stage |
| `innerWidth`, `innerHeight`, `screen.*`, `visualViewport` | different in every in-app browser | the numbers 360 and 640 |
| canvas sized by `devicePixelRatio` alone | ignores the stage scale: blurry | `pagewell.pixelRatio` |
| `AudioContext` made in `pointerdown` | silent forever on iOS | make / `resume()` it in `pointerup`, `touchend`, `keydown` |
| `alert` / `confirm` / `prompt` | the sandbox has no dialogs: nothing shows, the game hangs | draw it on the stage |
| `requestFullscreen` | missing on iPhone and in X | leave it to PageWell's ⋯ |
| a page without the style and without a background colour on `body` (or on each slide) | the space around the stage on a screen that is not 9:16 is filled with the page's own colour — without one it is black bars | declare the style (it gives every slide and the body a background) |
| `clientX` / `pageX` used as stage coordinates | the stage is scaled; window coordinates land somewhere else | `pagewell.point(event)` |
| drags or swipes handled with `pointermove` only | on iPhones the in-app browser takes horizontal drags over: the page gets `pointercancel`, never `pointerup`, and nothing moves | on touch devices use `touchstart` / `touchmove` / `touchend` and call `preventDefault()` in `touchmove` (listener with `{ passive: false }`); keep pointer events for the mouse |
| a game that handles `pointerdown` but not `click` | where only a `click` arrives (a keyboard, some in-app browsers) a tap does nothing | the `pointerdown` + `click` fallback below |

`check` cannot see these, so write them right the first time:

- **Tap targets at least 44 × 44 px**, 8 px apart (the smallest phone shows
  the stage at 80 %). The style's `.btn` and `.icon-btn` already are.
- **The first frame is plain HTML that is visible without JavaScript** — the
  start screen or cover is not hidden waiting for a script.
- **Act on `pointerdown` and call `preventDefault()`, and add a `click`
  fallback** that acts only when no `pointerdown` came just before (a keyboard,
  or an in-app browser that sends only `click`). Without it, a tap there does
  nothing:

  ```js
  let downAt = -1e9;
  el.addEventListener('pointerdown', (e) => { downAt = e.timeStamp; e.preventDefault(); act(); });
  el.addEventListener('click', (e) => { if (e.timeStamp - downAt > 700) act(); });
  ```
- No hover, no long-press, no two fingers; nothing to swipe within 24 px of
  the stage edges (that is the browser's and X's back gesture).
- **When you hand it over, ask the user to open the link on their phone** —
  in X, in WeChat / Feishu, in Safari — and tap through once. Say that a
  desktop preview cannot prove it works on a phone.

## Recording a video

`pagewell record story.html` plays the page in OBS Studio on this computer and
saves a 1080 × 1920 MP4 of the page alone — no player, no floating button, no
progress bar, no sound button — for Douyin, TikTok, Reels, Shorts or X. A story
plays itself (with its voice); a game is played by a person in an OBS window.
Check the computer first with `pagewell record story.html --check`. Everything
else: `references/recording.md`.

## Check, preview, publish

```
pagewell check story.html --json
pagewell preview                  # opens in the same player as the published page
pagewell publish story.html --json
```

Publishing one needs an account: anonymous pages run no scripts, so
`--anonymous` refuses a story or a game. Not signed in → say so and offer
sign-in (free); do not offer anonymous.

`check` adds the stage rules to the artifact ones: the display value, the
style and everything written around it (colours, fonts, font sizes, layouts,
tones), the viewport, `data-slide` count and length, `data-duration`, video
attributes, the phone rules above, the voice (a `data-narration` with no audio
yet, a voiced slide with no `data-duration`, a voice line with no `src`) and
(for a game) that something listens to pointer events. Fix every warning before
publishing.

## What to tell the user

Say it is a vertical story (or game) that plays full screen on a phone, as a
centred phone on a computer, and the same inside X, in PageWell's own look.
When they post the link on X, the card shows the first screen inside a phone,
with a "Story" / "Game" label — it is ready a few seconds after publishing. A
link that was already posted on X keeps its old card for a while; adding
`?v=2` makes X fetch a new one. Mention that it is sandboxed and offline by
design, and — for a game — that scores last only while the page is open. Ask
them to open it on their phone once (X, WeChat / Feishu, Safari). If they might
post it as a video (Douyin, TikTok, Reels), say in one line that
`pagewell record` can turn it into a 1080 × 1920 MP4 with OBS on their computer.
