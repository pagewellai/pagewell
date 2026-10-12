# Changelog

Every entry is a release: a semver tag here and on the source repository, one
binary per platform on the `binaries` branch, and the `SKILL.md` that goes with it. Older CLIs keep working —
the API only ever adds fields — but the newest is what the skill text describes.

## v0.8.0 — 2026-10-12

Publishing now goes to your Documents unless you name a Space. pagewell publish uploads the local images and files a document references along with it (only from the document's own folder: no hidden files, no symlinks, only uploadable types; anything skipped is listed in missing_assets), titles the page from the document, and always makes a new page, so two drafts that are both draft.md no longer replace each other; --node <node_id|link> updates an existing page in place and keeps its link. Not signed in, publish asks you to choose: the new --anonymous publishes one file (up to 1 MiB) as a link that disappears after 24 hours, or sign in for a lasting page. pagewell init no longer creates a Space named after the current folder: pass --space for an existing one or --title for a new one. SKILL: publishing means publish into Documents, a Space only when the user names it, and the agent asks anonymous-or-sign-in instead of choosing.

Source commit `5cdba96`. Update with `pagewell upgrade`.

## v0.7.1 — 2026-10-12

The repository is now github.com/pagewellai/pagewell (renamed from pagewell-skill). The old address keeps redirecting, so existing installs and older CLIs keep working unchanged. Install with `npx skills add pagewellai/pagewell -g`, or in DeepSeek Harness with `dsh plugin --profile web add github:pagewellai/pagewell`; the plugin package name stays pagewell-skill. pagewell doctor and pagewell upgrade now name the new address in their update commands. The Article template's desktop screenshot is refreshed: on article pages the outline on the right now mirrors the article's left margin, so both margins are equal at every window width.

Source commit `64400c5`. Update with `pagewell upgrade`.

## v0.7.0 — 2026-10-12

PageWell is now also a DeepSeek Harness plugin: package.json declares a dsh.bundle and dsh/index.js registers this same SKILL.md with dsh's skill registry, so `dsh plugin --profile web add github:pagewellai/pagewell-skill` (or the Plugins page) installs it. pagewell auth login --device-code <device_code> waits for the code an earlier --wait=false printed; before, a second auth login started a new code and the one the user approved was never collected. A sign-in that cannot store its token (an agent sandbox limited to the project) now stops with credentials_unwritable before starting or polling a code, instead of failing after approval and leaving an unused token behind. Hosted libraries are embedded even when the local cache cannot be written, and export only says the file opens with no network when nothing is missing. doctor and upgrade name the dsh plugin update when the skill came from it. SKILL: the description fits dsh's 500-character catalog, sign-in waits with --device-code, and sandboxed harnesses are told which commands need wider permission.

Source commit `826e131`. Update with `pagewell upgrade`.

## v0.6.1 — 2026-10-11

Rebuilt from current PageWell source. No user-facing SKILL or CLI behavior changes from v0.6.0.

Source commit `037b515`. Update with `pagewell upgrade`.

## v0.6.0 — 2026-10-11

Every listed template now ships with what it looks like. The skill carries assets/templates/article/: desktop.webp and phone.webp (screenshots of the template's preview page) and samples/*.md (finished documents written with it), so an agent can show a user the result and read a sample without going online. The preview page itself, https://pagewell.ai/templates/article, is rendered live from the template's first sample. pagewell templates list no longer shows a variant count. SKILL: when someone asks what it will look like, hand over the preview link or desktop.webp; read one sample before the first document with a template.

Source commit `1adea79`. Update with `pagewell upgrade`.

## v0.5.0 — 2026-10-11

Templates now follow what the user asks for instead of a menu. pagewell preview has no template or variant pickers and no longer reads ?theme=, ?variant= or the pw_theme cookie: every document is shown with the template its own front matter names, which is how it will publish (--template and --variant still give a one-off look without touching any file). The template list shows a template's preview page, and templates use / show put preview_url and screenshots (up to eight, the first is the thumbnail) in the kit when the server has them; offline they are simply absent. The kit lists only the components a template offers, so form and page templates list none. SKILL: a document is written with article, the only document template for now; a page that must run uses principle; a template the user names is used as named. No menu and no variant, and the template stays fixed once written unless the user asks to change it. A résumé is written as an article for now.

Source commit `60584ce`. Update with `pagewell upgrade`.

## v0.4.0 — 2026-10-11

Public pages can now stay out of search engines. pagewell publish --no-index makes the page public but marks it noindex and keeps it off the sitemap and Explore; pagewell visibility <node-id> public --index off|on|inherit changes it for an existing page. searchable in the JSON now reports what the server resolved (page, then space, then account) instead of always true. SKILL: publishing and references/cli.md explain the switch; the README gains a 'Send an article to X' section.

Source commit `e58de46`. Update with `pagewell upgrade`.

## v0.3.1 — 2026-10-10

Sending articles to X is now a PageWell Pro feature. On Free, pagewell x connect and pagewell x draft stop with plan_required and the pricing link before anything is uploaded; pagewell x draft --dry-run still works on every plan. pagewell x status shows the plan state. A connection made on Pro is kept after a downgrade and can always be disconnected. SKILL: the Sending to X section and the plan_required rule say so.

Source commit `8a5204d`. Update with `pagewell upgrade`.

## v0.3.0 — 2026-10-10

New: pagewell x turns a Markdown file into an X Article draft and never publishes it. x draft (with --dry-run, which sends nothing), x connect, x status and x disconnect. Code, tables, formulas and images become X's native blocks; anything X has no block for is listed in warnings. SKILL: a new 'Sending to X' section; references/cli.md and errors.md cover the commands and the x_not_connected / x_rejected codes.

Source commit `cde94e0`. Update with `pagewell upgrade`.

## v0.2.2 — 2026-10-09

A fenced block is its own declaration: write a `` ```mermaid `` fence (or `` ```math ``, `` ```echarts ``, `` ```abc ``) and it renders, in `pagewell preview` and on the published page alike, with no `libs:` front matter. Inline `$…$` and `$$…$$` math still need `libs: [katex]`. Preview also picks up the reader's second pass: diagrams open full screen, code blocks carry a language label and a copy button, callouts are tinted cards, sub-headings use the heading typeface, and table columns follow their content.

Source commit `4f792fc`. Update with `pagewell upgrade`.

## v0.2.1 — 2026-09-19

Keep the public Skill and CLI bundle aligned with the unified Reader Shell release.

Source commit `d6dd59d`. Update with `pagewell upgrade`.

## v0.2.0 — 2026-09-19

Default publish is public and searchable without a visible Space; standalone reader preferences; automatic skill update checks.

Source commit `a8180c0`. Update with `pagewell upgrade`.

## v0.1.1 — 2026-09-14

The skill and the binaries now live on separate branches: main holds the skill text only, binaries holds the prebuilt CLI for the current release. Install with npx skills add pagewellai/pagewell-skill (140 KiB instead of 70 MiB); update the text with npx skills update pagewell and the binary with pagewell upgrade, each of which points at the other. The docs list where to clone for Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot and Windsurf.

Source commit `c33defe`. Update with `pagewell upgrade`.

## v0.1.0 — 2026-09-13

First tagged release. Adds `pagewell upgrade`, an update notice after commands when a newer version exists, `update` in `pagewell doctor`, and the `source` share permission (read the author's Markdown/HTML). Explore now lists spaces as well as pages.

Source commit `415887c`. Update with `pagewell upgrade`.

