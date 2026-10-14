# Templates

A template is **data, not code**: a directory the renderer interprets. That is
why a template you fetched renders identically on your laptop and on the server,
and why anyone can write one without shipping executable logic to a reading page.

## Which template a request gets

**The request decides. Do not offer a menu, do not offer looks.**

| They asked for | Template |
|---|---|
| any document — article, post, report, guide, one-pager, handbook page | `article` |
| a page where the reader must see a mechanism work (artifact mode) | `principle` |
| something vertical that plays slide by slide — "like a short video", "竖屏" (artifact mode) | `story` — see `stage.md` |
| something to play — "a game", "小游戏" (artifact mode) | `game` — see `stage.md` |
| a template by name — their own house template, say | that one |
| a résumé | `article` for now, and say so in one line. A résumé template with its own components comes later |

That is the whole decision. `pagewell templates list --json` still lists
everything installed (including `resume`); that list is for someone who asked
what exists, not a menu to read out.

Templates differ in **the components they give you**, not in a choice of looks.
`templates use <id>` lists exactly those components, each with a syntax to copy.
Read that list rather than one you remember — templates change between releases.

**Once the draft exists the template is fixed.** `templates use` writes
`template:` into the front matter; `pagewell preview` renders exactly that and
has no template or variant picker, so what the user sees is what gets
published. Do not set `variant:` and do not switch templates afterwards — only
an explicit request for a different template changes it.

### What it will look like

Every listed template has a **preview page** and **screenshots**, and both are
generated, never hand-made, so they match what you will produce today:

- The preview page is a live page rendered from the template's first sample on
  every visit — `https://pagewell.ai/templates/<id>`, for Article
  https://pagewell.ai/templates/article. It is `preview_url` in
  `templates list --json` and `template.preview_url` in `templates use` / `show`.
- The screenshots are that page on a desktop (1280 × 800) and on a phone
  (390 × 844), retaken for every release: `screenshots` / `thumbnail_url` (the
  first one) in the listing, `template.screenshots` in the kit.
- **This skill carries them too**, with the samples, in
  `assets/templates/<id>/`: `desktop.webp`, `phone.webp` and `samples/*.md`.
  They work offline — use them when the network is not there or when your
  interface can show a local image.

When someone asks what they will get before you have written anything, hand
over the preview link or a screenshot. They are pictures of what is coming, not
options to choose between. Online fields that are absent (offline, or an older
server) are not an error, and there is nothing to retry — the files in
`assets/` are still there.

Before your first document with a template, read one of its samples
(`assets/templates/<id>/samples/`, or `pagewell templates samples <id>`): it is
the shape a finished draft has, and a better guide than any description.

## The built-in templates

| id | Reach for it when |
|---|---|
| `article` | every document: lead, sections, key points, author card. Its components are whatever `templates use article` lists |
| `principle` | a running page that makes a mechanism visible (artifact mode, always sandboxed) |
| `story` | a vertical 360 × 640 story played slide by slide like a short video (artifact mode, `stage.md`) |
| `game` | a vertical 360 × 640 game played with one thumb (artifact mode, `stage.md`) |
| `resume` | installed, but not offered yet — do not pick it |
| *(none)* | a documentation tree pushed as-is: the platform look, tree of pages on the left, outline on the right. You do not choose this; it is what files without `template:` get |

`magazine-article`, `resume-classic`, `resume-modern` and the old theme names
(`editorial`, `whitepaper`, `ink`, `note`, `manual`) still resolve on documents
that already use them. Do not write them in new ones.

Every template uses the platform's one type pairing (Open Sans + Noto Sans CJK);
there is no serif template. Dark mode is automatic: it follows the reader's
system setting, and every template, palette and component has a dark variant.
A template pins `scheme: light` when the thing exists to be printed.

Templates do not change breakpoints. On a phone every template collapses to one
column with the contents in a drawer — do not pick a template to control mobile
layout.

### Reader controls stay outside the document

When a current standalone PageWell export is hosted inside PageWell, its
reading-width and appearance controls live in the PageWell top bar, never in
the article. The default measure and gutters are the same as a Markdown reading
page; wide is an explicit reader override. Arbitrary HTML artifacts do not get
these controls.

Do not build either control into a document, and do not promise a particular
appearance: "it will look dark" is not something you can say. The document must
remain correct without JavaScript; in that state it uses the template measure
and the reader's system color scheme.

## Two kinds

