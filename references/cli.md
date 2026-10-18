# CLI reference

Every command takes `--json` and `--endpoint`. The `--json` shape is stable and
error codes are a fixed enum that is **never translated**.

## doctor

```
pagewell doctor [--skill-version vMAJOR.MINOR.PATCH] [--json]
```

The skill always runs this first on every activation and passes its own
published `metadata.version` through `--skill-version`; checking is automatic,
read-only, and does not wait for a user request. Returns
`{version, endpoint, reachable, authenticated,
project_config, credentials_path, update, skill_update?}`.
If `reachable` is false, check `--endpoint` before anything else.

`update` is `{current, latest, min, available, required}`: `available` means a
newer release exists; `required` means this copy is older than the oldest
version still supported — commands keep working, but upgrade before going on.
`latest` is absent when the server has not looked yet; then nothing is implied.

`skill_update`, when present, is `{current, latest, available, command?}`. It
compares the activated SKILL.md with the newer of the running CLI and the
published release. When `available` is true, run `command` and re-read SKILL.md.
For the global install shown in the README the command is
`npx skills update pagewell -g -y`. Inside DeepSeek Harness, with the skill
installed as a plugin (the profile in `DSH_PROFILE` lists `pagewell-skill`), it
is `dsh plugin --profile <profile> add github:pagewellai/pagewell`. That
needs `dsh` and `pnpm` on PATH (for the `desktop` profile, the `dsh` command
the desktop app installs); when they are not there or the command fails, the
user updates PageWell from the Plugins page instead.

## upgrade

```
pagewell upgrade [--check] [--force] [--json]
pagewell version [--json]
```

