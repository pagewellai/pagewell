/**
 * PageWell as a DeepSeek Harness (dsh) plugin.
 *
 * The plugin is the skill. This file registers one provider on `ctx.skills`
 * that serves the SKILL.md at the root of this package: the same file
 * `npx skills add` and a `git clone` install for every other agent, so there
 * is no second copy of the instructions to drift. The agent drives the
 * `pagewell` CLI through dsh's own bash tool, and SKILL.md installs the CLI
 * the first time it is needed (scripts/install.sh).
 *
 * Plain ESM with no dependencies and no build step, on purpose:
 * `dsh plugin add github:pagewellai/pagewell` fetches sources, not build
 * output, and a `prepare` script would make every user allowlist a build before
 * the first install works. It does not reuse `@deepseek-ai/dsh-skill-filesystem`
 * either: that provider discovers `<root>/<name>/SKILL.md`, and this package is
 * the skill directory itself.
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const PROVIDER = 'pagewell'
/** Rank of the `bundled` source in dsh's skill registry (`BUNDLED_SKILL_RANK`). */
const BUNDLED_SKILL_RANK = 600
const ROOT_URL = new URL('../', import.meta.url)
const SKILL_URL = new URL('SKILL.md', ROOT_URL)
const SKILL_PATH = fileURLToPath(SKILL_URL)
/** SKILL.md's relative paths (references/, scripts/install.sh, assets/) resolve against this. */
const RESOURCE_BASE = Object.freeze({ kind: 'directory', path: fileURLToPath(ROOT_URL) })
const INVOCATION = Object.freeze({ modelInvocable: true, userInvocable: true })
const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Read SKILL.md on every call. It only changes when the plugin is updated, but
 * re-reading costs a few milliseconds and means a stale copy can never be served.
 *
 * @param {AbortSignal | undefined} signal - lookup cancellation.
 */
async function loadSkill(signal) {
  const raw = await readFile(SKILL_URL, { encoding: 'utf8', signal })
  const parsed = parseFrontmatter(raw)
  if (parsed === undefined) throw new Error(`${SKILL_PATH}: no YAML frontmatter`)
  const { name, description, metadata } = parsed.data
  if (typeof name !== 'string' || !SKILL_NAME.test(name)) {
    throw new Error(`${SKILL_PATH}: frontmatter needs a kebab-case name`)
  }
  if (typeof description !== 'string' || description.trim() === '') {
    throw new Error(`${SKILL_PATH}: frontmatter needs a description`)
  }
  return {
    name,
    description,
    metadata: isRecord(metadata) ? metadata : undefined,
    // The body without its frontmatter, as dsh's own filesystem provider serves it.
    content: parsed.body.trim(),
  }
}

function summaryOf(skill) {
  return {
    name: skill.name,
    description: skill.description,
    invocation: INVOCATION,
    provider: PROVIDER,
    source: 'bundled',
    path: SKILL_PATH,
    resourceBase: RESOURCE_BASE,
    ...(skill.metadata === undefined ? {} : { metadata: skill.metadata }),
  }
}

const provider = {
  name: PROVIDER,
  async list(options = {}) {
    const skill = await loadSkill(options.signal)
    return [{ ...summaryOf(skill), rank: BUNDLED_SKILL_RANK, locator: SKILL_URL }]
  },
  async get(_candidate, options = {}) {
    const skill = await loadSkill(options.signal)
    return { ...summaryOf(skill), content: skill.content }
  },
}

/** Cordis plugin name. */
export const name = 'pagewell-skill'
/** The registry this plugin contributes to. */
export const inject = ['skills']

/**
 * Register the PageWell skill on `ctx.skills`. Disposing the plugin removes it.
 *
 * @param {import('@deepseek-ai/cordis').Context} ctx - the plugin context.
 */
export function apply(ctx) {
  ctx.skills.registerProvider(() => provider)
}

// ---------------------------------------------------------------- frontmatter

/**
 * Split SKILL.md into its YAML frontmatter and body, the way dsh's filesystem
 * provider does: a first line of exactly `---`, closed by the next line of
 * exactly `---`.
 *
 * Only the YAML that SKILL.md frontmatter uses is understood: `key: value`
 * (plain or quoted), folded and literal block scalars (`>`, `|`, with `-`/`+`),
 * and one nested mapping (`metadata:`). A full YAML parser would be a
 * dependency, and with it an install step this package deliberately does not
 * have. The plugin's tests compare the result with a real YAML parser.
 *
 * @param {string} raw - the whole SKILL.md.
 * @returns {{ data: Record<string, unknown>, body: string } | undefined}
 */
function parseFrontmatter(raw) {
  const lines = raw.replace(/^﻿/, '').split('\n').map((line) => line.replace(/\r$/, ''))
  if (lines[0] !== '---') return undefined
  const end = lines.indexOf('---', 1)
  if (end < 0) return undefined
  return { data: parseMapping(lines.slice(1, end)), body: lines.slice(end + 1).join('\n') }
}

function parseMapping(lines) {
  const data = {}
  for (let i = 0; i < lines.length; i++) {
    const entry = /^([A-Za-z_][\w-]*):(?:[ \t]+(.*))?$/.exec(lines[i])
    if (entry === null) continue
    const value = (entry[2] ?? '').trim()
    const children = []
    while (i + 1 < lines.length && (lines[i + 1].trim() === '' || /^[ \t]/.test(lines[i + 1]))) {
      children.push(lines[++i])
    }
    if (/^[>|][+-]?$/.test(value)) {
      data[entry[1]] = blockScalar(value, children)
    } else if (value === '') {
      data[entry[1]] = parseMapping(dedent(children))
    } else {
      // A plain scalar may continue on more-indented lines; YAML folds them with spaces.
      const more = children.map((line) => line.trim()).filter((line) => line !== '')
      data[entry[1]] = scalar(more.length === 0 ? value : [value, ...more].join(' '))
    }
  }
  return data
}

function blockScalar(indicator, lines) {
  const body = dedent(lines)
  let text = ''
  if (indicator[0] === '|') {
    text = body.join('\n')
  } else {
    // Folded: lines join with a space; an empty line is a line break.
    let afterBreak = true
    for (const line of body) {
      if (line === '') {
        text += '\n'
        afterBreak = true
      } else {
        text += (afterBreak ? '' : ' ') + line
        afterBreak = false
      }
    }
  }
  text = text.replace(/\n+$/, '')
  // `-` strips the final line break; clip (no indicator) and `+` keep one.
  return indicator[1] === '-' || text === '' ? text : `${text}\n`
}

function dedent(lines) {
  const indents = lines.filter((line) => line.trim() !== '').map((line) => /^[ \t]*/.exec(line)[0].length)
  const cut = indents.length === 0 ? 0 : Math.min(...indents)
  return lines.map((line) => (line.trim() === '' ? '' : line.slice(cut).replace(/[ \t]+$/, '')))
}

function scalar(value) {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value)
    } catch {
      return value.slice(1, -1)
    }
  }
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replaceAll("''", "'")
  }
  return value.replace(/[ \t]+#.*$/, '')
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
