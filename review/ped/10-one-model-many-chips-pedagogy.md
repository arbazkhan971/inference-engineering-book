# Pedagogy audit — Chapter 10: One model, many chips

audited: 2026-08-28 · auditor: glm-5.3-flash (worker, beginner-simulation protocol)
Reader simulated: smart 25-year-old non-engineer who has followed the book so far but retained only the gist of chapters 2–9 (the realistic worst case). Method: walk every section in order; flag every point where this reader stumbles, every ELI5 that lands or misses, every term used before defined, every number without scaffolding, every analogy collision.

## Findings

1. **[CONFUSING] 10.1 table, TP row — jargon inside the plain-meaning column.**
   Quote: "Split each layer's weight matrices into slices, one slice per chip"
   "Matrices" is never lay-defined anywhere in the book's plain track; the *Simple meaning* column is where jargon must not live. The bookshelf picture is fine.
   Fix: "Split each layer's learned numbers (its weights) into slices" — keep "weight matrices" as a parenthetical after, not before.

2. **[CONFUSING] 10.1 table, Grouped GEMM row — double jargon in the ramp.**
   Quote: "One batched matrix multiply per expert over all its landed tokens"
   "Matrix multiply" plus "landed tokens" — both unexplained — in the vocabulary entrance ramp meant to make the chapter readable.
   Fix: "One combined math job per expert, covering every token sent to it" (picture column already carries it).

3. **[POLISH] 10.1 — the quintet's fifth member has no table row.**
   The after-table paragraph names "the TP/PP/DP/CP/EP (expert parallelism) quintet," and EP is load-bearing in 10.3/10.5 and the Megatron box — but the table has no EP row; the expansion happens only in passing prose.
   Fix: add "EP — expert parallelism | Spread the model's many experts across chips; each token travels to its experts | Specialists seated at different counters."

4. **[CONFUSING] Opening — "shard" used one paragraph before its definition.**
   Quote: "real engines shard across GPUs (graphics processing units) — the KV (key-value) cache too"
   The term is table-defined in 10.1, but it first appears in the intro; a cold reader hits it undefined.
   Fix: "real engines split — *shard* — across GPUs…"

5. **[CONFUSING] 10.2 — "dense" used before its 10.4 definition.**
   Quote: "a 70B dense model in BF16 (bfloat16, the 2-byte-per-number format)"
   The dense/sparse contrast is the chapter's spine but is only explained in 10.4 ("In a dense transformer, every token passes through every feed-forward block"). First use is two sections early.
   Fix: at first use add "(dense: every parameter touched by every token — the alternative arrives in 10.4)".

6. **[POLISH] 10.2 — trader slang in a derivation note.**
   Quote: "(derived arithmetic, same method and haircut caveats as chapter 3)"
   "Haircut caveats" will not parse for this reader.
   Fix: "the same efficiency discounts chapter 3 applied."

7. **[CONFUSING] 10.2 taxonomy bullet — "collectives" first used undefined, recurs in 10.3.**
   Quote: "DP is the only clean one — more replicas, more aggregate throughput, zero per-token collectives"
   "Collectives" (synchronized chip-to-chip data swaps) is a load-bearing word for the whole communication-cost story and is never glossed; 10.3 then says "the collectives ride the network."
   Fix: gloss at first use — "zero per-token *collectives* (synchronized data swaps between chips)."

8. **[CONFUSING] 10.2 — the product formula is a notation wall.**
   Quote: "A deployment is written as the product: TP=t × PP=p × EP=e × CP=c × DP=d, across t·p·e·c·d GPUs…"
   The idea (choices multiply) is simple; the subscript form arrives with no worked example. This is the sentence most likely to make the simulated reader put the book down.
   Fix: precede with one plain sentence: "You multiply your choices: 2-way TP × 4 pipeline stages × 2 copies = 16 chips" — then keep the formal line.

9. **[CONFUSING] 10.3 TP — four undefined operation names in the beginner flow.**
   Quote: "(an all-reduce in the plain formulation; an all-gather plus a reduce-scatter in the sequence-parallel variant)"
   Reader-level-3 content dropped into the level-1 lane with no skip signal.
   Fix: append "— names you can skip; the point is two synchronized swaps per layer" or move to a footnote-style aside.

10. **[CONFUSING] 10.3 TP — "projection weights" and "attention heads" assumed.**
    Quote: "(each GPU holds a subset of attention heads plus its slice of the projection weights)"
    "Heads" is borderline (chapter 4 used it); "projection weights" is not defined anywhere in the lay track. The parenthetical reads as required knowledge.
    Fix: "…each GPU keeps some of the model's attention units (chapter 4's 'heads') and its slice of that layer's numbers" — or cut the parenthetical; the surrounding prose carries the point.