Updates to the latest release. When the skill was installed by `git clone`,
it fast-forwards that clone and re-runs its `scripts/install.sh`, so **SKILL.md
and the binary move together**; the result says `skill_changed: true` when the
skill text or references changed — re-read them before continuing. Otherwise it
downloads the binary for this machine (from the repository's `binaries` branch),
verifies it against `SHA256SUMS`, and replaces itself; the result then says
`method: "binary"` and, when the skill text still needs refreshing, `skill_update`
holds the command that does it — `npx skills update pagewell -g -y` for a skill
installed with `npx skills add`, the `dsh plugin … add` command for the
DeepSeek Harness plugin. Run it, then re-read SKILL.md.

If an older CLI rejects `--skill-version`, upgrade the CLI and repeat `doctor`.
That is the only bootstrap exception; released current versions always report
both update states in one request.

`--check` only reports (`{current, latest, min, available, required}`) and
never changes anything. Versions are semver tags (`v0.3.1`); `version` prints
the running one.

You do not need to poll: every command that reaches the server is told the
current version in the response, and once a day (every run when below the
supported floor) a line goes to **stderr** — stdout stays JSON under `--json`.
`PAGEWELL_NO_UPDATE_NOTICE=1` silences it.

## auth

```
pagewell auth login  [--scopes …] [--name …] [--wait=false] [--device-code …] [--json]
pagewell auth status [--json]
pagewell auth logout [--json]
```

`--scopes` defaults to `space:read,space:write,share:manage,billing:read`.
**There is no `billing:write`** — it does not exist, and agents must not complete
payments. `config:manage` has to be asked for explicitly. `backup:manage` (app
backups, such as X Copilot's) is for native apps, not agents: the user creates
that token on the console's Agent tokens page and pastes it into the app — do not
request it from `auth login`.

`--wait=false` prints `verification_url`, `user_code` and `device_code`, stores
nothing and exits, so you can hand the URL and code over first. Read both out,
then wait for **that** code:

> Open **pagewell.ai/device** and enter **WDJH-4KQP**. I'll wait here.

```
pagewell auth login --json --device-code <device_code>
```

`--device-code` polls the code the first call printed until it is approved,
denied or expired (15 minutes), then stores the token. The token itself lasts
**60 days**; `pagewell auth status` shows when it expires (`expires_at` in
`--json`), and every command prints a one-line reminder on stderr in its last
7 days. Sign in again before then to keep working. Without it, `auth login`
starts a **new** code, which is the right thing only when you show its output as
it arrives. `--device-code` with `--wait=false` is refused.

A call that will store a token first checks that it can write
`~/.config/pagewell/credentials.yaml`, and refuses with `credentials_unwritable`
before starting or polling anything. That is what an agent sandbox limited to
the project directory produces (DeepSeek Harness `workspace-write`, Codex):
rerun the same command with the harness's permission to write outside the
project. Nothing was spent, so the user approves only once. Do not redirect
`PAGEWELL_CONFIG_HOME` into the project.

⛔ **In either mode, never approve on the user's behalf.** Do not open a browser
and click confirm, do not ask for or fill in any credential. Approval happens in
the user's own browser, always. It is also enforced: the approval endpoint only
accepts a session cookie, and you only have a bearer token.

Once you have an identity, **say whose it is before the first write** —
"Signed in as liu@example.com (8.8 GiB free)". People with more than one account
really do push to the wrong space, and one sentence prevents it.

`auth logout` only deletes the local credential file. To actually **revoke** a
token (say you suspect it leaked), the user revokes it under
Settings → Agent tokens.

## init

```
pagewell init [--source .] [--space <id>] [--title <name>] [--json]
```

Only for keeping a folder in sync with a Space **the user named**. `--space`
targets an existing one (`pagewell spaces` lists them); `--title` creates a new
one with the name they gave. With neither it refuses (`validation_failed`) and
creates nothing — it used to name a new Space after the current directory, which
is how an article once ended up in a Space called `article`. To publish a piece,
use `publish`: it goes to Documents. Spaces require Pro. Writes `.pagewell.yaml`
and **never writes a credential into it**.

## publish

```
pagewell publish <file|-> [--space id] [--title t] [--path p]
                          [--visibility public|unlisted|code|password] [--password …]
                          [--expire 7d] [--allow copy,print]
                          [--extract-assets=false] [--no-share] [--no-index]
                          [--node <node_id|link>] [--json]
pagewell publish <file|-> --anonymous [--path p] [--json]
```

One file in, one link out — this is how a piece gets published. Unless `--space`
is explicit, it writes to the account's internal **Documents** container (the
Documents list in the workbench), which is not shown as a Space; uploads; and
makes the page public/searchable. Pass `--space` only when the user named the
Space. `.pagewell.yaml` does not redirect this one-file command into a Space.
`-` reads standard input, which is what you want when the document is a string
you just produced rather than a file on disk; with `-` the format defaults to
HTML, so pass `--path draft.md` for Markdown.

**Each publish is a new page** in Documents: its own internal place
(`/_direct/…`, never shown), titled from the document (front matter `title`, its
heading, or `<title>`) unless `--title` says otherwise. It never replaces another
page, even when two drafts are both `draft.md` — it used to, by file name.
`--node <node_id|link>` updates an existing page in place instead: the
`node_id` from an earlier publish's JSON, or the page's own `/s/…` link; the link
stays the same. In a Space, add `--space` (there, without `--node`, the file name
or `--path` is the page's place, as it always was).

**Local images and files go with it.** Every relative reference in the
document — `![](img/arch.png)`, `[report](files/q3.pdf)`, `<img src>` — is read
next to the document and uploaded under the key the server resolves from it
(the same list the server builds when it ingests the page). Only files inside
the document's folder, not hidden, of the types `push --assets` takes, and no
symlinks: a document someone else wrote can reference `../../.ssh/id_rsa`, and
the page is public. The JSON says `assets` (how many went up) and lists the rest
in `missing_assets` (`[{ref, reason}]`) — read those out; on the page they are
broken images.

**Not signed in**, it answers `unauthenticated` with a hint to ask the user
whether to publish anonymously or sign in. Ask; never choose for them.

**`--anonymous`** publishes without an account: one file up to 1 MiB, five per IP
per UTC day, and the link disappears after 24 hours (`expires_at`). It never
sends a token, even when signed in. It refuses a document that references local
files (it names them — sign in to send them, or take them out; `data:` images
inside the file are fine), a story, a game or any page marked
`pagewell:kind=artifact` (anonymous pages run no scripts — sign in for those;
other HTML with scripts or its own styles comes back `validation_failed` from
the server), and any flag that needs an account (`--space`,
`--title`, `--visibility`, `--password`, `--expire`, `--allow`, `--no-share`,
`--no-index`). The JSON has `anonymous: true`, `url`, `expires_at` and `limits`.
An anonymous page cannot be updated in place: publishing again makes a new link.

`--extract-assets` (on by default, HTML only) pulls inline `data:` images over
1 KiB out into content-addressed files. A generated page usually carries four or
five of them; leaving them inline costs the document's 5 MiB budget and makes
every edit re-download all of them.

The `--json` carries `render_mode` and `reason` — **read them out**. An HTML page
with a `<script>` runs sandboxed, so search engines see the summary only.

`--visibility` defaults to `public`. It is a permanent document setting, not a
share: it has no password, expiry or per-link permissions, and the command
returns the stable `public_url`. `--visibility unlisted|code|password` first
keeps the page itself private and then creates the requested share. `--no-share`
uploads and pins the page private.

Whether a public page is **searchable** is a separate switch the owner controls
per page, per space and for the whole account (default on). `--no-index` turns it
off for this page: it keeps its address and anyone with the link can read it, but
it carries `noindex` and stays off the sitemap and Explore (the owner's profile
still lists it). Without `--no-index` the page follows its space and account, so
always read `searchable` from the JSON instead of assuming it.

**Public pages already have an address.** Every space has a permanent public
address (`address_url` on the space, `/s/<8 chars>`), and every page that is
currently public has its own: `public_url` on the node, `/s/<32 letters>` — no
space, no path in it, so renaming or moving the page never breaks the link.
A space the owner has set to **public** is readable at its address with no share
at all, and its pages show up on Explore. `publish` defaults the page itself to
public even inside a private Space and prints the page's own address
(`"visibility": "public", "searchable": true` in JSON — `false` when the owner
turned search indexing off, or with `--no-index`). HTML artifacts remain
sandboxed, so search engines index their title and summary rather than the
iframe body.

**When a page has no address.** In a public space a page can still lack a
`public_url`: either the owner set that one page private, or PageWell **took it
down** (moderation). A taken-down page answers 404 at every address and every
share, and the owner sees the reason in their workbench. You can still push and
edit it; you cannot route around it — do not create a share for it and call the
problem solved.

## visibility

```
pagewell visibility <node-id> public|private|inherit [--index on|off|inherit] [--json]
```

Changes one existing document without changing its content. `public` returns
the stable public URL and makes the page eligible for Explore, public profiles,
sitemaps and search indexing. `private` pins it private; `inherit` follows the
space again. `--index off` keeps a public page out of search engines and Explore,
`--index on` lets it in even when its space or account says otherwise, and
`--index inherit` follows them again; without `--index` that setting is left as
it is. The JSON reports `searchable`. This is audited and requires `space:write`.

This is `init` + `push` + `share create` with the parts that only make sense for
a directory removed. For a tree you keep in sync, use those three.

## push

```
pagewell push [--dry-run] [--prune] [--yes] [--assets]
              [--source …] [--space …] [--base /] [--idempotency-key …] [--json]
```

- `--dry-run` runs stage one only (`sync:plan`) and **writes nothing at all**.
  The output carries `diff`, `usage` (preflight), `nodes[]` (with the path the
  *server* resolved), `needs_confirmation` and `deleted_paths`.
- `--prune` removes pages that exist remotely but not locally. It is a **soft
  delete** — they go to the space's trash, where the owner can put them back
  from the console (kept 7 days on Free, 30 on Pro, then collected). When
  anything would be deleted you must also pass `--yes`, and the error lists the
  exact paths first.
- `--idempotency-key` **must be reused across retries of the same logical push**,
  otherwise a retry becomes a second commit.
- `--assets` uploads images and other non-document files too. They do not become
  pages: they are counted separately in the diff (`files`), and a document
  reaches them by the relative path it writes. See `assets.md`.

After a successful push the CLI re-runs the plan, because by then the server has
ingested the content and can report each page's `render_mode` — which is exactly
what you need to relay to the author.

## share

```
pagewell share create [--mode unlisted|code|password]
                      [--expire 7d] [--allow copy,download,fork,print,source]
                      [--password …] [--node <id>] [--space <id>] [--json]
pagewell share list   [--json]
pagewell share revoke <id> [--json]
```

`--allow ""` and omitting `--allow` are **not the same thing**: the first means
"explicitly turn every extra permission off", the second means "use the config
default".

`source` lets readers open the **source file** — the Markdown or HTML exactly as
written — from the page's ⋯ menu (`?as=source`). It is off unless the author
turns it on, here or under "Readers may" in the space settings; `copy` alone
does not expose it.

`--mode password` without `--password` generates a readable one and reports it.

### Which mode for which phrasing

| The user said | Mode |
|---|---|
| "public", "put it online", "let people find it" | `pagewell visibility <node-id> public` (not a share) |
| "public, but keep it out of Google / search engines" | `pagewell visibility <node-id> public --index off` (not a share) |
| "for my team", "internal", "only people I send it to" | `--mode unlisted` |
| "a share code", "a passphrase" | `--mode code` |
| "put a password on it" | `--mode password --password <generate one and report it>` |

No expiry mentioned → use the config default; if there is none, `7d`, and say so.

"Don't let them copy it" → `--allow ""`, **and you must add**: this only hides
the buttons. It cannot stop anyone copying — the content is in the DOM. Never
imply otherwise; a false security promise is worse than no feature.

### Handing the link over

**Share codes are 6 characters and case-sensitive** (e.g. `7kMp2Q`). Give the
whole thing as one copyable block, and never change the case of a code —
any normalisation anywhere collapses the code space from 56⁶ to 32⁶.

```
https://p.pagewell.ai/s/7Q2MX9KD3VWZGH5N4TBPQR8S6C
Share code 7kMp2Q (case-sensitive) · valid 7 days · copying allowed
```

Three shapes of address live under `/s/`, and the length tells them apart:
a **share** is 26 characters (the link *is* the key, so it stays long), a
**page's own address** is 32 letters (`public_url`, only for public pages), a
**space's address** is 8 characters (`address_url`, opens the tree of a public
space). Never shorten or "clean up" any of them.

`share list` **does not return share codes** — the server does not send them.
A leaked listing should not equal a leak of every code.

## usage / tree / spaces

```
pagewell usage  [--files N] [--json]   # broken down: documents / files / trash
pagewell tree   [--space …]  # the remote tree
pagewell spaces              # list spaces
```

`usage --files N` adds the N largest files, which space each is in, and whether
any document still references it. That last column is the one that tells you
what is safe to delete. Over quota, the list is added automatically.

`pending cleanup` is space already freed and waiting for the nightly
collection — the answer to "I deleted things and nothing changed".

## preview

```
pagewell preview [--source DIR] [--port 4321] [--once] [--open] [--json]
```

Renders the tree locally, with the same code the server uses, and serves it.
**No network and no sign-in.**

`--once` renders, reports and exits — this is the agent-facing mode. It exits
**non-zero when anything failed to render**, so a failed publish can be caught
before it happens without parsing the output.

The `--json` shape:

```json
{"root": "docs", "docs": 12, "charts": 4, "resumes": 1, "word_count": 8130,
 "templates": {"": 11, "article": 1},
 "themes":    {"": 11, "article": 1},
 "pages": [{"rel_path": "guide/intro.md", "url": "/guide/intro", "title": "…",
            "template": "", "theme": "",
            "template_ref": "", "variant": "", "libs": ["mermaid"],
            "format": "markdown", "render_mode": "inline",
            "charts": 1, "embeds": 0,
            "word_count": 640, "reading_minutes": 3, "bytes": 4210,
            "issues": [{"rule": "length", "severity": "warn",
                        "where": "h2 #4 \"Why it happens\"",
                        "message": "1420 chars; this template wants at most 900",
                        "fix": "split the section, or move detail into a list"}]}],
 "skipped": [{"path": "…", "reason": "…"}],
 "errors":   [{"doc": "guide/intro.md", "kind": "chart",    "message": "…"}],
 "warnings": [{"doc": "guide/intro.md", "kind": "template", "message": "…"}]}
```

`issues[]` is the structured form: a rule name, a location and usually a fix.
`errors[]` and `warnings[]` carry the same problems as flat strings — CLIs and
agents already installed elsewhere read those, so both are filled.

`theme` / `themes` are the old names for `template` / `templates` and carry the
same values. Prefer the new ones; the old ones stay because CLIs already
installed elsewhere read them. An empty template is the platform look.

`errors` means something did not render — fix and re-run before pushing.
`warnings` means it rendered but probably not as intended: an unknown template
or variant name, a section outside the length the template asks for, more
chart series than palette colours, an HTML document whose isolated origin local preview cannot
reproduce.

⚠️ **Preview only knows templates installed on this machine.** A marketplace
template that is not installed falls back to the default design — and the
report says so as a warning. Run `pagewell templates add <id>` first.

Without `--once` it serves on `127.0.0.1:4321` and the page reloads itself when
files change. **The port is never chosen automatically** — if it is taken the
command fails and says so, because an address you printed that does not match
the one the user opened is the worst kind of confusion.

What is shared with the published page: the document body, the stylesheet, the
design snapshot, the components, the charts. What is not: the chrome around it.
Preview has a banner; it has no share links, no fork, no permissions — and no
template or variant picker. Each page renders with the template in its own
front matter, so what the user sees is what publishing produces. Do not tell
the user a preview URL is shareable — it is bound to their machine.

(`--template` and `--variant` still exist for old scripts: they change only what
this one run shows, never the files. Do not use them — the template is decided
when the draft is written.)

`embed` blocks do not run in local preview: they need an isolated registrable
origin with a signed URL, which a laptop cannot produce. The poster and title
are shown instead, and the report says so. Pretending they run would be worse
than saying they do not — whether the isolation actually holds is only knowable
after deploying.

## templates

```
templates list [--kind template|components] [--category c] [--lang l] [--mine] [--json]
templates show <id> [--full] [--json]
templates use <id> [--title t] [-o FILE] [--json]
templates samples <id> [--source <sample-id>]
templates preview <id>

templates new <id> [--kind template|components] [--mode prose|form|artifact] [--from <builtin-id>] [--dir D]
templates fork <src> <id> [--dir D]
templates fork --from-doc <path> <id> [--dir D]
templates edit <id> [--dir D] [--force]
templates validate <dir|id>
templates diff <id>
templates save <id> [--version v] [--message m] [--visibility private|team|public]
templates publish <id> [--public|--team] | unpublish <id> | retire <id> --yes

templates add <id>
templates remove <id> [--remote --yes]
```

**`show` is the one that matters.** Its `--json` is the tool kit: the writing
brief, the inputs to collect, the skeleton structure, the components this
template resolves to (with a copy-and-paste `syntax` for each), the checks, the
rubric and the samples. Only the components this template actually uses are
included — context is money.

`use` is `add` + `show` + `scaffold` in one call, and writes a skeleton with
`⟦…⟧` placeholders. It refuses to overwrite an existing file.

Both also carry `template.preview_url` and `template.screenshots` for a listed
template: its preview page (rendered live from its first sample) and
screenshots of that page, for someone who asks what they will get.
`templates list --json` carries the same as `preview_url`, `screenshots` and
`thumbnail_url` (the first screenshot). Offline, or against an older server,
they are absent — not an error; the same screenshots and the samples ship with
this skill in `assets/templates/<id>/`.

`validate` loads a working copy, renders every sample and runs the template's
own checks. **It fails on a doc template with no sample** — a template that
cannot demonstrate itself is one nobody will pick. `save` runs the same thing
locally before uploading, so a rejection does not cost you a round trip.

Three locations, and they are different things:

| | Where | What |
|---|---|---|
| cache | `~/.cache/pagewell/templates/<id>@<version>/` | read-only, used for rendering |
| working copy | `~/.pagewell/templates/<id>/` | the editable source (`--dir` overrides) |
| library | server-side, under your account | what `save` uploads |

Working copies are **not** in the project directory: a template follows the
person, not the checkout, and a package should not end up committed to someone
else's repository.

`retire` needs `--yes`: it stops anyone starting a new document with the
template. Documents already using it keep rendering — their design is frozen
into them.

## check

```
pagewell check [<file|dir>] [--template id] [--variant v] [--strict] [--json]
```

Runs the template's checks and nothing else. **No network, no login**, fast
enough to run after every section. Exit code is 1 when there are errors (or,
with `--strict`, warnings too) — branch on that rather than parsing the text.

Each issue carries `rule`, `severity`, `where` and usually `fix`. `where` is a
location you can go to (`h2 #4 "Why it happens"`, `paragraph #7 under "Costs"`).

Errors mean **do not publish**. Warnings are the template's opinion: read them
out to the user rather than silently cutting content to satisfy them.

## export

```
pagewell export <file> --target html [-o FILE]
                       [--inline-images] [--no-inline-libs] [--base-url URL]
```

One HTML file that **opens with no network**: the stylesheet, the design
snapshot and any hosted libraries the document uses are all inside it. It is
therefore large, and the command reports how large.

Local images are embedded as data URIs by default — a file that needs its images
to travel beside it is not a file that "opens with no network".
`--inline-images=false` keeps it small instead, and `--base-url` rewrites the
paths to absolute ones. Either way the command names any relative reference it
could not resolve, including linked attachments, which cannot be inlined and
have to travel with the HTML.

`--target` currently accepts `html`. Other targets are platform code, not
configuration; adding one needs a release.

## voice

```
pagewell voice <page.html> [--voice NAME] [--language LANG] [--model MODEL]
                           [--force] [--dry-run] [--json]
```

Reads every `data-narration` line in a story or a game aloud with Qwen TTS and
writes the audio next to the page, in `voice/`: a slide (`data-slide`) gets
`data-voice` and `data-duration`, an `<audio data-say="name">` gets `src`. The
page is rewritten in place, byte for byte except those attributes, and only when
every line succeeded. Lines whose audio already exists are reused (no network,
no cost); `--force` makes them all again. `--dry-run` uses no network and writes
nothing: it lists the lines, their characters and whether a key is present.
Guidance: `references/voice.md`.

The key comes from `DASHSCOPE_API_KEY` (or `TTS_KEY`) and never appears in the
output. `--voice` defaults to `$QWEN_TTS_VOICE`, else `Kai`; `--model` to
`$QWEN_TTS_MODEL`, else `qwen3-tts-flash`; `--language` to
`$QWEN_TTS_LANGUAGE`, else the page's `<html lang>`, else `Auto`.
`QWEN_TTS_BASE_URL` pins the endpoint; otherwise a key rejected by the Beijing
endpoint is tried once on the international one.

```json
{"file": "story.html", "voice": "Kai", "model": "qwen3-tts-flash", "language": "Chinese",
 "endpoint": "https://dashscope.aliyuncs.com/api/v1", "encoder": "ffmpeg", "key_present": true,
 "lines": [{"target": "slide 1", "chars": 17, "audio": "voice/story-s01-b9f3a357.mp3",
            "seconds": 3.44, "duration": 4.1, "status": "made"},
           {"target": "say:go", "chars": 10, "audio": "voice/story-go-5a83c517.mp3",
            "seconds": 2.0, "status": "reused"}],
 "characters": 17, "seconds_total": 5.44, "changed": true, "warnings": []}
```

`status` is `made`, `reused` or (with `--dry-run`) `planned`. `characters`
counts only what was sent this run. `encoder` is `ffmpeg` (MP3), `afconvert`
(macOS, `.m4a`) or `none` (WAV, about six times larger — a warning says so).
`unused`, when present, lists older files of this page in `voice/` that nothing
refers to any more.
Errors: `tts_key_missing`, `tts_rejected` (Qwen's own message: a bad voice, a key
that is not accepted), `tts_failed` (network or the service, after retries —
the lines made so far are kept), `validation_failed` (no `data-narration` in the
page).

## record

```
pagewell record <page.html> [-o FILE] [--size WxH] [--fps N] [--tail DUR]
                            [--rounds N] [--max DUR] [--obs-url URL]
                            [--no-launch] [--no-interact] [--json]
pagewell record [<page.html>] --check [--json]
```

Plays a story or a game in OBS Studio on this computer, through OBS's WebSocket
server, and saves a 9:16 video of the page alone. Guidance:
`references/recording.md`.

- `-o` defaults to the page's name with `.mp4`, next to it.
- `--size` is the 360 × 640 stage times 2, 3, 4 or 6: `720x1280`,
  `1080x1920` (default), `1440x2560`, `2160x3840`. `--fps` 24–60, default 30.
- `--tail` keeps recording after the end: 1 s after a story's last slide, 3 s
  after a game's last game-over screen. `--rounds` (game, default 1): stop after
  that many game-over screens. `--max` caps the recording (a story: its length
  plus a margin; a game: 10 minutes).
- `--obs-url` defaults to `$OBS_WEBSOCKET_URL`, else the port in OBS's own
  settings, else `ws://127.0.0.1:4455`. The password is `$OBS_WEBSOCKET_PASSWORD`,
  else — for OBS on this computer — the one OBS stores. OBS on another computer
  works too: it must be able to reach this one, and the video stays on that
  computer (`obs_file`).
- OBS not running → `record` opens it (`--no-launch` does not).
  `--no-interact` keeps OBS's Interact window closed for a game.

`--check` changes nothing:

```json
{"ready": false, "steps": ["In OBS: Tools → WebSocket Server Settings → tick “Enable WebSocket server” …"],
 "obs": {"url": "ws://127.0.0.1:4455", "local": true, "installed": true, "app": "/Applications/OBS.app",
         "running": true, "websocket": {"enabled": false, "port": 4455, "auth_required": true},
         "password_from": "obs", "connected": false, "error_code": "obs_websocket_off"},
 "ffmpeg": true,
 "page": {"file": "/…/story.html", "display": "story", "slides": 8, "voiced": 8,
          "estimated_seconds": 46.2, "output": "/…/story.mp4", "width": 1080, "height": 1920}}
```

When connected, `obs` also has `version`, `websocket_version`,
`browser_source` and `busy`. The exit code is 1 when `ready` is false.

A recording:

```json
{"file": "/…/story.mp4", "bytes": 14464169, "seconds": 46.8, "width": 1080, "height": 1920, "fps": 30,
 "display": "story", "slides": 8, "audio": "narration", "stopped_by": "end", "complete": true,
 "obs": "OBS 32.2.2 (obs-websocket 5.7.4)", "warnings": []}
```

`audio` is `narration`, `game` or `silent`; a game adds `rounds`. `stopped_by`
is `end` (the story finished), `game_over` (the rounds were played), `obs`
(someone pressed Stop Recording), `max`, `interrupt` (Ctrl-C — what was recorded
is kept) or `obs_exit`. `page_errors` lists script errors the page threw while
it played. A few progress lines go to stderr.

## brand

```
pagewell brand show [--json]
pagewell brand set <token>=<value> …
pagewell brand clear
```

A set of token overrides applied to **every** document rendered on this machine.
It sits between the template and each document's own front matter, so it changes
colour, type and logo without freezing anyone's layout.

An unknown token name is an error rather than being ignored — a typo that
silently does nothing is how someone concludes the feature is broken.


## x (X Article drafts)

```
pagewell x draft <file.md|-> [--title t] [--cover img.png] [--dry-run] [--json]
pagewell x connect [--wait=false] [--json]
pagewell x status [--json]
pagewell x disconnect [--json]
```

`x draft` turns one Markdown file into an **X Article draft** on the user's own X
account. It never publishes — there is no command for that, on purpose; the
user reviews the draft on X and posts it from there.

`--dry-run` converts locally with the same converter the server uses, sends
nothing and needs no sign-in. Its JSON has `title`, `blocks`, `block_kinds`,
`images` (each with a `status`: `ok`, `inline`, `remote` = downloaded when
sending, `missing`, `unreachable`, `too_large`, `unsupported`), `warnings`, and
the exact `draft` body X would receive (images carry placeholder ids).

What maps natively: headings (the two shallowest levels; deeper ones become
bold lines), paragraphs with bold / italic / strikethrough / links, lists
(nested items stay inside their parent item, one line each), quotes and
callouts, fenced and indented code, tables, `$$…$$` and ` ```math ` formulas,
images, `---` dividers, a paragraph that is only an X post link (embedded),
footnotes (listed after a divider). Components: `cover` becomes the title and
cover image, `stats` / `timeline` lists, `steps` an ordered list, `compare` and
` ```chart ` tables, `card` / `aside` / `summary` a bold title plus their text.
Everything else is approximated or left out **and listed in `warnings`** —
` ```mermaid ` arrives as its source code, `embed` is left out, inline `$…$`
stays as plain LaTeX, links to other PageWell pages become plain text.

Images: relative paths are read next to the document; `https://` images are
downloaded by the CLI (the server never fetches a URL for you); `data:` images
travel inside the text. X takes JPG, PNG, GIF and WEBP up to 5 MB — anything
else (SVG included) is left out with a warning. `--cover` overrides the
` ```cover ` block's image.

The `--json` result: `id` (X's draft id), `title`, `x_username`, `compose_url`
(X's article editor; the draft is under **Drafts** there — X gives no link to a
single draft), `blocks`, `images_uploaded`, `cover`, `warnings`, and
`"published": false`.

`x connect` prints `connect_url` and, unless `--wait=false`, waits up to ten
minutes for the user to open it in **their own browser** and allow PageWell on
X. It only prints; it never opens the browser. Signing in to PageWell happens on
the way if needed. One PageWell account connects one X account; connecting
again replaces it. `x disconnect` revokes the access on X's side as well.

Plans: sending to X is a **PageWell Pro** feature. On Free, `x connect` and
`x draft` answer `plan_required` (with the pricing link) before anything is
uploaded; `x draft --dry-run` works on every plan because it never reaches the
server. `x status` shows `"entitled": false` on Free. A connection made on Pro
is kept after a downgrade (nothing is deleted) and works again after upgrading;
`x disconnect` works on any plan.

Limits: 20 drafts per account per day. X Articles need X Premium on the
connected account — without it X refuses the draft (`x_rejected`, HTTP 403).

## themes

```
pagewell themes [--json]
```

The built-in templates plus the chart types. **Superseded by `templates list`**,
which also shows components, hosted libraries and the token vocabulary. Kept
because scripts and older SKILL copies call it; use `templates list` for
anything new.
