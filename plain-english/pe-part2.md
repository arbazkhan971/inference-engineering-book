# Part II — Inside the engine, in plain words

The AI's brain is only one part of what answers you. Around it is a kitchen: queues, notebooks, cooks, stoves, prices. Six ideas from inside that kitchen, each explained the Feynman way — one sentence, one everyday picture, what really happens, and why you should care.

## 1. You share the kitchen with strangers

> **In one sentence:** The company that runs the AI for you cooks many people's orders at the same time in one big kitchen, and how fast your food arrives depends on how busy everyone else's orders are, not just yours.

> **The everyday picture:** A city bus. It never finishes a trip, never waits for one passenger to run all their errands. At every stop, people who are done step off and waiting people step on. Your ride is smooth because nobody holds the bus hostage. An old-fashioned charter bus worked the opposite way: it waited until the slowest shopper on board finally came back from the mall — and everyone else sat there, hostage.

> **What really happens:** Early kitchens ran like the charter bus. They grouped strangers' orders into one big cooking run and finished the whole group together, so a person who asked for one sentence waited behind a person who asked for ten pages — wasted seats, wasted time. Modern kitchens replan the group after every single word-piece comes out: finished orders leave instantly, new orders join instantly. This is why the AI's rhythm can slow at busy times though nothing about your question changed — you are riding a bus with more stops.

> **Why you care:** When the AI suddenly feels slower in the evening, it is almost never your question or the brain — it is rush hour in the shared kitchen. Knowing this stops you from "fixing" the wrong thing, like rewriting a perfectly good question.

## 2. The kitchen's notebook: no wasted paper, shared appetizers

> **In one sentence:** While working on your order, the kitchen keeps a running notebook of everything you have said and done so far, and it got clever about that notebook — scraps anywhere, not perfect rows, and identical pages written only once.

> **The everyday picture:** Imagine a hotel that used to demand every guest book one unbroken row of rooms for their longest possible stay. A guest who might stay ten nights got ten rooms — and mostly left after two, leaving reserved-empty rooms no one could use. The hotel was half empty and still turning guests away. The new policy: any guest's nights can sit in any rooms, and the front desk keeps a ledger that says which room holds which night. Suddenly almost nothing is wasted.

> **What really happens:** The kitchen's notebook — its running copy of your order so far — used to be kept the wasteful way, and on real measurements only about a quarter to a third of it held anything useful. Two fixes changed everything. First, the notebook now lives in same-sized scraps anywhere in memory, tracked by a ledger, so gaps can always be reused. Second — the beautiful part — when one hundred of your AI helpers all start their orders with the same instruction page, the kitchen writes that shared page once and everyone points at it, like every table sharing one plate of appetizers instead of ordering one hundred identical plates.

> **Why you care:** Re-asking the AI with the same opening words — the same instructions, the same documents — can be nearly free and much faster the second time, because the kitchen recognizes its own notes. Change one word at the start, though, and the notes no longer match, so you pay full price again. Where you put your changes matters as much as what you change.

## 3. Reading the whole menu, then plating each dish

> **In one sentence:** Every order secretly contains two different jobs — one big fast read of everything you provided, and then a slow careful production of the answer one word-piece at a time — and they trip over each other when they share one counter.

> **The everyday picture:** A food truck with one counter. A caterer arrives needing four hundred tacos — wonderful business, the ovens packed, very efficient. But while that giant order monopolizes the counter, every walk-up customer stands there taco-less. The kitchen is doing its most efficient work at the exact moment it feels slowest to everyone else.

> **What really happens:** Reading your whole request — the long part with your instructions and documents — is the catering job: done in one powerful sweep. Producing the answer is the walk-up job: one small step at a time, each step quick but impossible to skip ahead on, because each word-piece depends on the one before it. Old kitchens made everyone share one counter, so whenever a huge reading job arrived, every answer already in progress would freeze mid-sentence. Modern kitchens slice the giant reading job into trays slipped between the regular tickets, so ongoing answers keep their rhythm and just start a little later.

> **Why you care:** That mysterious mid-answer pause — the AI writing smoothly, then hitching for a moment — is often someone else's giant document being read. And your own long requests do the same to others. Long pastes are not free, even when the answer ends up short.

## 4. Guess ahead, check in bulk

> **In one sentence:** The kitchen can let a junior cook pencil in several likely next word-pieces, then have the master cook check them all in one glance — and when the guesses are good, you get several word-pieces for the price of one.

