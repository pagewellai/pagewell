# Recording a story or a game as a video (OBS)

`pagewell record` turns a story or a game into a vertical **1080 × 1920 MP4**
(9:16) — the size Douyin, TikTok, Reels, Shorts, X and WeChat Channels expect.
It plays the page in **OBS Studio** on this computer, driving OBS through its
own remote control (the OBS WebSocket server), and saves the file next to the
page. No account, nothing uploaded.

The video holds **the page only**: no PageWell player, no floating button, no
progress bar, no sound or caption button. A story plays from its finished cover (the first
frame, which apps use as the thumbnail) to its last slide on its own clock, with
its narration if it has one (`references/voice.md`) and captions of that
narration, always on. A game is played by a
person, in an OBS window.

## When

When they ask for a video: an MP4, a clip, "record it", "export it as a
video", "录成视频", "导出视频", "发抖音 / 视频号 / TikTok". Only a `story` or a
`game` can be recorded — anything else answers `not_stage` (an article has no
timeline to play). If the video should speak, run `pagewell voice` first.

## 1 · Check the computer

```
pagewell record story.html --check --json
```

It changes nothing and opens nothing. `ready: true` → go on. Otherwise relay
`steps`, in order; each is a minute's work for the user:

| `steps` says | The user |
|---|---|
| OBS Studio is not installed | installs it, free, from obsproject.com (on a Mac `brew install --cask obs` works too) and opens it once |
| the WebSocket server is off | in OBS: **Tools → WebSocket Server Settings → tick “Enable WebSocket server”** → OK |
| OBS asks for a password | usually nothing: pagewell reads the password from OBS's own settings on this computer. If it still fails, they put `OBS_WEBSOCKET_PASSWORD` in their shell profile, or untick “Enable Authentication” there |
| OBS is busy | stops their own recording, stream or virtual camera in OBS |
| a recording may come out black (macOS) | OBS → Settings → Advanced → Sources → unticks “Enable Browser Source Hardware Acceleration”, restarts OBS — only needed if it happens |

OBS not running is fine: `record` opens it by itself. After they change
something, run `--check` again. The result's `page` says what will be recorded:
slides, the estimated length (`estimated_seconds`), where the file goes.

## 2 · Record

```
pagewell record story.html --json     # → story.mp4 next to the page
pagewell record game.html --json
```

- **A story** takes about as long as it plays (`estimated_seconds` plus a few
  seconds). If your harness limits how long a command may run, run it in the
  background and collect it when it is done.
- **A game needs a player.** Before running it, tell them:

  > An OBS window called “Interacting with 'PageWell Stage'” will open with the
  > game. Play one round in it with the mouse; the recording stops 3 seconds
  > after the game-over screen — or press Stop Recording in OBS.

  The seconds before they start playing are paused out of the video, and so are
  the pauses between rounds. `--rounds 3` records three rounds; `--max 5m` caps
  the length (10 minutes by default).
- `-o clip.mp4` names the file. `--size 720x1280` (or `1440x2560`,
  `2160x3840`) changes the resolution; `--fps 60` makes motion smoother.
- Ctrl-C stops early and keeps what was recorded (`complete: false`).

What it does to OBS, and why that is safe: it switches the canvas to the video
size, adds one scene (“PageWell Recording”) with one browser source showing the
page, mutes the other audio sources (microphone, desktop audio), points the
recording folder at the page's folder and records MP4 — then puts **every one of
those back** and removes the scene. It never touches an OBS that is already
recording, streaming or running its virtual camera (`obs_busy`), and never stops
anything it did not start.

## 3 · Report

Read back `file`, `seconds`, `bytes`, the size (`width` × `height`) and `audio`
(`narration`, `game` or `silent`). When `complete` is false, say why
(`stopped_by`: `obs` — someone pressed Stop in OBS; `max`; `interrupt`;
`obs_exit`). Read every `warnings` and `page_errors` entry out — a page error
usually explains a story that stopped moving. Ask them to watch it once before
posting.

## Hard rules

| | |
|---|---|
| The OBS password | Never ask for it in the chat. pagewell reads it from OBS on this computer; for OBS on another computer (`--obs-url ws://…`) the user sets `OBS_WEBSOCKET_PASSWORD` themselves |
| `obs_busy` | Never stop their recording or stream yourself — ask them to, then run again |
| A game | A person plays it. Say so before running, and never claim a game recorded itself |
| `obs_black_frames` | Relay the hardware-acceleration step; do not retry in a loop |
| The video file | It stays on this computer. `publish` does not take video; do not upload it anywhere they did not ask for |
