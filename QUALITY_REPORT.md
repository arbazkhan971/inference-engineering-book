# QUALITY REPORT — Inference Engineering (Volume II)

Honest, checkable status of the book against the six-gate editorial system,
per AGENTS.md ("Record honest status in PROGRESS.md and QUALITY_REPORT.md").
Every claim below names its evidence; every gate names its re-verification
command where one exists. Last updated: 2026-08-28, after the pedagogy
wave's twentieth fix pass: iteration 81 completed the appendix B
pass — all 20 findings applied (4.3/5 — 2 [LOST] + 10 [CONFUSING] +
8 [POLISH]; the auditor hand-recomputed all 16 worked examples and
found every one correct, so every fix is gloss/scaffold-level).
Headlined by the audit's two LOST gaps — the sharding card's five
unexpanded acronyms (the one card a motivated beginner genuinely
could not use) and "real kernels" misreadable as the operating-
system kernel — both fixed: the sharding formula line now expands
every axis (TP (tensor) × PP (pipeline) × EP (expert) × CP
(context) × DP (data) parallelism), and the roofline card now reads
"real GPU programs (kernels)". The ten CONFUSING fixes: w and r
defined before the cache loop's first use (both pointing at the
constants box; mid-2026 1.25 and 0.1); c defined in the prefill
decomposition's symbol line using chapter 11's own coinage ("a
per-model constant you never need to number"); the double-compressed
ridge-point sentence decompressed ("one division using numbers from
the chip's spec sheet … before compute, not bandwidth, becomes the
bottleneck") — which removes B.1's "binds", so the binds gloss lands
at the new first surviving use in B.2 ("weights, not KV, bind
(become the bottleneck)"; documented deviation from the audit's
named site, forced by the same-coordinate rewrite); MoE expanded at
its true first use (the decode-payload card); the sessions card's
80−61≠15 gap closed with the formula's own workspace term ("~15 GiB
left after a ~4 GiB workspace reserve"; 80−61−4 = 15); the compaction
worked line now labels its terms (0.1 × 30K = 3K per turn versus
0.1 × 150K = 15K per turn → t = 2.5); the expiry example carries its
missing price ("Opus-5-class list prices, ≈$5/M input" — verified
against Appendix C's Opus 5 row and re-derived: 200K × $5/M = $1.00
full price, × 1.25 = $1.25 write, × 0.1 = $0.10 warm read);
collectives glossed with chapter 10's own coinage ("synchronized
data swaps between chips"); H100 glossed at first use ("an AI
accelerator chip"). The eight POLISH fixes: token defined at its
first use pointing at Appendix A; the format-name digits explained
at FP8's first use ("counts bits per stored number"); the decode
identity's when-it-lies restated plain while keeping the title word
("an identity, not a predictor; queueing and jitter hide in the
leftover difference" — appendix D's cross-reference stays coherent);
burndown and K-of-N each glossed in one clause; the 0.7 rule tied to
the roofline card's 60–80%; active bytes connected to its own
explanation; the intro's card anatomy converted to a literal
four-bullet map; entering/generating given their formal names
(prefill/decode). Ripple greps clean (removed phrases zero-hit;
"binds" once glossed plus the audit-blessed second use; K-of-N
gloss agrees in substance with chapter 15's own); no figures
changed (the file carries no mermaid). Appendix B now 2,705 words
(+180, all gloss/scaffold-bearing). Prior pass kept as history:
iteration 80 completed the appendix A
pass — all 13 findings applied (4.0/5 — 2 [LOST] + 5 [CONFUSING] +
6 [POLISH]), opening the reference-surface half of the queue.
Headlined by the audit's worst gap — undefined primitives below the
glossary's own floor — every flagged entry now defines its words:
BPE's byte gloss mirrors chapter 2's own coinage; the Logit mask
entry carries chapter 13's logits definition and writes negative
infinity instead of −∞; GEMM/GEMV gains the matrix/vector gloss over
chapter 3's tokens'-rows antecedent; the token trie keeps chapter
13's prefix-tree coinage, glossed. The arithmetic-intensity cluster
has its everyday picture back ("which bottleneck is yours — the
thinking or the fetching"; ridge point's tipping-point append); the
decode-time inequality's symbols are expanded at point of use (e2e =
end-to-end time; N = the reply's token count); GPU and Throughput
entries are added (the glossary's acronyms-expanded-in-entry promise
now kept for its two most-used terms); and 16 unnumbered H3
mini-heads group every entry under the chapter title that coined it
(4/7/5 across A.1–A.3; A.4 untouched per the audit's own 4.5
grading), with the intro stating the shortcut contract. Documented
deviations: the byte/logits/GEMM/trie glosses mirror the book's
existing coinages over the audit's ad-hoc phrasings (book-coinage
precedence); the mini-heads are chapter titles rather than the
audit's illustrative names — the reverse-index promise made physical
— and A.2 carries seven rather than three-or-four because it spans
seven chapters. Residual logged: chapter 14's own cache-salt table
row keeps "tenants" (closed audit; its picture column carries the
meaning — the iteration-72 no-front-running precedent). Appendix A
now 3,816 words (+258, all gloss/entry/mini-head-bearing). Prior
pass kept as history: iteration 79 completed the ch18 pass — all 11
findings applied (4.44/5 — zero [LOST]; 5 [CONFUSING] + 6
[POLISH]), closing the chapter half of the pedagogy queue (ch01–18
all applied). Headlined by the audit's single worst gap: the one metric
that prices the local ladder — perplexity, load-bearing in the GGUF
snapshot box — was unintelligible on the page; it is now glossed at
the intro sentence above the box ("size in gigabytes against
perplexity, how surprised the model is by held-out text, where lower
is better" with the chapter-9 pointer, verified true before
applying; documented deviation: the audit's "confusion score"
replaced by chapter 9's own table definition per book-coinage
precedence). The assembly walkthrough — the chapter's composition
lesson delivered as one ~100-word recall test — is re-broken into
six numbered steps at the diagram's node boundaries (same prose,
keyed "numbered in the diagram's order"). The build-log process leak
is out of the durable spine ("after the adversarial pass … over
their tildes" became "hardening guards added during the companion's
attack testing … slightly over their estimates"; the manufacturing
record stays in appendix D's itemization, whose queued audit owns
it). Also applied: "unpurchased again" → "without re-introduction"
(residual logged: ch17's identical phrase belongs to ch17's closed
audit, unedited per the iteration-72 cross-chapter precedent);
"importance sampling" de-jargoned (book-only site, grep-verified);
the book's single unexpanded SLA expanded; 18.4's restaurant→van
frame switch repaired; the tracer row's ITL linked and N bound; the
ship checklist given its four standalone micro-glosses ("429 storm
(over-quota rejections)", "p50/p95 (median and 95th-percentile)",
"K-of-N … succeed if K of N complete", "all-open bypass (every
breaker tripped)"); the "Sixteen of these eighteen chapters"
countability wobble softened; and the quant-ladder name cascade
given its signpost ("you do not need the names, only the shape of
the menu"). Mermaid block byte-untouched (zero mermaid lines in the
diff — SKIP_FIGURES validation sound). Ch18 now 5,893 words (raw
wc; +81, all gloss/signpost/numbering-bearing), inside the 6,500
Part IV cap. Prior pass kept as history: iteration 78 completed the
ch17 pass —
all 13 findings applied (4.3/5 — zero [LOST]; 8 [CONFUSING] + 5
[POLISH]). Headlined by the audit's single worst gap: the hash
mechanics under the whole chapter — taught only through prices and
consequences — now glossed at both flagged sites (the intro's "cache
key" gains "the bytes themselves are what the provider files it
under"; the 17.2 mechanics sentence gains "(computes a running
fingerprint of the bytes — chapter 6's hash chain)"). The
chapter-11 stat dump now leads with its measured quantity ("how much
of the original conversation a compacted model can still answer
questions about"; all four percentages verified against ch11's own
statement before applying); the token-equivalents unit is glossed at
its true first use, one paragraph before the audit's site (documented
deviation: "30K-equivalent" in the warm-compaction paragraph precedes
the 15K breakeven); "herd event" is glossed and anchored to chapter
6's own "cache-herd events" coinage (the audit called it
unanchored); "stubs" → "placeholder entries plus on-demand tool
search", matching ch14's coinage; "blast radii" glossed in apposition
without the audit's false attribution (documented deviation:
grep-verified ch14 never uses the phrase — its coinage is "the render
order is the invalidation order"); the 20-block lookback's "block"
glossed ch14-consistently rather than the audit's "small, fixed span
of tokens", which would have reintroduced exactly the three-meanings
confusion iteration 75 eliminated ("a block is one message or tool
result — chapter 14's content block, not chapter 6's 16-token
pages"); the 17.4 ELI5 fusion flagged ("behaves like"); the
darkroom-rehydration picture shipped to 17.4 as the 17.1 table
promised; the picture-stops list completed with 17.6's accountant
frame and its quality-blindness break; the 17.2 ELI5's "premium
members" glossed inside the block; and the intro's unused garage
dropped per the audit's own conditional (its condition fired when
finding 1 touched the same sentence). Mermaid blocks byte-identical
(md5-verified — SKIP_FIGURES validation sound). Ch17 now 6,928 words
(raw wc; +150, all gloss/on-ramp/break-bearing), 6.6% over the 6,500
Part IV cap on a base already logged 1.1% over (iteration 21, five
trim passes) — logged rather than trimmed, consistent with the
pedagogy precedent. Older history: iteration 77
completed the ch16 pass — all
8 findings applied (4.41/5 — zero [LOST]; 6 [CONFUSING] + 2
[POLISH], every one a one-phrase fix). Headlined by the audit's #1
gap: 16.6's inclusive-vs-exclusive teaching floor arrived field-first —
it is now fronted by one bridge sentence ("Some providers fold the
discounted part into the grand total; others list it as separate line
items. Read the receipt's shape before you multiply"), converting the
section's core concept from a field-name swim into the receipt picture
the vocab table already owns. The worksheet's undefined hit-rate
variable h introduced at its load-bearing moment ("so the hit rate,
h, is measured, not assumed" — it recurs in Prove it); "affine" kept
but glossed plain ("a straight-line (affine) formula: one term you
control, one you rent" — the audit's parenthetical option, keeping
the technical term for the expert basement); the 16.2 strategy-name
wall glossed per name ("least-busy (pick the idlest wire),
latency-based-routing (pick the fastest)" — the wire ties to the
switchboard ELI5); the RouteLLM benchmark wall tagged inline at
book-first use ("MT Bench (chat), MMLU (multiple-choice knowledge),
GSM8K (grade-school math)" — MT Bench and MMLU are book-first uses
here, GSM8K's tag a spaced recall after ch09's gloss; the follow-up
gloss sentence kept verbatim as emphasis per the audit's design); the
hashed model_id implementation detail cut from 16.5 (zero teaching
load; grep-verified nowhere else — the hash detail stays in LiteLLM's
docs, cited in See it); the headroom sentence made self-contained
("the small notes providers staple to every response — the
x-ratelimit-remaining-* headers (chapter 15)"); and the Langfuse
cliff sentence split in two, the plain restatement being the quoted
rule's direct consequence ("one non-OpenAI field in the payload and
the normalization no longer applies" — documented wording deviation
from the audit's literal "it applies only if", which would have
repeated the quote verbatim). No reviewer false positives; ripple
greps clean (affine survives only in ch09's quant machinery and the
new parenthetical; hashed / scrape-x-ratelimit / identified-by-a-
hashed gone book-wide). Mermaid blocks byte-identical (no figures
touched — SKIP_FIGURES validation sound). Ch16 now 6,393 words (raw
wc; +58, all gloss/bridge-bearing) on a base already logged ~11% over
the 5,500 concept cap as content-bearing (iterations 20/42) — logged
rather than trimmed, consistent with the pedagogy precedent. Prior
pass kept as history: iteration 76 completed the ch15 pass —
all 15 findings applied (4.36/5 — zero [LOST]; 7 [CONFUSING] +
8 [POLISH]) plus the advisory worst-gap recaps. Headlined by the
audit's worst gap — cache write/read, load-bearing in 15.2's quota
box and all of 15.3's meter arithmetic, yet absent from the
Words-before-machinery table — now carried as one row ("First send
of a prompt prefix (counted as fresh input) vs re-send of one the
provider already holds (often uncounted at the meter)" / "The first
photocopy of a document vs the second"; documented deviation: the
audit's "often free" became "often uncounted at the meter", because
the chapter's own 15.3 text and chapter 14's nothing-is-free
discipline both forbid "free" — reads still bill at 0.1×). The
opening's bare 429 is glossed at first use ("the 429-class response
(`too many requests`, section 15.4)"); 15.4's word collision — the
fresh 529-"overloaded" picture against "deliberately overloaded in
meaning" one paragraph later — resolved as "deliberately ambiguous
in meaning"; the utilization notation split (fraction in 15.2,
percent in 15.6) harmonized ("as utilization nears 100% (a fraction
of one — chapter 5's ρ)", ch05's own notation grep-verified); the
Anthropic 10M-effective claim now shows its division ("only a fifth
of input is fresh at that hit rate, so the effective ceiling is
2,000,000 ÷ 0.2" — digest-attested arithmetic); K-of-N glossed at
its book-first use ("accept the first K of your N results — any 70
of a 100-wide step, say" — documented deviation: the audit's "any
700 of 1,000" re-anchored to the chapter's own N=100 step four
sentences upstream); the `except` sentence de-codenamed ("both land
in the same error handler (`except`, in most languages)", dropping
"mid-fanout" — and the audit's premise that fanout is chapter 10's
word is a reviewer false positive: grep shows ch10 never uses the
term); plus the credential/key standardization (the API expansion
moves to the equivalence's first use — "an API (application
programming interface) key is just a credential" — then "five extra
keys" and "The key is a name tag, not a bucket"), the quota box's
burndown pointer, QPS tied to the table ("the same idea as RPM"),
"wire requests" glossed ("actual HTTP calls that leave your
machine"), the adaptive-throttle `+ 1` given its why ("only guards
against dividing by zero on the first request"), "vertical
asymptote" glossed ("the point where the curve goes straight up"),
the character-count estimate named as a proxy ("the provider
estimates your prompt's token count from its character count" —
documented deviation: the audit's "cannot know your token count
before reading it" is not digest-attested and states an impossibility
the docs do not), and the token-bucket row's mixed metaphor cleaned
("A tank that refills continuously; each request drains it").
Worst-gap 2 (advisory) applied: four one-line italic recaps now
close each of 15.3's provider paragraphs (OpenAI: reserve first, no
forgiveness; Anthropic: split meters, reads bypass the input meter,
burst-trap; Gemini: carry-in only, Pacific-midnight reset; Bedrock:
multiplied output, up-front reservation, uncounted reads). Appendix
A ripples (the glossary mirrors chapter tables by design): Token
bucket re-worded to match the fixed row; Cache write / Cache read
extended with the quota sense and re-tagged (Ch. 14, 15). Ripple
greps clean: "overloaded in meaning" / "mid-fanout" / "credit tank"
/ "K-of-N results" / "nears one" return zero manuscript hits, and
the later K-of-N uses (lever table, Build-it, ch16, ch18, appendices
B/D) all sit after the gloss site. Mermaid blocks byte-identical
pre/post (md5-verified). Ch15 now 6,022 words (raw wc; +231, all
gloss/on-ramp/recap-bearing), 9.5% over the 5,500 concept cap —
logged rather than trimmed, consistent with the ch13 (12.0%) /
ch09 (6.6%) logged-over precedent. Prior pass kept as history:
iteration 75 completed the ch14 pass — all
14 findings applied (4.17/5 — 3 [LOST] + 6 [CONFUSING] + 5 [POLISH];
the auditor independently re-derived the chapter's arithmetic — punch
card, 525,000 loop, 354,200/90,450 totals, fanout 5.01M, all six
chart points — and found it correct; the findings are teaching-only).
Headlined by the audit's worst gap: the three meanings of "block" in
one chapter — chapter 6's 16-token KV pages, Anthropic's content
blocks in the 20-block lookback and the leapfrog rule, and the worked
example's own turn blocks — now disambiguated at the lookback's first
use ("blocks here are Anthropic's *content* blocks (a message or tool
result), not chapter 6's 16-token pages"; content blocks are the
book's own ch12 vocabulary, so the fix distinguishes two units the
book itself taught rather than importing a new fact), with the worked
example's block labeled ("every turn's 1,000-token history block") —
a reader who internalized ch06 no longer computes 20 × 16 and lands
confidently wrong. [LOST] #2: the leapfrog rule gained its missing
why — "a checkpoint left more than 20 blocks behind can no longer see
any cache entry near the tail, so its write premium buys nothing;
leapfrogging keeps one checkpoint always inside the window the
provider will actually match." [LOST] #3: the mechanism sentence —
the chapter's only physics, three jargon terms in one breath —
glossed inline (the hash as a fingerprint of the opening bytes that
matches only exactly those tokens; resident as a stored copy still
live; pinned as held by your request rather than left to the clock),
the sentence verified digest-verbatim before glossing. The two
un-derived arithmetic islands now derived on the page: the 30,000
history-read total shows its triangular count ("re-read 0, 1, …, 24
times as turns arrive — 300 block-reads × 1,000 tokens × 0.1 =
30,000"; 0+1+…+24 = 300 re-derived before applying), and the ≈1.74
1-hour crossover carries its two-line derivation (2.0 + 0.1·N <
1.25·N once N > 2.0 ÷ 1.15 ≈ 1.74 — the same inequality ch17 runs
at session scale; the audit's appendix-B-card option was rejected
because the card carries only the 1.6 form). Also applied: Opus/
Sonnet/Haiku introduced as Anthropic's large/mid/small tiers at the
minimums row; hidden system tokens glossed ("tokens the provider
injects on your behalf, tool schemas and the like" — digest-attested
hidden system content incl. tools); the salt row's circular "cache
key" replaced by "the identity the provider fingerprints your prefix
into" with the appendix-A mirror rippled; the hit-rate picture
re-flavored to reuse ("a form letter already on the printing plate" —
the chapter's own engraver family, replacing the non-reuse quiz
picture); "the miss price" → "the uncached (miss) price"; the
serializer gloss ("the code that packs your request into bytes" —
wider than the audit's tool-list wording, because the flagged
sentence's serializer re-serializes history) and the tool-stub gloss
(minimal placeholder definitions); the opening KV recap anchored to
chapter 4's actual coinage ("the model's memory of having already
read them, chapter 4's per-request notes" — the audit's "notebook"
was never ch04's word, documented deviation); and the
actuarial-insurance sentence restated in plain words (count the
expiries you expect per idle hour against the 0.75× extra premium —
that is the whole decision). Ripple greps clean: the quiz picture and
"actuarial" are gone book-wide; "notebook" was never introduced (the
deviation above); "cache key" survives only in ch17's own sites, whose
pedagogy audit is queued (no front-running); the 20-block
sites verified against ch06's 16-token definition. Ch14 now 5,658
words (+238, all gloss/derivation/on-ramp-bearing), 2.9% over the
5,500 concept cap — logged rather than trimmed, consistent with the
ch02 (2.9%) / ch06 (2.5%) / ch04 (5.6%) pedagogy precedent. Prior
pass kept as history: iteration 74 completed the ch13 pass — all
9 actionable findings applied (4.69/5 — zero [LOST]; 7 [CONFUSING] +
2 applied [POLISH]; the third [POLISH] is the audit's explicit
keep-as-is on inline checkpoint answers, no change). Headlined by the
audit's single worst gap: the triple-duty compile sentence in 13.2 —
compile, intersect, and per-state lookup nested in one clause chain,
the only place a beginner risks a full stall — now split into three
plain sentences ("the engine first compiles the grammar over
characters. Then it intersects that rule set with the tokenizer's
entire vocabulary, using a token trie — a prefix tree over the
vocabulary. The result is, for each rule-machine state, the exact set
of legal token ids"). The audit's #2 gap — four name-dropped sampler
knobs in a sentence whose point is "they still apply" — glossed in
place ("the dials that control how adventurous each word choice is");
documented deviation: the audit's "(chapter 2's tour)" pointer dropped
— grep-verified that sampler-knob content exists nowhere outside ch13
in the manuscript, and iteration 39's gate-2 fix removed exactly that
false pointer (the lever table's "Not owned elsewhere — glossed in
§13.2" row stays true). Section 13.5's academic armor — the audit's #3
gap — carries its two parentheticals: pass@3 glossed ("allowed three
attempts," completing the notation family chapter 2's pass@1
definition opens) and TC⁰ inverted picture-first ("limited to circuits
too shallow for some reasoning problems (the complexity class TC⁰),
making certain correct outputs unreachable in principle"). Also
applied: "context-free" given its plain gloss ("the kind whose rules
can nest brackets to any depth, which is exactly why the machine
needs a stack") with the pushdown push/pop mechanics kept;
`additionalProperties: false` glossed ("no fields beyond the ones you
declared"); the quoted CFG acronym keyed after the quote ("CFG is the
bracket-nesting grammar kind from 13.2," folded into the citation
parenthetical); the opening's unglossed "sampler" replaced by "the
engine's word-choosing machinery" (sampler's first surviving use is
now 13.1's self-defining vocabulary paragraph, with 13.2's full
definition following); and the key-finding clause "behavioral, not a
parsing artifact" bolded per the audit's consider-bolding note.
Ripple greps clean: "an FSM carrying a stack" / "the complexity class
TC⁰ —" / "reaches into the sampler" return zero manuscript hits;
context-free, TC⁰, and additionalProperties appear in no other file
(appendix A carries none of the three). Ch13 now 6,157 words (raw wc;
+52, all gloss-bearing), on a base already logged over the 5,500
concept cap as content-bearing (iterations 17/39) — logged rather than
trimmed, consistent with the pedagogy precedent. Prior pass kept as
history: iteration 73 completed the ch12 pass — all 12 findings
applied (4.4/5 — zero [LOST]) plus both advisory worst-gap items.
Headlined by the event/delta/chunk disambiguation at the chapter's
front door ("the *event* is the envelope, the *delta* is the slice
inside it, and *chunk* is the common vendor name for an event that
carries deltas — two things, three words"; the common-vendor-name
widening of the audit's "simply OpenAI's name" is the documented
deviation, because the chapter's own Gemini sentence and the digest
use "chunks" for both wire formats) and the digest-exact rewrite of
the parallel-calls contradiction (same-call fragments arrive in
order, never mixed inside one slot; between calls, other fragments or
text may appear — buffer per call slot, never globally; the audit's
"with nothing else in between" dropped as unattested). Pydantic and
enum glossed at 12.2; p99/p50 spaced recalls; the chapter-14
cache-lifetime pointer; the first-stop-wins clause in the stop-reason
state machine (consistent with Appendix D's rule 3 and the companion's
stop() dedup); the PCM and middleware glosses; the recap flag on the
dated four-grammars box; and both reference-wall flags (12.2's
provider walk and 12.5's usage bullets each tell the reader they are
not meant to memorize — the normalizer exists so they never have to).
Ch12 now 5,678 words, 3.2% over the concept cap — logged, consistent
with the pedagogy precedent. History: iteration 72 completed the ch11 pass — all 11 findings
applied (4.2/5 — 1 [LOST] + 5 [CONFUSING] + 5 [POLISH]).
Headlined by the audit's one [LOST]: the 11.2 tier-cliff money example,
the chapter's only spot where a careful beginner builds an actively
wrong model — the ambiguous "100K more usable room" clause is replaced
by the reconciling arithmetic ("The big request carries 1.5× the tokens
*and* pays double per token — 1.5 × 2 = 3× the bill") and the closer now
reads "You pay double per token for the fog," so the doubled rate and
the tripled bill no longer collide. The 11.2 quadratic decomposition
gained its missing middle rung (one inserted sentence: "Under the hood,
every model has two moving parts: a page-by-page part … and a
cross-referencing part …" — so N² and 2·W land on the ladder instead of
dropping from the ceiling; documented deviation: the audit's "library
part" became "page-by-page part," since "library" collides with the
`long-context-attention` library named two paragraphs later).
DeepSpeed-Ulysses — the chapter's only picture-less mechanism — got its
picture: the 11.3 ELI5 is extended with the question-type family of
clerks ("each clerk answers one category of question — all the dates,
say — for the whole file"), with attention heads mapped to question
categories at the term's true first use (the Ring bullet, one sentence
before the Ulysses bullet the audit pointed at) and the Ulysses bullet
anchored "The other family from the ELI5." The 11.1 table's Pass-KV row
is de-jargoned ("Which cargo circulates…"; "tensor" now carries a
chapter-5 recall gloss at its true 11.3 prose home); Ring Attention's
query block is glossed at the mechanics site ("the questions the
current tokens are asking"); the 11.5 layer-one arithmetic names its
baseline ("30K fresh versus the old 15K-equivalent read"); the formula
constant c carries chapter 3's ignore-it gloss ("a per-model constant
you never need to number"); the MagicDec sentence splits rule-first,
evidence-second; "contract-layer view" → "what it looks like from the
API's point of view"; "the trap composes with caching" → "stacks"
(same-idiom ripple: 11.6's "Compose with" → "Combine with"; other
chapters' compose sites belong to their closed or queued audits); the
KVSL row's binder is self-evident ("The whole binder: the file plus
every note taken since"). Appendix A ripple: the Pass-KV entry is
re-worded to match the fixed table row — the "tensor" leak had survived
in the glossary. All touched arithmetic re-derived before applying
(300/199 ≈ 1.5; $4/$2 = 2; $1.20/$0.40 = 3; 30K vs 15K = 2×; 30K × 1.25
= 2.5×; 30K × 0.1 = 3K, 5× cheaper). Ch11 now 5,319 words (raw wc;
+169, all gloss/on-ramp/picture-bearing), inside the 5,500 concept cap.
History: iteration 71 completed the ch10 pass — all
21 findings applied (4.3/5 — zero [LOST]; 9 [CONFUSING] + 12 [POLISH]),
recovered from an interrupted session's uncommitted working tree and
verified hunk-by-hunk against the audit. Headlined by the audit's worst
gap — four undefined load-bearing terms, each now glossed at first use:
collectives ("synchronized data swaps between chips") in 10.2, hidden
state ("the token's working copy so far") at its true first use in the
10.2 EP bullet (covering 10.3–10.5's reuses), rank ("the supercomputing
word for one chip's slot in the group") in 10.3's CP sentence, and —
the audit's single worst — the residual connection inside the
silent-drop payoff sentence ("continues past that layer unchanged,
carried by the transformer's always-open side path — arriving without
that expert's contribution"). The missing 74 GB derivation is shown
(37B active × 2 bytes ≈ 74 GB, derived) — the identical pattern the
chapter already used for 1,342 GB, and the exact arithmetic Checkpoint
Q2 examines. The 10.2 product formula gained its worked example ("The
choices multiply: 2-way TP × 4 pipeline stages × 2 copies = 16 chips");
10.3's expert operation names carry "(names you can skip; the point is
two synchronized swaps per layer)"; the 10.1 table leads plain on TP
and Grouped GEMM and gained its missing EP row after CP; "shard" and
"dense" are glossed at their first uses; the router is "a tiny learned
scorer"; DeepEP's streaming multiprocessors are glossed before their
later use; the production paragraph is marked "(depth layer — skim on
first read)"; "ontology" → "taxonomy of skills"; the nested mermaid got
its reading instruction ("boxes inside boxes as chips inside groups
inside copies"). Appendix A ripples: TP and Grouped GEMM entries
re-worded to match the fixed table and a new EP entry added — the
glossary's old Grouped GEMM text carried the audit's "landed tokens"
jargon. The mermaid block is byte-identical (SKIP_FIGURES validation
sound); the one added number re-derived (37 × 2 = 74). Ch10 now 5,616
words (raw wc; +173, all gloss/on-ramp/row-bearing), 2.1% over the
5,500 concept cap — logged rather than trimmed, consistent with the
pedagogy precedent. History: iteration 70 applied
all 14 ch09 findings (4.2/5 — zero [LOST]; 6 [CONFUSING] +
8 [POLISH]) — headlined by the affine-math
paragraph (the audit's worst gap): the zero-point `z` now carries its
"you may ignore it" parenthetical (a small offset so that zero lands on a
grid point), and "15 levels" is corrected to "2^4 − 1 = 15 equal steps
between 16 grid points" so the counting beginner's finger matches the
formula. The 9.4 headline finding (the 4-bit reasoning cliff) rides three
plain sentences instead of one triple-dash construction; the promissory
opener is split and de-dashed; matmul → "the matrix multiply (the giant
multiplication at the heart of every layer)"; the Hessian parenthesis is
plain-first ("a mathematical map of how rounding errors ripple forward…";
an approximate Hessian — the technical name for that error map); the e4m3/
e5m2 parenthetical keeps the gate-2 bit attribution but gains a plain frame
("the digits count exponent bits then mantissa bits, 4-and-3 or 5-and-2");
"brain float 16" (the book's outlier — every other chapter says bfloat16)
is dropped for the 9.1 table's own definition; the 0.7 haircut is re-coined
as "chapter 3's 0.7 kernel-efficiency discount" at both sites; the lever
table's Where column now uses the book's own convention (Chapter header,
bare chapter numbers, "N (this chapter)") after the audit flagged the
"this chapter, 3" vs "this chapter, 16" ambiguity — documented deviation:
the audit's §9.3 reading contradicts the row text, which points at chapter
3's floor and chapter 4's cache; MRCR leads plain ("a multi-round
who-referred-to-what benchmark; the literature calls it co-reference
resolution"), keeping the gate-2-corrected official term. One ripple beyond
the audit: ch10's "haircut caveats" → "efficiency caveats" (the term's only
surviving site after ch09's rename; ch03 itself says efficiency factor,
never haircut). Ch09 now 5,864 words (raw wc; +92 over its sealed 5,772 —
glosses and splits, net of the dropped re-expansions), 6.6% over the 5,500
concept cap on a base already 4.9% over and logged content-bearing — logged
rather than trimmed, consistent with the ch04 (5.6% post-pass) pedagogy
precedent. History: iteration 69 applied all 12 ch08
findings (4.4/5 — 1 [LOST] + 6 [CONFUSING] + 5 [POLISH]) — the audit's
[LOST]: the correction rule, the chapter's one theorem, now carries its
plain-words ladder immediately after the formula ("each model holds a
ranked preference list over the next word — that list is the distribution.
Subtract the drafter's preference for each word from the target's, throw
away anything that drops below zero, rescale what remains so the list sums
to one again, and draw the replacement from that corrected list"). The
three borrowed load-bearing terms are glossed — logits at its true 8.2
first use ("a raw preference score for every possible next token", with
8.5's −∞ glossed as "a score so low the sampler can never draw them"),
n-gram at 8.3 ("a run of n consecutive tokens; a 3-gram is three in a
row"), and the EAGLE hidden state ("the model's private intermediate
notes, computed before it commits to any word"; the vocab table's "hidden
layers" → "early layers"). Also applied: the roofline 295 given its
one-clause scale with "balance point" re-coined to chapter 3's own "ridge
point", the mode/greedy/argmax cluster glossed, tree attention glossed,
E[progress] and 70B expanded, "8×H100" → "eight H100 chips", sub-token
amortized cost unfolded, and GQA pointed at chapter 4's cache-shrinking
designs (§4.5 is literally "Four ways to shrink the coat"; the audit's
"cache-sharing" would have mispointed at chapter 6's prefix sharing).
Provenance: the manuscript edits came from an interrupted session's
committed partial (1547b62); this iteration verified every hunk against
the audit and every cross-chapter reference, confirmed zero numeric drift,
and ran full validation. Ch08 now 5,555 words (+220, all gloss-bearing),
1.0% over the 5,500 concept cap — logged, consistent with the
ch06/ch02/ch04 pedagogy precedent.

History: iteration 68 applied all 6 ch07 findings (4.70/5,
zero [LOST] — 3 [CONFUSING] + 3 [POLISH]) — headlined by the audit's
worst-gap hardware-name cluster: "tensor-core-shaped" dropped for
chapter 3's own coinage ("the chip's specialized matrix-math units" —
grep showed ch03 had removed "tensor cores" book-wide, making ch07 the
only surviving site) and the NVLink/InfiniBand brand sentence retaught as
plain hops. Also applied: the "tail-latency constraints" opener softened
to "strict worst-case-wait limits" (the term keeps its self-glossed 7.3
site), "retrieved documents" → "attached documents", Checkpoint Q2's
formula taught in 7.2, and "forward pass" — used book-wide since ch01
but never defined — glossed below the timeline fence (the audit's in-fence
parenthetical breaks the 66-column reader-fit budget). Ch07 now 5,062
words, inside the cap.

History: iteration 67 applied all 19 ch06 findings (4.4/5,
zero [LOST] — 12 [CONFUSING] + 7 [POLISH]) — headlined by the audit's
worst-gap machinery cluster, now glossed at first use: the attention
kernel ("the chip's read-the-notes routine"), goodput (glossed against
chapter 5's own coinage), vLLM introduced as "the open-source serving
engine this chapter keeps using as its example", the intro's chapter-4
"KV desk" replaced by "the KV memory", and fragmentation glossed ahead
of 6.2's definitions. The hash-chain formula's H and ∅ symbols got
their plain-words caption line, and the 62-of-62.5 pricing leap now
shows its division (1,000 ÷ 16 = 62.5 — 62 whole blocks hit, the
half-block tail does not count). Also applied: Alpaca/ShareGPT
introduced as two public workload collections, the mamba constraint
glossed, the radix-tree triple-idea sentence split in three, "embed"
glossed, the never-hired librarian replaced by the translator (the
chapter's own prefix-caching ELI5 — repairs the dangling "her" two
breaks later), the 1.6 GB sentence's citation stack split, OS expanded
at its true book-wide first use, refcounts kept as a noun, the lever
table's compaction glossed as session-summarizing, a no-code on-ramp
in Build-it, and the barista/translator/print-shop connective line.
One opportunistic ripple beyond the audit: the duplicate HBM expansion
dropped (ch03 owns the letters book-wide). Two evidenced wording
deviations logged in Appendix F.1; ripple greps clean. Ch06 now 5,637
words (+226, all gloss/on-ramp-bearing), 2.5% over the 5,500 concept
cap — logged, consistent with the ch02/ch04 pedagogy precedent.

History: iteration 66 applied all 13 ch05 findings (4.3/5,
1 [LOST] + 7 [CONFUSING] + 5 [POLISH]) — headlined by the [LOST] fix at
the 5.5 queueing-formula wall: λ glossed beside ρ, and a plain-words
reading follows the formula before any symbol is reused. Also applied:
the de-jargoned cold open, the chapter-3 dependencies glossed at point
of use ("weight streaming" — a term ch03 never coins, per grep —
replaced by "the weight traffic chapter 3 priced"), the book's only
standalone "tensor" taught, attention glossed at its chapter-first use
with the audit's pointer corrected to chapter 4, the utilization
table's "M/M/1 form" replaced and system time defined, the ITL/TPOT
mini-equation, and all five [POLISH] items (the door-onto-stage image
adapted to avoid colliding with ch04's coat check). Three evidenced
deviations logged in Appendix F.1; ripple greps clean. Ch05 now 5,192
words, inside the 5,500 concept cap.

History: iteration 65 applied all 12 ch04 findings (4.5/5,
zero [LOST]) — headlined by the audit's numeric-honesty fix ("dozens of
times larger" became "tens of thousands" with the derived 131,072 ÷ 4 =
32,768× shown), the KiB normalization of the OPT/MHA comparisons with
one-step-checkable ratios (2,560 KiB from the full formula; 2,560 ÷ 320 =
exactly one-eighth), both advisory worst-gap items (the MLA micro-example:
2 × 128 × 128 = 32,768 numbers = 64 KiB vs 576 ≈ 1.1 KiB, ~57×; local
glosses at the 4.6 recall moments), and one completion fix beyond the
audit (the 4.5 heading's "Five ways" retitled "Four" — the ladder's
fifth row is the 1× MHA baseline). The pass was recovered from an
uncommitted working tree left by an interrupted session (all 12 findings
+ both gaps already applied); this iteration verified every hunk,
re-derived every number, and completed the three remaining fixes.
Iteration 64 applied all 20 ch03 findings (the wave's floor
chapter at 3.75/5) — the two [LOST] openings (the jargon-stack
intro now plain words with a deferral pointer into 3.2; FlashAttention now
picture-first with a working-notes bridge and a softmax gloss), nine
[CONFUSING] (the 3.1 table grown to seventeen rows with Weights/Parameter/
Kernel/TTFT/TPOT — the vocabulary the chapter's divisions actually use —
plus divisions shown, symbols glossed, the box restructured into
structure-vs-rates layers), and nine [POLISH]; the 13B roofline example
was also honestly re-anchored to chapter 2's actual 8B floor while being
de-e-notated. Appendix A reverse-index pointers rippled (Weights, TTFT,
TPOT now include chapter 3).

History: iteration 63 applied all 19 ch02 findings — the one [LOST] (the
BPE plain-words bridge before the formal merge sentence), 8 [CONFUSING]
(glosses and cache-vocabulary referents), and 10 [POLISH]. Iteration 62 applied all
12 ch01 findings — zero [LOST], 4 [CONFUSING]
(Token defined in the 1.1 table, the KV-caching gloss de-jargoned,
"Pareto frontier" replaced with the plain trade-off, throughput glossed
at true first use) and 8 [POLISH] (HTTP 200 anchor, venue glosses,
citation walls moved to Appendix E, forward pointer, Build-it on-ramp
for the no-codebase reader, scope sentence broken into three beats,
analogy bridges). Previously:
the gate-6 clean-checkout-build P2 pass (iteration 61 of the writing driver) applied
the three hygiene findings that iteration 60's seal had left unqueued
(review/gate6-clean-build.md — cover-render mtime guard so a stranger's
first build keeps a clean tree, stale README status table refreshed to the
sealed state, Volume-I temp-file prefix fixed) and re-sealed the release
candidate; full history below. Previously: the gate-6 companion-attack P2
pass (iteration 60) closed the companion queue; full history below.
Previously: the appendix-E and appendix-F technical-edit fix passes
(iterations 49–54, closing Gate 2 across chapters and appendices;
copyedit was iteration 46), and
re-verified post-seal in iteration 55: first figures-on retail build from
the exact final text (EPUB 6,282,581 bytes, 34/34 mermaid, 0 degraded),
fresh strict tsc recompile + both companion suites green, `tools/verify.sh`
ALL OFFLINE CHECKS PASSED, and a full rebuild left the working tree
byte-clean — zero drift against the sealed commit. Re-verified again at
iteration 56 (driver re-invoked, queue empty): `tools/verify.sh` ALL
OFFLINE CHECKS PASSED end-to-end, the EPUB rebuilt byte-identical
(6,282,581 bytes) with the tree clean apart from two ledger-accuracy
fixes made that pass (EDITORIAL_SYSTEM's final-proof row had kept
calling copyedit a pending gate though it passed 2026-08-27; §4's "closed
this iteration" was undated) — no manuscript, figure, or companion file
changed; the seal stands. Iteration 57 then re-opened the seal under the
architect's gate-6 queue: the adversarial claims + xref wave (committed
2026-08-28) found 0 P0 / 5 P1 / 11 P2; all five P1s were applied with
recompute discipline (see the Gate 2 row and Appendix F.1), validation
green afterwards (lint OK 113,707 words, reflow budget 0, 34/34 figures,
EPUB 6,282,454 bytes, validator passes, both companion suites green from
the unchanged dist), and the eleven P2s remain queued — the candidate
re-seals when that pass lands. Iteration 58 then applied the gate-6
companion attack's seven P1s (review/gate6-companion-attack.md): the
stream loop survives non-object payloads, non-numeric usage flags
`incomplete` instead of NaN, reservations are atomic, Bedrock overruns
are debited (ch15 Build-it + Appendix D updated to the both-ways
reconcile), unknown models throw a named `UnknownModelError`, the
ledger's hitRate now equals the gate's formula by construction, and
duplicate money rows sum on both sides — key repros wired into both
companion suites, strict tsc clean, suites green across repeated runs;
ten companion P2s stay queued — the last queue before re-seal, the
wave-1 P2s having landed in iteration 59 (twelve applied, two false
positives rejected with evidence — the OPT-13B figure is exactly the
book's own formula under the paper's real config, and vLLM's V1
max_num_seqs default is 128 per the dated digest and a live-source
check — one already fixed, one no-fix by judgment; details in the
Gate 2 row and Appendix F.1), validation green afterwards: lint OK
114,506 words, reflow budget 0, 34/34 mermaid staged 0 degraded, EPUB
6,284,622 bytes, validator passes, verify.sh ALL OFFLINE CHECKS PASSED
with both companion suites green from the unchanged dist. Iteration 60 then
applied the companion attack's ten P2s (the last open queue): stream-
normalizer — first-stop-wins dedup on repeated finish chunks, Anthropic
deltas keyed by block index with orphan deltas skipped, non-object tool
arguments rejected via an object guard at the accumulator (JSON-text
string args still parse leniently); scheduler/ledger — reservation fields
clamped at the door, the token bucket ignores a backwards clock, usage
clamps non-negative at the meter's edge with a noted event, read+write
turns log both events with costs that sum to the turn; golden-set — a
retired task is never reported fixed and a non-finite --floor fails the
invocation (exit 2). All ten attacks now HELD at the fixed tree (the
fourteen previously-held attacks still hold; C1's by-construction print
is the documented exception whose gate lives in smoke), key repros wired
into both suites, Appendix D/ch12/ch18/README updated to the shipped
behavior (six modules now 728 lines vs the 720 estimate sum, both
stated), strict tsc clean, suites green across repeated runs, and the
full validation chain green — the gate-6 queue is closed and the
release candidate re-seals with this pass. Remaining gate: final proof
(Kindle Previewer) — human, at upload time.

## 1. Gate ledger

| Gate | Status | Evidence |
|---|---|---|
| Gate 1 — Writer (self-review) | **PASS, all 18 chapters + prologue + appendices A–F + back matter** | Per-chapter Gate-1 logs in PROGRESS.md (structure checklist, numbers audit, fix lists). Structural lint green manuscript-wide: `python3 tools/lint-manuscript.py` → MANUSCRIPT OK, 18/18 chapters, 27 files |
| Gate 2 — Technical editor | **PASS, all 18 chapters + appendices A–F** | Full review set in `review/` (verdicts: 17 MINOR, 1 MAJOR); every chapter P0/P1/P2 finding applied via driver fix-passes, iterations 28–44 + ch01 post-review polish; citations re-verified against `research/` before each application. Appendix reviews A–F complete 2026-08-28 (all MINOR, P0 = 0, 14 P1 + 27 P2 total); every appendix finding applied via the appendix fix-pass, iterations 49–54, one appendix per iteration: A 2 P1 + 3 P2, B 1 P1 + 6 P2, C 3 P1 + 2 P2, D 3 P1 + 6 P2, E 4 P1 + 6 P2 (one P2 rejected as false positive with evidence: ch03:40 carries the quote), F 1 P1 + 3 P2 — sweep complete, Gate 2 closed. Post-seal, the architect's gate-6 adversarial wave (claims falsifiers + book-wide xref audit, 2026-08-28: 0 P0 / 5 P1 / 11 P2) was applied under the same discipline: all 5 P1s recomputed against digests/code and applied 2026-08-28 with ripple-greps (details in Appendix F.1); the P2
pass landed 2026-08-28 (iteration 59) under the same discipline — twelve
of the sixteen outstanding P2s applied with recompute-and-ripple, two
rejected as false positives with evidence, one already fixed by the
companion pass, one no-fix by judgment — and the wave is closed. The
gate-6 companion attack (0 P0 / 7 P1 / 11 P2) is fully settled too:
all 7 P1s applied 2026-08-28 (iteration 58) and all 10 surviving P2s
applied 2026-08-28 (iteration 60) with repros wired into the suites
and the attack file held as regression evidence. The gate-6
clean-checkout build attack (0 P0 / 0 P1 / 3 P2) — committed before the
seal but left out of iteration 60's queue accounting — is settled at
iteration 61: the cover render gained render-mermaid's mtime guard (a
stranger's first build no longer dirties the committed cover pair), the
README status table refreshed to the sealed state, and the Volume-I
temp-file prefix fixed; both guard paths verified live and the full
build/verify chain green — the gate-6 queue is now closed in full
(details in Appendix F.1's three gate-6 rows) |
| Gate 3 — Copyedit | **PASS (2026-08-27, this pass)** | Book-wide style/terminology scan + fixes; see §3 below. Structural conventions verified uniform: 18/18 `## Checkpoint`, `## Where the picture stops`, `## X.1 Words before machinery`; 92× `> **ELI5:**`; 20× `> **Field note.**` book-wide — prologue + every chapter, ch01 carrying two |
| Gate 4 — Visual/code proof | **PASS (machine-verified scope)** | 34/34 mermaid rendered, labels pixel-checked after the iteration-34 foreignObject fix; reflow: every reader-facing code line ≤66 cols, enforced at budget 0 inside `tools/build.sh` (`--check-mermaid` measures the 76 excluded mermaid-source lines). Human-eye typography/page-break sweep belongs to final proof |
| Gate 5 — Code test | **PASS** | `companion/tinyengine`: strict tsc 5.9.3 clean, zero npm deps; two offline suites green — the smoke suite replays the chapters' Break-it/Prove-it cases plus the gate-6 attack repros as regressions (P1 set from iteration 58, P2 set from iteration 60), and the cadence suite replays the tester role's three nightly gates (golden set, cache-hit gate, invoice reconciliation, duplicate-row, formula-agreement, retired-task and non-finite-floor regressions) over committed fixtures (`cd companion/tinyengine && npm test`); the three operator CLIs run the same gates over the fixtures via `npm run cadence`; the gate-6 companion attack fully applied (7 P1s + 10 P2s, 2026-08-28) with `tests/attack-gate6.ts` kept as regression evidence — 10/10 P2 attacks HELD at the fixed tree, all 14 previously-held attacks still hold, C1 reports by construction on any throw (documented; its gate lives in smoke's `assert.throws(UnknownModelError)`) |
| Gate 6 — Publisher (build) | **PASS, one command** | `tools/build.sh` → EPUB OK 6.0M, validate-epub.py passes, spine/nav carry all 27 files (prologue through back matter). Retail upload additionally requires the Kindle Previewer pass (Appendix F runbook) — **owed, and the only open release item** |

## 2. Numbers discipline

- Every number traces to one of **71 dated digests** in `research/` (all
  retrieved 2026-08-27; 72 files, one undated index) or carries a visible
  hedge ("derived", "illustrative", "community", "approximate").
- Pricing, rate limits, and benchmark results live in dated boxes or
  dated-caption tables, never bare in the durable-prose spine. Spot-swept
  book-wide during copyedit: all sampled non-boxed `$` lines carry dated
  attribution or are labeled derived/illustrative arithmetic.
- Known research-corpus divergences (logged in PROGRESS, digests never
  edited per the repo rule; manuscript follows the primary source):
  - `cache-hit-math-agent-loops.md` internal loop-example arithmetic sums
    to 61,600 against its own claimed ≈55,000 — ch14 recomputes (90,450
    exact under the dated multipliers) and labels it derived.
  - `rate-limit-quota-architectures.md` formula line omits the cache-write
    term its own AWS worked example deducts — ch15/companion follow the
    example; a QuotaLedger smoke test replays it.
  - Medusa-2 lower bound: digests diverge (2.2× vs 2.3×); manuscript
    matches the primary source (2.3×–3.6×, arXiv:2401.10774 v3 abstract).

## 3. Copyedit pass record (2026-08-27)

Scope: book-wide style/terminology scan over all 26 manuscript files,
focused human read of the two never-Gate-2-reviewed surfaces (prologue,
front matter), and normalization fixes:

1. **Closer format normalized** — ch15–18's bolded-paragraph closers
   converted to `### Build it` / `### Break it` / `### Prove it` /
   `### See it in the wild` H3 subsections, matching the ch01–14 majority
   (16 conversions; EPUB verified: 18 `<h3>` closers, 0 bold remnants).
2. **Token-rate unit unified to `tokens/s`** — was mixed 73/14/6 across
   `tokens/s` / `tok/s` (ch18) / `t/s` (ch02 conversion line, Appendix C
   spreads); meaning unchanged, no numeral touched.
3. **`fan-outs` → `fanouts`** (ch07, sole straggler vs 43 uses).
4. **Prologue Field note** converted to the series blockquote form
   (`> **Field note.**`), matching the 19 chapter Field notes.
5. **Front matter freshness**: "sixty-plus … digests" → "seventy-plus"
   (actual: 71 dated); `optimiser` → `optimizer` (sole British spelling;
   book is US: "behavioral", "analyses" as noun only).
6. Formula double-space (ch03 attention-cost display) removed.
7. Scans run clean, no action needed: repeated words (0), double spaces in
   prose (0 post-fix), trailing whitespace (0), smart quotes (0 — straight
   quotes throughout), unspaced em-dashes (0), "in order to" (0), British
   spellings (0 post-fix), `tinyengine` casing (25× lowercase, 0 variants),
   TTL phrasing (numeric "5-minute"/"1-hour" uniform), closers/vocab/
   checkpoint/ELI5/Field-note formats (uniform per §1 Gate 3 row).
   Fluff-word hits reviewed and retained as authorial voice (hedges like
   "essentially all of the model's weights"; the scanner over-triggers on
   book titles such as *Agents That Actually Work*).

## 4. Known residuals (honest list)

1. **Final proof owed**: Kindle Previewer pass on the retail EPUB
   (phone + e-reader profiles) — the only open release item; runbook in
   Appendix F.
2. **Word-count overages**, logged per chapter in PROGRESS rather than
   cut: ch02–ch05 and ch09–ch18 sit 0.4–11% over their STYLE bands, each
   judged content-bearing at draft/Gate-2 time (mechanism + both-sides
   framing would have been the casualty).
3. **76 mermaid-source lines exceed 66 columns by design** — the build
   replaces those fences with images; measurable on demand via
   `python3 tools/reflow-check.py --check-mermaid`.
4. **Field notes are qualitative operator anecdotes** where no
   digest-backed incident exists (ch05, ch15, ch16, ch17, ch18) — each
   mirrors documented mechanics, and says so.
5. **Companion line-count estimates** in ch12–17 Build-its ("roughly N
   lines") vs shipped counts differ −16% to +100% per module; Appendix D
   publishes the honest estimated-vs-shipped table (640 instrument lines
   shipped, plus the 339-line tester cadence beyond the instruments).
6. **Appendix E bibliography is curated, not exhaustive** (~60 of >570
   corpus URLs; the curation rule is published in E.1).

Closed at iteration 47 (were residuals 6 and 7): the tester-cadence scripts
now ship (`golden-set.ts`, `cache-hit-gate.ts`, `invoice-reconcile.ts` +
shared plumbing + fixtures + a second offline test suite), and `tools/verify.sh`
no longer references the Volume I companion — it runs this repo's two suites,
the budget-0 reflow gate, the build, and the validator end-to-end (exit 0 on
this host; external validators skip-announced, STRICT_EXTERNAL=1 escalates
a skip to an error, verified exit 1).

## 5. How to re-verify

```
python3 tools/lint-manuscript.py          # structural lint
python3 tools/reflow-check.py --budget 0  # reader-facing reflow gate
bash tools/verify.sh                      # lint + suites + build + validator
tools/build.sh                            # one-command EPUB (6.0M)
python3 tools/validate-epub.py            # structural validator
cd companion/tinyengine && npm test       # both offline suites (smoke + cadence)
cd companion/tinyengine && npm run cadence  # the three nightly gates over fixtures
ls research/*.md | wc -l                  # 72 files / 71 dated digests
```
