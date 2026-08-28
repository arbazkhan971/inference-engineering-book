# Back matter — beginner-simulation + teaching audit

audited: 2026-08-28 · auditor: glm-5.3-flash (worker, wave C lane `ped3-back`)
surface: manuscript/zz-back-matter.md (3 H2 sections, 391 words)
method: cold-read simulation of a smart 25-year-old non-engineer, STYLE.md pedagogy rules applied as back-matter-appropriate (no ELI5/closers owed — linter exempts non-numbered files; judged as credits, method note, fine print).

## Findings

### CONFUSING

1. **[CONFUSING] "an autonomous fleet of well over one hundred GLM-5.3 model instances"** (How this book was written) — the single densest jargon moment for a lay reader: a specific model name plus "instances" in the sentence a curious outsider is most likely to read (it is the book's authority hook). One gloss fixes it.
   *Fix:* "an autonomous fleet of well over one hundred GLM-5.3 model instances — one AI model, one hundred parallel copies — ran the research".

2. **[CONFUSING] "seventy-plus dated, sourced evidence digests" and "Every claim traces to a digest or carries a visible hedge"** (How this book was written, twice) — the manuscript's own fix passes banned reader-facing "digest" as jargon (ch04 iteration-31, ch11, ch16 lessons; ch18 deviation note (b): "reader-facing 'digest' wording banned"). The back matter violates the book's own terminology rule — a consistency defect, not just a pedagogy one.
   *Fix:* "seventy-plus dated, sourced research notes" / "Every claim traces to a research note or carries a visible hedge."

3. **[CONFUSING] "drafted chapter by chapter on a headless writing driver, against a six-gate editorial system"** (How this book was written) — two engineer terms ("headless writing driver", "six-gate editorial system") stacked in one clause.
   *Fix:* "drafted chapter by chapter by an automated writing loop that ran on its own, under a six-checkpoint editorial system."

4. **[CONFUSING] "The repo — manuscript, research corpus, and build pipeline — is public"** (How this book was written) — three jargon nouns ("repo", "corpus", "build pipeline") in the sentence asking the reader to go look. The reader you invite should be able to parse the invitation.
   *Fix:* "The project — the full manuscript, the research notes behind every number, and the scripts that assemble the book — is public: github.com/arbazkhan971/inference-engineering-book."

### POLISH

5. **[POLISH] "ccrank.dev/user/arbaz-khan"** (About the author, links) — the bio's proof device says "metered publicly" but the link carrying the meter is unlabeled; an outsider cannot tell it is the receipt for the 200-billion-token claim.
   *Fix:* gloss the link: "ccrank.dev/user/arbaz-khan — the public meter".

6. **[POLISH] "committed alongside the manuscript"** (Copyright) — git vocabulary leaking into the fine print.
   *Fix:* "archived alongside the manuscript".

7. **[POLISH] "the front matter's rule about numbers"** (Copyright) — book-production vocabulary; a Kindle reader usually infers it, but the gloss is free.
   *Fix:* "the rule about numbers at the front of the book".

8. **[POLISH] "backend engineer and harness engineer"** (About the author) — the series' coined title lands fine for a book-finisher (ch01 defines the discipline) and is intentional branding; keep, but note that cold back-matter browsers (rare, samples rarely reach here) meet it undefined. No fix owed.

9. **[POLISH — optional, scope note for the driver] No "read next" pointer.** The series ladder (Vol. I *Harness Engineering*) is mentioned only inside the bio sentence. A two-line closer ("Keep going: *Harness Engineering* …") would convert finishers; this is a marketing addition, not a defect — driver's call, not applied here.

### LOST

None. At 391 words of credits/fine print there is no point where the beginner reader hard-stalls; the section grades reflect friction, not failure.

## Section grades (1–5 teachability)

| Section | Grade | Note |
|---|---|---|
| About the author | 4.5 | Tight, credible, brand voice lands; only the meter-link gloss owed |
| How this book was written | 3.5 | Best hook in the file, highest jargon density; fixes above take it to ~4.5 |
| Copyright | 4.0 | Appropriate boilerplate; clean shelf-life framing; one git-ism |

**Average: 4.0 / 5.**

## Three worst teaching gaps

1. **The authority hook is written at engineer density.** "How this book was written" is the section outsiders quote; today it requires the book's own vocabulary (digests, repo, headless driver) to parse. Findings 1–4 fix it in ~40 words.
2. **Terminology-rule drift.** "digest" survives reader-facing here although three chapter fix-passes banned it — the back matter escaped the copyedit sweep's banned-term scan (that scan ran manuscript chapters; recommend adding zz-back-matter.md to the scan's file list).
3. **The proof point's destination is unlabeled.** The 200B claim's receipt (ccrank link) needs its two-word gloss for the claim to be checkable by exactly the reader it impresses.