11. **[CONFUSING] 10.3 CP — "rank" never defined.**
    Quote: "a query on rank 3 must attend to keys and values living on every other rank"
    HPC vocabulary ("rank" = one chip's slot in the group) appearing without a gloss in the plain-words section.
    Fix: replace with "chip"/"GPU", or define once: "rank (the HPC word for one chip's position in the group)".

12. **[POLISH] 10.3 — nested diagram intimidates before it teaches.**
    The DP>PP>TP/EP nested mermaid is correct and labeled, but a beginner meets four nesting levels with no reading instruction.
    Fix: one sentence before the block: "Read boxes inside boxes as chips inside groups inside copies — outermost is the duplicate, innermost is the slice."

13. **[CONFUSING] 10.4 — the headline 74 GB derivation is not shown.**
    Quote: "DeepSeek-V3 streams ~74 GB per token — *half* the traffic"
    The one-line arithmetic (37B active × 2 bytes ≈ 74 GB) is omitted, while the identical pattern three paragraphs later *is* shown ("671 × 2 bytes ≈ 1,342 GB"). Checkpoint Q2 asks the reader to work this exact floor — the chapter under-prepares its own exam question.
    Fix: "37B active × 2 bytes ≈ 74 GB per token (derived)".

14. **[POLISH] 10.4 — math jargon the ELI5 already replaced.**
    Quote: "The router — a linear projection plus a nonlinearity —"
    The referral desk already taught routing; this parenthetical serves reader 3 only.
    Fix: "The router — a tiny learned scorer —".

15. **[POLISH] 10.4 — "compose multiplicatively" asks for math vocabulary.**
    Quote: "Quantization shrinks the building; sparsity shortens the visit; they compose multiplicatively."
    Fix: "…the two savings multiply when stacked."

16. **[CONFUSING] 10.5 — "hidden state" first used unglossed.**
    Quote: "send each token's hidden state to the GPUs owning its chosen experts"
    Also used in 10.3's EP paragraph. Core to following the four-step forward pass, never defined in the plain track.
    Fix: "the token's working copy so far — its *hidden state* —".

17. **[CONFUSING] 10.5 — "residual connection" never defined, used load-bearingly.**
    Quote: "it skips that expert's computation and continues through the residual connection only"
    This sentence is the *payoff* of the silent-drop teaching — and its last clause is architecture jargon the lay reader has never met.
    Fix: "continues past that layer unchanged — the transformer's always-open side path (the *residual connection*)."

18. **[POLISH] 10.5 DeepEP — SM concept used before its later explanation.**
    Quote: "deliberately low streaming-multiprocessor occupation, so the exchanges leave room for math"
    Streaming multiprocessors are only unpacked in the later DeepSeek paragraph ("confines decode computation to 20 streaming multiprocessors").
    Fix: "…low use of the GPU's compute units (its 'streaming multiprocessors')…".

19. **[POLISH] 10.5 production paragraph — the chapter's densest stretch is unmarked as depth.**
    The "~3.2 experts reachable per node… ~13 active experts" material is honest and sourced, but sits in the main flow; the text itself says "Read that paragraph again."
    Fix: prefix "(depth layer — skim on first read)" or set as an aside box.

20. **[POLISH] Where the picture stops — "ontology" is a philosophy word.**
    Quote: "Sparsity is an economics fact, not an ontology."
    The sentence is quotable; one word is not lay.
    Fix: "…not a taxonomy of skills."

21. **[POLISH] 10.2 bullet list — "granularity."**
    Quote: "the finest, most expensive granularity"
    Fix: "the finest-grained — and most expensive — rhythm."

## Section grades (1–5; 5 = a beginner could teach it back)

| Section | Grade | One-line reason |
|---|---|---|
| Opening (pre-10.1) | 4 | Promise-discharge is strong; "shard" arrives one paragraph early |
| 10.1 Words before machinery | 4 | Best table in Part II; two jargon leaks in the plain column, missing EP row |
| 10.2 One chip stops being enough | 4 | Library ELI5 lands; formula wall + "collectives"/"dense" gaps |
| 10.3 Five axes | 3 | Steepest section: three undefined-term clusters despite the kitchen ELI5 |
| 10.4 MoE | 5 | Hospital ELI5 is the book's best; arithmetic nearly self-contained |
| 10.5 Serving MoE | 4 | Parcel/silent-drop teaching superb; hidden-state/residual/SM density cost it |
| 10.6 Harness controls | 5 | Cleanest actionable section in the chapter |
| Where the picture stops | 5 | Exact, quotable, kills the right analogies |
| Checkpoint | 4 | All six workable; Q2 under-prepared by finding 13 |
| Closers (Build/Break/Prove/See) | 5 | Concrete, verifiable, cheap-to-expensive ladder intact |

**Average: 4.3 / 5.**

## The three worst teaching gaps

1. **Undefined load-bearing terms in the lay track: "collectives," "hidden state," "residual connection," "rank"** (findings 7, 16, 17, 11). Each is used to carry a mechanism the beginner must retain; each needs only a one-clause gloss at first use. The residual-connection one is the worst because it sits in the sentence that explains the chapter's scariest idea (silent quality loss).
2. **10.3's depth parentheticals have no skip signal** (findings 9, 10). The section teaches five axes well at the analogy level, then interrupts the beginner lane with expert operation names twice in five paragraphs — the simulated reader's confidence dipped most in this section, not because the ideas were hard but because the prose briefly stopped being for them.
3. **The missing 74 GB derivation** (finding 13). The chapter's headline claim — "a 671B model can outrun a 70B one" — hinges on 37B × 2 bytes, the book shows the identical derivation pattern for 1,342 GB three paragraphs later, and Checkpoint Q2 examines it. One inline multiplication closes the loop.

## Verdict

No [LOST] findings: the ELI5 ladder (library → kitchen → hospital → parcels) is strong enough that the simulated reader never abandoned the chapter, and "Where the picture stops" pre-empts the two most dangerous misconceptions (chips ≠ speed for you; experts ≠ human specialists). The chapter teaches at a 4.3 with 12 recoverable stumbles, all fixable with one-clause glosses and one inline derivation — no restructuring needed.