| kind | what it carries |
|---|---|
| `template` | **a kind of document**: its look (`template.css`, `tokens.yaml`, layout), plus skeleton, brief, inputs, checks and samples. `mode` says what the author writes: `prose` (Markdown), `form` (fields), `hybrid`, or `artifact` (one running HTML page, always sandboxed, `scaffold.html` is the skeleton) |
| `components` | a set of components (`components/<name>/`) any template can allow |

`theme`, `doc`, `pack` and `artifact` are the old kind names and still load;
they normalise to the two above.

## The directory

```
my-article/
  template.yaml        id, kind, version, depends, tokens, variants, libs
  template.css         the look: real CSS, scoped automatically (old name theme.css still loads)
  tokens.yaml          extra knobs beyond the platform baseline
  components/
    quote/
      component.yaml   props schema, summary, when, limits, behavior
      component.html   Mustache
      component.css    scoped automatically
  layouts/
    page.html          only for mode: form — the whole page
    page.yaml          its data schema
  brief.md             what an agent reads
  inputs.yaml          what to ask the user before writing
  structure.yaml       the skeleton
  checks.yaml          the checks + the rubric
  samples/*.md         at least one, and it must pass its own checks
  assets/              images, fonts
  CHANGELOG.md
```

## template.yaml

```yaml
id: acme/quarterly
kind: template
version: 2.1.0            # semver; a save must move it forward
name: Quarterly review
description: One page per team, numbers first.
category: report
lang: en
mode: prose               # prose | form | hybrid | artifact
layout: single            # single (article page) | tree (contents on the left) | wide
depends:
  packs: [core]
libs: []                  # hosted libraries this template enables
tokens:                   # override the platform baseline
  accent: indigo
  numbering: decimal
variants:                 # named sets of overrides
  warm: { accent: clay }
  cool: { accent: indigo }
scheme: auto              # `light` pins it, for things that get printed
min_engine: 2
```

`min_plan`, price and shelf status are **not** in here. They belong to the
library, not to the template.

## Four modes

| mode | the author writes | reach for it when |
|---|---|---|
| `prose` | Markdown + components | articles, guides, reports, handbooks |
| `form` | one YAML front matter, no body | resumes, one-pagers, profile pages — anything where the layout decides whether it is good |
| `hybrid` | fields **and** a body | release notes, weeklies: fixed head and tail, free middle |
| `artifact` | one self-contained HTML page | explainers, playgrounds, converters — anything that stops being itself with JS off |

`form` gives the designer the whole page (`layouts/page.html`, a Mustache
template over the data) and gives the agent one job: fill the fields. That is
why resumes are `form` — a resume laid out paragraph by paragraph is a worse
resume.

## The four things that make a template good

Three of them are prose.

### 1. A sample that works

`validate` refuses a template with no sample, and CI refuses one whose
sample fails its own checks. Write the sample **first** — a template you cannot
demonstrate is a template nobody will pick.

### 2. A brief someone can follow

`brief.md` is the only thing another agent reads. Fixed sections:

```
## Audience     who reads it, on what device, for how long
## Voice        person, tone, three phrasings to avoid
## Structure    section by section: what it does, how long, which component
## Do / Don't   3–7 each, one line each
## Rubric       questions the writer should answer yes to before handing over
```

Write it in English even for a Chinese template: it is instructions to a tool,
and one language means one set of behaviour. Keep it under 12 KB — it goes into
the agent's context on every single generation.

### 3. Inputs that stop invention

```yaml
- id: numbers
  ask: The three figures for this quarter, and what they were last quarter.
  required: true
  accept: [text, file]
- id: cover
  ask: A cover image URL, or shall I use a placeholder?
  accept: [url]
  fallback: placeholder
  front: cover
```

`required: true` means the agent must ask before writing. This is the single
most effective thing in the whole format: without it an agent will produce a
confident, well-formatted, entirely fictional quarterly review.

### 4. Checks that agree with the brief

```yaml
checks:
  - { rule: length, of: heading, max: 42, unit: chars }
  - { rule: count,  of: h2, min: 3, max: 6 }
  - { rule: image,  alt: required, https: true }
  - { rule: input,  what: [cover] }
rubric:
  - Does every section have one sentence worth quoting on its own?
  - Did you write any number the user did not give you?
```

Rules: `require` `forbid` `order` `count` `length` `image` `link` `placeholder`
`contrast` `page` `input` `lib`. The set is closed — adding one needs a release.
Most of what you want is already derivable from `structure.yaml`, which
generates `require`, `count`, `order` and `forbid` for you. **Do not write
those twice.**

⚠️ A brief that says "don't pad to a word count" plus a `length of: doc, min:`
rule is a template arguing with itself. The user obeys the checks and reads the
brief, so they will notice.

