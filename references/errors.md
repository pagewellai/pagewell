# Error codes

The `--json` shape:

```json
{"error": {"code": "quota_exceeded", "message": "…", "hint": "…", "request_id": "…"}}
```

**`code` is a stable enum and is never translated.** Branch on it.
`message` is already localised for the user — show it as is.
`hint` says what to do next and is usually worth relaying verbatim.

| code | Meaning | What to do |
|---|---|---|
| `unauthenticated` | Not signed in, or the token expired (60 days) or was revoked | When it came from `publish`: for a story / game / page with scripts, sign-in is the only way — say so; otherwise **ask whether to publish anonymously or sign in**, wait for the answer, never pick for them (SKILL §Signing in). Elsewhere, walk through sign-in again. Do not fail silently |
| `forbidden_scope` | The token lacks this permission | Name the missing scope and ask the user to re-authorise |
| `not_found` | No such object | Confirm with `pagewell tree` or `spaces` first |
| `conflict` | The remote changed, or the plan was already committed | **Do not decide to overwrite.** Show the remote state and ask |
| `validation_failed` | Malformed request | `detail` usually names the offending entry. From `publish --anonymous`: the page runs scripts or carries its own styles — anonymous takes neither; sign in to publish it |
| `depth_exceeded` | More than 8 levels deep | Flatten the tree |
| `too_many_nodes` | Space is over its page limit | Split into several spaces |
| `doc_too_large` | A single document exceeds 5 MiB | Try `--assets` to pull images out; if it still exceeds, split it |
| `invalid_html` / `invalid_markdown` | Parse failure | Report which file |
| `rate_limited` | Too fast | Wait. Do not retry immediately |
| `quota_exceeded` | Out of storage | See the order below |
| `plan_readonly` | The account is in a read-only phase | **Nothing has been deleted.** Say so explicitly |
| `plan_required` | The plan does not reach this: a template needs a higher plan, or a Free account hit a limit — Spaces are Pro-only, 20 active shares, 2 agent tokens, a **password** share, or sending to X | Say what the limit is (the message names it); keep ordinary documents in Documents, for shares or tokens suggest revoking an unused one, and for password shares fall back to `--mode code`; hand over `/pricing` second. **Never complete a payment** |
| `share_expired` | The share is gone | Create a new one |
| `x_not_connected` | `pagewell x draft` needs the user's permission on X, once (or X revoked it) | **Read out the link in `hint`** (also `pagewell x connect`). The user opens it in their own browser and clicks Allow. Never open it or approve it for them |
| `x_rejected` | X refused the request; `detail` has X's own words | HTTP 403 almost always means the X account has no Premium (Articles need it). Say so and stop — do not retry in a loop |
| `internal` | Server-side failure | Report it with the `request_id` |

The CLI adds its own:

| code | Meaning |
|---|---|
| `credentials_in_project` | A credential was found in the project directory. **Clean it up before anything else** |
| `credentials_unwritable` | `auth login` cannot write `~/.config/pagewell/credentials.yaml`, so it stopped before starting or polling a code — nothing was spent. Usually an agent sandbox that only allows the project directory: **rerun the same command with permission to write there.** Never move the credentials into the project |
| `needs_confirmation` | This push would delete things, exceed quota, or is unusually large |
| `network` | Cannot reach the server |
| `engine_outdated` | This template needs a newer renderer than the CLI has. **Run `scripts/install.sh` and try again.** Do not fall back to another template — the user picked that one, and quietly using a different one is how they never find out |
| `template_not_certified` | The version's own samples do not pass its own checks, so it cannot go on the shelf. `pagewell templates validate <id>` names them |
| `interrupted` | Ctrl-C (or the harness stopped the command) before anything was produced. Nothing is half-done: `voice` kept the lines it had made, `record` put OBS back |

`pagewell voice` (`references/voice.md`):

| code | Meaning |
|---|---|
| `tts_key_missing` | No Qwen TTS key in the environment (`DASHSCOPE_API_KEY` or `TTS_KEY`). **Tell them how to add it to their shell profile; never ask for the key in the chat** |
| `tts_rejected` | Qwen TTS refused: the message is its own words — a voice it does not have, a key it does not accept (keys belong to a region), a model not enabled for the account. Fix what it names; do not retry unchanged |
| `tts_failed` | Network or the service failed after several retries. The lines made so far are kept; run the same command again later |

`pagewell record` (`references/recording.md`). The `hint` is the step the user takes — relay it:

| code | Meaning |
|---|---|
| `not_stage` | The page is not a story or a game; only those can be recorded |
| `obs_not_installed` | OBS Studio is not on this computer |
| `obs_not_running` | OBS is closed and could not be opened (or `--no-launch`) |
| `obs_websocket_off` | OBS's remote control is off: Tools → WebSocket Server Settings → Enable WebSocket server. Also when OBS opened in Safe Mode |
| `obs_auth_failed` | OBS wants a WebSocket password and the one available (OBS's own, or `OBS_WEBSOCKET_PASSWORD`) did not match. **Never ask for the password in the chat** |
| `obs_too_old` | Whatever answers at that address is not obs-websocket 5 — OBS older than 28, or another program on the port |
| `obs_not_ready` | OBS is still starting, usually behind a dialog (first-run wizard, "run in Safe Mode?", missing files) |
| `obs_unreachable` | OBS on another computer cannot be reached at `--obs-url` |
| `obs_busy` | OBS is already recording, streaming or running its virtual camera. **Never stop it yourself** — ask them to |
| `obs_no_browser_source` | This OBS build has no Browser Source (some Linux packages); install OBS from obsproject.com or the Flatpak |
| `obs_page_unreachable` | OBS's browser source could not load the page from this computer (OBS elsewhere, a firewall) |
| `obs_black_frames` | The browser source draws black — on macOS, turn off Browser Source Hardware Acceleration and restart OBS |
| `obs_page_timeout` | The page did not finish loading in OBS; the message names the script error when there is one — check it with `pagewell preview` |
| `obs_record_failed` | OBS would not start (or change for) the recording; the message has OBS's own words |
| `obs_disconnected` | OBS quit or dropped the connection mid-way |

## Order to follow when storage runs out

```
1  pagewell usage --json   → see which of trash / assets / docs is largest
2  Suggest in this order: trash → old versions → orphaned assets
3  Only then mention upgrading
```

⛔ **Never complete a payment for the user.** An upgrade link is fine. Opening
the checkout page, filling a form, or clicking confirm is not. Offer the ways to
free space first — the other order reads as a sales pitch.

## A downgrade never deletes data

`plan_readonly` means "new writes are paused", not "your content is gone".
The three phases are grace → readonly → retained, and **none of them delete
anything**. Say that out loud when you relay the error.
