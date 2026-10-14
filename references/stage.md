# Vertical pages: `story` and `game`

Two kinds of running page that PageWell **plays** instead of laying out:

- **story** — a sequence of full-screen vertical slides that advances on its
  own, like a short video or Instagram Stories. Tap to go on, hold to pause.
- **game** — a small game on a vertical stage, played with one thumb.

Both open the same way everywhere: full screen on a phone, a centred phone on a
computer, and the same inside X's in-app browser. PageWell adds its own
controls: a bar under a story (its mark on Free accounts, the author, ⋯), and
for a game a small floating button in the bottom-right corner that opens the
same bar. You write only what happens on the stage.

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
  `<meta name="pagewell:display" content="story">` (or `game`), plus
  `<meta name="viewport" content="width=360">`. The scaffold has both.
- The stage is **360 × 640 CSS px** (9:16). Inside it `innerWidth` is 360 and
  `innerHeight` is 640 on every device; PageWell scales the whole stage like a
  video. **Design for exactly that size.** No media queries, no `vw` maths, no
  scaling yourself.
- Text at least 14 px; headlines 28–44 px. The smallest phone shows the stage
  at 80 %.
- System fonts only (`-apple-system, "Segoe UI", Roboto, "Noto Sans", "PingFang SC", sans-serif`).
  Web fonts are not allowed to load, and Chinese fonts are megabytes.
- Images: a relative path next to the file (`publish` uploads it), `data:`, or
  inline SVG. Keep each under 300 KB and the HTML under 1 MiB — it must open in
  about a second on a phone.
- Video: `<video src="clip.mp4" muted playsinline loop>` only. Without `muted`
  and `playsinline` in-app browsers jump to full screen; `check` fails it.
- `localStorage` works but **only in memory** — it is gone when the page
  closes. Say "best this session", never "all-time".
- The artifact rules still apply: no `fetch`, no `<form>`, no second page, no
  remote scripts, and a `<noscript>` that says what it is.

## story

```html
<section data-slide>…cover: title + one-line hook…</section>
<section data-slide data-duration="7">…one idea…</section>
…
<section data-slide>…the line to remember…</section>
<noscript>The whole story in one paragraph.</noscript>
```

- **One `<section data-slide>` per screen**, in order. Each fills the stage;
  only one shows at a time. Lay it out yourself (absolute positioning or flex).
- 3–12 slides is the sweet spot; 20 is a lot; 40 is the limit.
- **At most 140 characters of text per slide.** Split, don't shrink.
- The **top 28 px** belong to the progress bar — start text at y ≥ 32. Keep
  text 20 px from the sides.
- How long a slide stays: the length of its text (about reading time + 2 s,
  between 4 and 12 s). Set `data-duration="7"` (2–30) on a slide with a
  diagram or a number that needs a beat longer.
- `<meta name="pagewell:autoplay" content="off">` makes it a tap-through deck
  instead (slides wait for a tap). Default is autoplay.
- **Animate with CSS under `[data-active]`** — it is set on the slide that is
  showing, and entrance animations replay every time the slide comes back:

  ```css
  @media (prefers-reduced-motion: no-preference) {
    [data-active] h2 { animation: rise .6s .1s both; }
  }
  ```

  Holding a finger down pauses every CSS animation for you.
- JavaScript on a slide (a canvas, a counter) listens for `pagewell:slide`
  (`event.detail.index`), `pagewell:pause`, `pagewell:play`, `pagewell:end`
  on `window`. `window.pagewell` has `next()`, `prev()`, `goTo(i)`, `play()`,
  `pause()`, `restart()` and read-only `index`, `count`, `paused`.
- Buttons, links and inputs on a slide work normally (a tap on them does not
  turn the page). Mark anything else that should take taps with
  `data-interactive`.
- **Never** build your own navigation, progress bar, autoplay timer or
  "next" button — PageWell's are already there and two of them fight.

What the reader can do (you do not implement it): tap the right two thirds →
next, the left third → back, hold → pause, swipe → next / back, ←/→ and
Space on a keyboard. After the last slide PageWell shows Replay and Share.

## game

- **The first frame is a start screen**: the name, one line on how to play,
  "Tap to start". Nothing moves until they tap.
- **Playable with one thumb** using `pointerdown` / `pointermove` /
  `pointerup` (they cover a finger and a mouse), **plus a `click` fallback**
  (below). Keyboard is a bonus. No long-press, no two fingers, no hover.
  PageWell already stops the page from scrolling, zooming or selecting text
  under the thumb.
- **Keep the bottom-right 60 × 60 px free**: PageWell's floating button sits
  there. No buttons or score in that corner.
- **Game over shows the score and "Tap to play again"**; a tap restarts
  without reloading. (Restart in PageWell's bar reloads the stage — that is for
  when something went wrong, not the normal loop.)
- **Pause** your loop on `pagewell:pause` and resume on `pagewell:play`
  (PageWell sends them when the page is hidden or a menu covers the stage).
- **Crisp canvas**: size the backing store to `360 × pagewell.pixelRatio` by
  `640 × pagewell.pixelRatio`, `ctx.setTransform(pr, 0, 0, pr, 0, 0)`, and
  redo it on `pagewell:resize`. The scaffold does this.
- **Sound**: create or `resume()` the `AudioContext` in a `pointerup` /
  `touchend` / `keydown` listener. On a touch screen `pointerdown` is not a
  user gesture, and a context made there stays silent (on iOS, for good).
  Play effects from anywhere after that; give a mute button with
  `data-interactive`.

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
| no background colour on `body` (or on each slide) | the space around the stage on a screen that is not 9:16 is filled with the page's own colour — without one it is black bars | one opaque `background-color` on `body`; gradients and pictures stay inside the stage |
| a game that handles `pointerdown` but not `click` | where only a `click` arrives (a keyboard, some in-app browsers) a tap does nothing | the `pointerdown` + `click` fallback below |

`check` cannot see these, so write them right the first time:

- **Tap targets at least 44 × 44 px**, 8 px apart (the smallest phone shows
  the stage at 80 %).
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
viewport, `data-slide` count and length, `data-duration`, video attributes,
the phone rules above, and (for a game) that something listens to pointer
events.

## What to tell the user

Say it is a vertical story (or game) that plays full screen on a phone, as a
centred phone on a computer, and the same inside X. When they post the link on
X, the card shows a "Story" / "Game" badge. Mention that it is sandboxed and
offline by design, and — for a game — that scores last only while the page is
open. Ask them to open it on their phone once (X, WeChat / Feishu, Safari).
