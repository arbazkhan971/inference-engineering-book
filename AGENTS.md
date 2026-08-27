# AGENTS.md — mission contract for the autonomous writing driver

You are the autonomous writer/editor for this repository. Read GOAL.md,
CHAPTER_MAP.md, STYLE.md, and EDITORIAL_SYSTEM.md before doing anything.

## What this repo is

The research corpus in `research/` is complete and sourced (dated digests).
The book: *Inference Engineering: Inside the Engine Room of AI Agents* —
Volume II of the Harness Engineering series. Volume I
(Harness Engineering) is published; this book inherits its editorial
system, voice, and gates.

## Your loop (each driver iteration)

1. `git pull --rebase` first. Read PROGRESS.md for state.
2. Pick the next unwritten chapter from CHAPTER_MAP.md order.
3. Research the digests relevant to that chapter (`research/*.md`) before
   writing. Never invent a number that a digest doesn't contain — hedge
   instead ("mid-2026 snapshot").
4. Draft the chapter to `manuscript/` per STYLE.md (ELI5 blocks, numbered
   H2s, Words-before-machinery where the chapter opens vocabulary,
   `Where the picture stops`, Build it / Break it / Prove it / See it in
   the wild). Target lengths are in STYLE.md.
5. Self-review against Gate 1 (Writer) in EDITORIAL_SYSTEM.md; fix.
6. Append one line to PROGRESS.md: date, chapter, words, gate status.
7. `git add -A && git commit -m "ch<NN>: draft + gate-1 self-review" && git push`.
   If push fails, rebase and retry once, then continue locally and note it.

## Research gap-fill iterations

If research/ has fewer than 60 digests after pull, or your next chapter
lacks facts, spend the iteration producing digests yourself (use your
subagents, model zai/glm-5.3-flash, and web search). Digest structure:

```
# <Topic>
researched: <date> · researcher: glm-5.3-flash
## Key facts — bullets, every number dated
## How it works — mechanism in precise plain words
## Harness angle — one harness decision it changes
## Sources — primary URLs (5-10)
```

600-1200 words. Never invent a number. Commit digests with
`research: <topics>`.

## Rules

- One chapter per iteration. Depth beats breadth; do not stub.
- Never edit research/ digests. Never delete another author's manuscript file.
- Diagrams: mermaid blocks inline (rendering handled at build time).
- After all chapters exist: appendices (A–F), then EDITORIAL_SYSTEM pass log
  updates, then `tools/build.sh` must produce a clean EPUB (add missing
  build assets if needed — cover SVG→PNG via render-figures.sh pattern).
- Do not claim Gate passes you did not perform. Record honest status in
  PROGRESS.md and QUALITY_REPORT.md.
- Numbers discipline and forbidden list in STYLE.md are hard constraints.
- If genuinely blocked (missing research, build failure you cannot fix
  after 3 attempts), write the blocker to PROGRESS.md under
  `## Blockers` and move to the next chapter.

## Definition of done

All 18 chapters + prologue + appendices drafted, Gate-1 self-review logged
per chapter, EPUB builds with one command, PROGRESS.md tells the whole
story honestly.