## structure.yaml

```yaml
- id: cover
  component: cover
  required: true
  guide: 16:9 image at an https URL. Kicker ≤ 8 characters.
- id: body
  heading: h2
  repeat: { min: 3, max: 6 }
  guide: |
    One idea per section. The heading names the idea.
    Open with the claim, then the evidence.
  allow: [quote, highlight, stats, chart, figure]
```

Three readers: `scaffold` builds the skeleton from it, the tool kit shows each
`guide` to the agent, and the check engine derives rules from it. Write it once.

## Tokens

A template declares its own knobs in `tokens.yaml`; every template also inherits
the platform baseline (measure, leading, accent, radius, rhythm, plus about
twenty appearance switches). Typeface is not a knob any more: every document uses
the platform pairing. `pagewell templates list --json` returns the
whole vocabulary with allowed values — **read that rather than guessing**.

```yaml
accent:  { type: color-slot, default: teal }     # one of eight palette slots
brand:   { type: color, optional: true }         # "#0B6B63/#4FBCAF" light/dark
columns: { type: enum, values: [one, two], default: one }
measure: { type: number, min: 40, max: 120, unit: ch, default: 120 }
```

Types: `color-slot` `color` `enum` `number` `asset` `font` `text`. A value is
either a member of a closed set or a bounded number — that is what makes it safe
to generate CSS from, and why an unknown token name is an **error** rather than
being ignored.

Colour tokens take a light/dark pair. Give one value and the check engine warns:
a brand colour that only works in light mode is unreadable for half your readers.

## CSS

A template writes **real CSS** (`template.css`). Every selector is automatically
scoped to the document container, so write `.pw-body h2`, not a prefix of your own.

What is not allowed, and why:

| Not allowed | Because |
|---|---|
| `@import`, `url(https://…)` | a stylesheet must not fetch anything; use `asset://` for files in the package |
| `\` escapes | that is how `\3c /style` is smuggled; use the literal character |
| unknown properties | the whitelist is generous (380+ properties) but explicit |

`position`, `z-index`, `transform`, `filter` and animations **are** allowed: the
document sits in a `contain: paint` container, so they cannot reach the page
around it. Isolation comes from the container, not from banning properties.

## The cascade

```
platform baseline → template (tokens + template.css) → components → variant → brand layer → the document's own front matter
```

Each layer writes only its differences; later wins. The whole thing is resolved
once at ingest and frozen into the document as a **design snapshot**, so:

- the reading page does zero template lookups
- editing a template does **not** restyle documents already published
- retiring a template does not break a single page

To pick up a new version, push the document again. Say this when someone asks
why their template edit "did not take".

## Versions

`save` requires the version to move forward. A document pins `template: id`
(exact) or `template: id@^2` (follow the major). Default is pinned — a published
piece should not change while its author is asleep.

## Writing or changing one

When someone says "make this our house style", "I want a template like this", or
"change the quotes to cards", you are working on a template, not a document.

```
pagewell templates fork <src> <id>                 # start from one that works
pagewell templates fork --from-doc draft.md <id>   # lift one out of a document
pagewell templates new <id>                        # from scratch (--mode form|artifact)
pagewell templates edit <id>                       # pull the saved version down

# then, in a loop:
pagewell templates validate <id>    # loads it, renders its samples, runs its checks
pagewell templates preview <id>     # look at it
pagewell templates diff <id>        # working copy vs the library
pagewell templates save <id> --message "…"

pagewell templates publish <id> --public
```

Start from `fork`, not `new`: a working template is a better starting point than
an empty directory, and `forked_from` stays in the manifest — where something
came from is not erasable.

**For a house style, prefer the brand layer over a new template.** It applies
colour, type and logo to every document without freezing anyone's layout:

```
pagewell brand set accent=indigo heading=sans
```

⚠️ `save` on a template that other documents follow (`@^2`) reaches every one of
them. Say so before saving.

## When it goes wrong

| What you see | What it means |
|---|---|
| `engine_outdated` | the template needs a newer renderer. Update the CLI; do not fall back to another template |
| `template_not_certified` | its sample does not pass its own checks. `templates validate` names them |
| `validate` names a token | the value is outside the declared set; the error lists what is allowed |
| a component renders as an error box | its props did not validate — the message says which one |
| `:::name` came out as literal text | the component is not in this template's packs. `templates add`, or check `depends.packs` |
| the page looks like the default | the template id is unknown here; `preview --once --json` reports it as a warning |