> **The everyday picture:** A finished Sudoku puzzle takes most people an hour to solve but about a minute to check. Now imagine the puzzle champion charges by the minute, and an eager friend pencils in five guesses before the champion looks. One skim — barely more work than checking a single cell — keeps whatever is right and fixes whatever is wrong. Same champion, same fee, far more cells finished per hour.

> **What really happens:** Producing a word-piece normally takes one full pass of the whole brain — that is the toll you cannot dodge, because each piece depends on the last. The trick is that checking several proposed pieces costs almost the same as producing one, since the expensive part is fetching the brain's knowledge, not glancing at a few guesses once it's fetched. A cheap guesser proposes a few pieces ahead, the real brain reviews them all at once, keeps the good ones, rewrites at the first mistake — and, remarkably, the final text is built so it comes out exactly as if the real brain had written every piece itself. Not a cheap imitation; the same words, faster.

> **Why you care:** This is one of the few speed tricks that costs no quality at all — when it fits. It shines when the AI is rewording or continuing text that resembles what it was given, and it helps least when the answer must follow strict shapes, like exact formats, where the guesses keep getting thrown away. If you run your own kitchen, this flag alone can double the writing speed of a big brain on the same machine.

## 5. Writing smaller

> **In one sentence:** The brain's knowledge can be written down with fewer digits per number — like keeping recipes in shorthand instead of full paragraphs — which makes the kitchen faster simply because it has less to carry, at the small occasional cost of a misread.

> **The everyday picture:** A bakery's master recipe says "0.8473 cups of sugar." A new cook writes "about three quarters of a cup." For pancakes, nobody can tell. For a macaron — where chemistry punishes tiny errors — the batch sometimes fails. Same recipe, fewer decimal places, faster reading, occasional casualty.

> **What really happens:** Everything the brain knows is stored as numbers, and shipping those numbers from memory to where they are used is the real bottleneck for writing speed. Round every number to fewer digits — store the shorthand — and there is simply less to ship: half the digits is roughly twice the speed, quarter the digits roughly four times. The catch is that a few of the numbers matter far more than the rest, like salt and saffron in the recipe, so good rounding methods watch real traffic first to learn which numbers to protect. Careless rounding quietly damages the hardest tasks — long careful reasoning and tricky math — while simple tasks come out fine, which is why smaller, faster versions of the same brain exist side by side on a menu at very different prices.

> **Why you care:** When a company offers a "fast" or "mini" version of an AI you like, it is usually the same brain written in shorthand. For drafting, summarizing, and everyday questions, take the cheap fast one. For hard reasoning where a small error ruins everything, pay for the full-precision original — or test the small one on your own hardest examples first.

## 6. One giant order: many stoves, and the wedding problem

> **In one sentence:** When one order is too big for one kitchen — because the brain itself is too large, or because the conversation is too long — the work gets split across many kitchens, and long conversations cost far more than their length suggests.

> **The everyday picture:** A catering company wins a wedding. The recipe collection no longer fits in one kitchen, so it is split: every kitchen holds a slice of the recipes, every kitchen holds a slice of the guests, and runners carry half-finished dishes between kitchens so the wedding feels like it came from one stove. It works — but the runners stay busy, and the bigger the wedding, the more the running eats the gains.

> **What really happens:** Two different things outgrow one kitchen. First, the largest brains are physically bigger than one chip can hold, so their knowledge is spread across many chips that must constantly hand pieces to each other — split the recipes, split the guests, or open identical branches — and the biggest modern brains go further, keeping a crowd of specialists where each word-piece consults only the few specialists it needs, which is why a giant brain can sometimes answer faster than a smaller all-rounder. Second, a very long conversation is its own wedding: before the AI says one word, everything you provided must be cross-checked against everything else, and that cross-checking grows painfully fast — doubling the pile far more than doubles the checking.

> **Why you care:** Very long conversations are not priced like slightly longer short ones — companies charge extra for them, and some charge a jump-the-line fee the moment you cross a size boundary. The fix is housekeeping: keep unchanging instructions and documents at the front (so shared notes work, per idea two), and trim or summarize the middle rather than let everything pile up. A tidy long conversation is often several times cheaper than a messy one of the same usefulness.

---

## The part in one breath

The kitchen groups strangers to save fuel and replans the group every word-piece. It keeps its running notebook in reusable scraps and writes shared pages once. It splits the two jobs — reading your pile, then plating the answer — so neither freezes the other. It lets a junior cook guess and the master check in bulk. It writes recipes in shorthand to carry less. And when an order outgrows one kitchen — a giant brain or a wedding-length conversation — it spreads the work and charges accordingly. None of this is the brain — yet all of it decides how the brain feels to you.
