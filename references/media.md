# Music and books: adding to their library

Every PageWell account has a private library of its own songs and e-books. Only
the owner sees it: they play and read it in the console (**Music**, **Books**)
or in their own apps — music apps over Subsonic, reading apps over OPDS, each
signed in with an app password from the console's **Apps** page. The steps for
each app are on `pagewell.ai/music-and-books`.

You can **add** to it, with `pagewell media upload`. You cannot read it: listing,
playing, downloading and opening books belong to the owner's own browser and
apps — an agent token gets `forbidden_scope` there, and the CLI has no command
for them, on purpose. Never offer to "check what is in the library".

## When

- "Upload my music / this album / these e-books to PageWell", "put this folder
  in my library", "add these to my Books", "上传音乐", "把这些书传上去".
- **Only what they pointed at.** Pass exactly the files and folders they named.
  Do not search their disk for music, and do not add a folder they did not name
  because it looks like music.
- A document they want to share — an article, a PDF report — is `publish`, not
  this. A PDF goes into the library when they call it a book to read.

## Run it

```
pagewell media upload ~/Music/Album --json
pagewell media upload novel.epub ~/Comics --json
pagewell media upload ~/Music --dry-run --json      # find and check; upload nothing
```

In this order:

1. **Finds** the music (MP3, FLAC, M4A, OGG, Opus, WAV) and the books (EPUB,
   PDF, MOBI, AZW3, CBZ, TXT) in what you gave it, folders all the way down.
   Everything else is skipped and counted by extension (`skipped_by_ext`).
   Hidden files (`.DS_Store`, the `._song.mp3` macOS leaves on external drives)
   are not looked at. `--kind music` or `--kind book` keeps one kind;
   `pagewell music upload` and `pagewell books upload` are the same thing.
2. **Checks before sending a byte.** It computes each file's SHA-256 on this
   computer and asks the server once: which are already in the library, which
   are too large for the plan (Free 25 MB a file, Pro 500 MB), and whether the
   rest fits in the free space. Not enough room stops it here, with nothing
   uploaded.
3. **Uploads** the new ones several at a time (`--jobs`, default 4, at most 8),
   in parts. A dropped connection or a server hiccup is retried where it
   happened; one file failing does not stop the others.
4. **Organizes** what was added — AI organize, a Pro feature: it merges
   different spellings of the same artist, album or author and adds genres and
   categories (the tags in the files stay as they were). It works for a few
   minutes at most; what is left is picked up by itself within the hour (a
   large import gets through a few batches an hour), or all at once with **AI
   organize → Organize now** in the console. `--no-organize` skips it.

A big folder takes a while: computing the checksums reads every file once, and a
few GB of music is minutes of uploading on a good connection. Tell them it is
under way, and let it run in the background if your harness can. Running the
same command again is always safe and cheap — what is already there is skipped
— so it is also how to finish an upload that stopped.

## Not enough room

`quota_exceeded` before anything was sent: the message says how much the new
files need and how much is free. Say both numbers, and that **nothing was
uploaded**. Then the two ways forward, in this order of what they asked for:

- **Fewer files at a time** — one album or folder, then the next.
- **More room** — on Free, Pro has more storage and takes larger files
  (`pagewell.ai/pricing`; hand over the link, never complete a payment). On Pro,
  free some space first (`pagewell usage --files 10` shows what is large).

`plan_readonly`: the account is in a read-only phase after a downgrade. Nothing
can be added, and **nothing has been deleted** — say that.

The music and books count against the same storage as documents. `--dry-run`
gives the same answer without uploading: use it when they ask "will it fit?".

## What to say

From the `--json` result (shape: `references/cli.md`):

1. **What went in** — `added_by_kind` ("Added 28 songs and 2 books"); for a
   handful, the titles in `added_files` (what the server read from the tags).
2. **What did not** — every entry in `problems`, with its `reason`: too large
   for the plan, empty, unreadable, or failed to upload. `duplicates` were
   already in the library (or were the same file twice); `skipped` were not
   music or books — name the extensions if it is a lot (`skipped_by_ext`: a
   folder of `.wma` or `.ape` files is not taken).
3. **AI organize** — `organize`: what it tidied; `partial`, that the rest is
   picked up within the hour or at once with Organize now in the console; on
   Free (`plan_required`), one line that it comes with Pro; `conflict`, that they
   turned it off ("Let AI organize my music and books"). It is never a failure
   of the upload.
4. **Where to see them** — the console (`music_url`, `books_url`) or their own
   apps (`apps_url`).

`upload_incomplete` (exit status 1): some files failed after retries — the rest
are in. Run the same command again; if the same file fails twice, read its
reason out instead of looping. `interrupted`: the files added so far stay; the
same command adds the rest.

⛔ Never move, rename or delete their files to "clean up" before uploading, and
never upload a folder they did not name. The library is theirs; you only carry
files into it.
