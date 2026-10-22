# pagewell

The [PageWell](https://pagewell.ai) skill for coding agents, and the CLI it
drives. An agent with this skill can write a document that looks designed — an
article, a report, a handbook — or a single-page interactive
artifact, check it against the template's own rules, and publish it as a link:
a page of its own at `p.pagewell.ai/s/…`, a share link, a share code, or a
single HTML file that opens offline.

`pagewell publish` defaults to a public, searchable page with its own stable
address. It does not create or join a visible Space unless you pass `--space`;
choose `--visibility unlisted|code|password` for a restricted share instead.

## Install the skill

One command, any agent — it finds the agents on this machine and installs into
each of them:

```bash
npx skills add pagewellai/pagewell -g
```

By hand: this repository **is** the skill — `SKILL.md` sits at its root, the
`references/` next to it are what the agent loads on demand, and `assets/`
holds each template's screenshots and samples — so clone
it into the directory your agent reads (`--depth 1`: the skill is a few
files; the history is not):

| Agent | User-level | Inside a project |
|---|---|---|
| Claude Code | `git clone --depth 1 https://github.com/pagewellai/pagewell ~/.claude/skills/pagewell` | `.claude/skills/` |
| Codex | `git clone --depth 1 https://github.com/pagewellai/pagewell ~/.codex/skills/pagewell` | `.agents/skills/` |
| Cursor | `git clone --depth 1 https://github.com/pagewellai/pagewell ~/.cursor/skills/pagewell` | `.agents/skills/` |
| Gemini CLI | `git clone --depth 1 https://github.com/pagewellai/pagewell ~/.gemini/skills/pagewell` | `.agents/skills/` |
| GitHub Copilot | `git clone --depth 1 https://github.com/pagewellai/pagewell ~/.copilot/skills/pagewell` | `.github/skills/` or `.agents/skills/` |
| Windsurf | `git clone --depth 1 https://github.com/pagewellai/pagewell ~/.codeium/windsurf/skills/pagewell` | `.windsurf/skills/` |
| Anything else | its skills directory | most also read `.agents/skills/` |

You do not have to install the CLI yourself: the first time the agent needs it,
`SKILL.md` has it run `scripts/install.sh`, which downloads the one binary
this machine needs from the `binaries` branch and verifies it against
`SHA256SUMS` before putting it on your `PATH`. To do it now:

```bash
~/.claude/skills/pagewell/scripts/install.sh    # or wherever the skill landed
```

## DeepSeek Harness

This repository is also a [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
(`dsh`) plugin: `package.json` declares a `dsh.bundle`, and `dsh/index.js`
registers this same `SKILL.md` with dsh's skill registry. There is no second
copy of the instructions, no build step and nothing to configure.

```bash
dsh plugin --profile web add github:pagewellai/pagewell        # the web UI
dsh plugin --profile desktop add github:pagewellai/pagewell    # the desktop app, with the dsh command it installs
```

Or install `github:pagewellai/pagewell` from the Plugins page. The `pagewell` skill then
appears in the agent's skill catalog: ask for an article, a page or a link, or
type `/pagewell`.

Installed the skill with `npx skills add pagewellai/pagewell -g` already? dsh reads
`~/.agents/skills` as well, so it has the skill without the plugin; with both,
dsh uses the `~/.agents/skills` copy.

Under dsh's default `workspace-write` sandbox, writing, checking, previewing,
exporting and publishing run as they are. Signing in, `pagewell upgrade`,
installing the CLI and adding a template write to your home directory
(`~/.config/pagewell`, `~/.local/bin`, `~/.cache/pagewell`), so the agent
asks to run that one command outside the sandbox: approve it in dsh, then
approve the device code in your browser. To update, run the command
`pagewell doctor` names (`dsh plugin --profile <profile> add github:pagewellai/pagewell`),
or update PageWell from the Plugins page.

## Updating

Every activation starts with a read-only check for both halves:

```bash
pagewell doctor --json --skill-version v0.13.1
```

If either half is behind, the JSON includes the exact next command. The manual
commands are:

```bash
pagewell upgrade                  # the CLI: downloads, verifies, and swaps the current binary
npx skills update pagewell -g -y  # the skill text installed globally with npx skills
pagewell upgrade --check          # just say whether there is a newer CLI version
```

Installed by `git clone` instead? `pagewell upgrade` fast-forwards that
clone and re-runs its installer, so text and binary move together. Installed
with `npx skills`? `pagewell upgrade` swaps the binary and reminds you to run
`npx skills update pagewell -g -y` for the text. A copy installed with the one-line
`curl` below has no skill on disk — `upgrade` then replaces the binary only
and says so.

You do not have to remember to check. The skill runs `doctor` before each
task and passes its own published version, so `update` covers the CLI and
`skill_update` covers SKILL.md plus its references. Every later command that
talks to pagewell.ai also learns the current CLI version from the response; a
newer one is mentioned once a day on stderr — never on stdout, so `--json`
stays clean. Set `PAGEWELL_NO_UPDATE_NOTICE=1` to silence that later reminder.

Older versions keep working: the API only ever adds fields, and the server
never refuses a request because of the CLI's version. When a version is older
than the oldest one we still support, the reminder becomes insistent (every
run, `update.required` in `doctor`) but nothing breaks.

## Releases

Every publish is a release with a [semver](https://semver.org) tag, here and on
the source repository: `vMAJOR.MINOR.PATCH`. A patch bump is fixes and text;
a minor bump adds commands, flags or fields; a major bump is reserved for the
day an old CLI genuinely cannot be served — there has been none. `main` is
always the latest release and `git checkout v0.3.1` gives you the skill text
published under that number. The binaries live on the `binaries` branch,
which always holds the current release only. What changed is in
[`CHANGELOG.md`](CHANGELOG.md); where it came from is in `MANIFEST` and
`version.json`.

## Install only the CLI

```bash
curl -fsSL https://raw.githubusercontent.com/pagewellai/pagewell/main/scripts/install.sh | bash
```

The installer reads `uname`, downloads the matching binary from the
`binaries` branch, verifies it against `SHA256SUMS`, and only then makes
it executable. Nothing else is downloaded and nothing is compiled.

| Platform | Binary | Size |
|---|---|---|
| darwin/amd64 | `pagewell_darwin_amd64` | 16M |
| darwin/arm64 | `pagewell_darwin_arm64` | 15M |
| linux/amd64 | `pagewell_linux_amd64` | 16M |
| linux/arm64 | `pagewell_linux_arm64` | 15M |
| windows/amd64 | `pagewell_windows_amd64.exe` | 16M |
| windows/arm64 | `pagewell_windows_arm64.exe` | 15M |

## First run

```bash
pagewell doctor                       # installed? reachable? signed in?
pagewell templates list               # the templates there are
pagewell templates use article -o draft.md
pagewell check draft.md               # the template's own rules, offline
pagewell preview                      # the page as it will render, offline
pagewell auth login                   # a device code; approve it in your browser
pagewell publish draft.md             # one link back
```

Writing, checking, previewing and exporting need no account and no network.
Publishing puts the page, with its images, in your Documents — never in a Space
unless you name one — and needs you signed in. Without an account,
`pagewell publish --anonymous` makes a link that disappears after 24 hours; the
agent asks you which you want. It never approves the device code or completes a
payment for you — both happen in your own browser.

## Send an article to X

```bash
pagewell x draft article.md --dry-run   # what X would get, offline, on any plan
pagewell x connect                      # once: a link the user opens to allow PageWell on X
pagewell x draft article.md             # an X Article draft in the user's account
```

Headings, lists, quotes, images, code blocks, tables and `$$` formulas become
X's own blocks; what X has no block for (charts, diagrams, embeds) is
approximated or left out, and the JSON says which. PageWell only creates the
draft — it never publishes; the author does that on X. Sending needs PageWell
Pro, and X itself only offers Articles to Premium accounts. The agent prints the
connect link for the user and never approves it.

## Where things are explained

| | |
|---|---|
| `SKILL.md` | the whole normal flow, written for the agent |
| `references/cli.md` | every command, flag and JSON shape |
| `references/errors.md` | the error codes (a fixed enum, never translated) |
| `references/templates.md` | picking, writing and changing a template |
| `CHANGELOG.md` | what each release changed |
| [pagewell.ai/docs](https://pagewell.ai/docs) | the product documentation |
| [pagewell.ai/pricing](https://pagewell.ai/pricing) | plans and limits |
