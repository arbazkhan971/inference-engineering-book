# Part I — Beneath the prompt: three workers, word-pieces, and the price of waiting

The first part of the book answers a question you've probably never asked: when I type to an AI and words come back, *what is doing the work?* The answer is "three different things," and knowing which one is struggling is the difference between fixing a problem and paying for the wrong repair. Then we meet the strange units the whole business is priced in, learn why answers can only ever arrive one step at a time, and discover the hidden notebook that makes long conversations expensive.

## 1. Three workers stand behind every answer

> **In one sentence:** Every reply you get is produced by three different workers — a brain that knows things, a kitchen that serves it to you, and a waiter that carries your order — and most "the AI got slow today" moments are actually kitchen moments.
>
> **The everyday picture:** A restaurant. The chef is brilliant — that's the brain. The kitchen around the chef — ovens, staff, the rail of order tickets — is everything the AI company built to serve thousands of people at once. The waiter is you and your way of asking: what gets written on the ticket, when it goes in, what happens when something comes back wrong. If the wrong dish arrives, that's the chef. If the right dish arrives cold and late because the kitchen is slammed, that's the kitchen. If the dish never arrives because the ticket blew off the rail, that's the waiter.
>
> **What really happens:** When you send a message, it travels to the AI company's building, gets checked against your allowances, waits in a queue, and is read all at once — and only then does the writing of an answer begin, one small piece at a time. The brain's only job is the knowing. Every single thing between your press of "send" and the first piece of the reply — the checking, the waiting, the reading — is kitchen work: machines the company built and runs. And here is the twist most people miss: a waiter can jam a kitchen (ask badly, ask too often), but a kitchen can never make a chef forget a recipe. Blame flows in one direction.
>
> **Why you care:** Before you complain, label the failure. Wrong or silly answer — brain. Right answer, but late, or interrupted — kitchen. Request never properly sent, or sent five times in a panic — waiter. Most wasted money in this business comes from switching brains when the kitchen was the problem.

## 2. Word-pieces: the private currency of every AI company

> **In one sentence:** AI companies do not count your words or letters — they count "word-pieces," their own invented chunks of text, and every company chops text differently.
>
> **The everyday picture:** Traveling abroad with only dollars in your pocket. The country you land in prices everything in its own money — the menu, the gas pump, the taxi meter — and every country has its own exchange rate. Your bill is always computed in *their* currency, never yours, and the rate silently changes when you cross a border.
>
> **What really happens:** Before the brain reads anything, a chopping machine splits your text into pieces from a fixed catalog the company trained ahead of time. Common words usually become one piece; rarer or longer words get cut into several; other languages and long strings of numbers often cost many more pieces than plain English. Everything you are ever billed for — the size of what you send, the size of the reply, your speed limits, your allowances — is measured in these pieces, in the company's own currency.
>
> **Why you care:** You are billed in pieces, not words. The identical sentence can cost meaningfully different amounts at different companies, and even at the same company when they upgrade their model — the chopping style changes and your bill changes with it, same words. If a tool tells you "this costs about seventy-five words," treat it like a picnic estimate, not a bill.

## 3. Why answers can only arrive one piece at a time

> **In one sentence:** Each new word-piece is chosen by looking at everything already written, so an AI's reply is a chain — no link can be made before the one before it exists.
>
> **The everyday picture:** The suggestion bar on your phone's keyboard. It offers the next word only after seeing everything you've typed so far — you cannot ask it for the fourth word without accepting the first three. An AI writing a reply is that suggestion machine with the "accept" key held down, running at machine speed.
>
> **What really happens:** Reading your question is fast, because everything you sent is already there and can be taken in all at once. Writing is different: the machine produces one piece, then uses it (plus everything before it) to choose the next, then the next — a strict relay race with one runner. So every reply's total time has a stubborn shape: a wait for the first piece, then a steady rhythm of one step per piece until the end. No amount of raw power lets the machine skip ahead, because the pieces don't exist yet to be skipped to.
>
> **Why you care:** The two halves of the wait have different owners and different fixes. Short replies live or die on the first piece arriving quickly. Long replies live or die on the rhythm between pieces. If an app feels snappy but "types" slowly, that is a rhythm problem; if it hangs before saying anything, that is a first-piece problem — and no typing-speed upgrade fixes a first-piece wait.

## 4. Two different reasons to wait: thinking-hard versus fetching

> **In one sentence:** Some computer work is slow because the thinking is enormous, and some is slow because the fetching never stops — and writing an AI reply is mostly a fetching problem.
>
> **The everyday picture:** A kitchen with twenty chefs, ten burners, and every gadget money can buy — and behind it, one narrow staircase down to the storeroom. An order needing two hundred onions prepped is limited by the chefs. A dinner service sending one egg at a time leaves nineteen chefs standing at the bottom of the stairs, waiting for the next egg. Buying more chefs fixes only the first kind of slow.
>
> **What really happens:** To produce each single word-piece, the machine must fetch essentially the entire brain — all its learned knowledge — through a doorway from memory into the place where thinking happens. The doorway's speed, not the thinking power, sets the pace of your reply. This is why the fancy chip inside is nearly idle while you watch words appear: it does a tiny bit of math on each piece of knowledge and then waits for the next batch to arrive. It is also why handing the kitchen ten fancy chips does not make *your one reply* faster — ten chips are ten kitchens, serving ten other people, while your single reply still walks one staircase.
>
> **Why you care:** When someone promises to make an AI "faster with more computing power," ask which slow they mean. The real speed tricks live in the kitchen's layout — grouping many people's orders onto one fetching trip, or shrinking what has to be fetched. More chefs do not widen a staircase.

## 5. The kitchen's running copy of your order

> **In one sentence:** For every conversation, the kitchen keeps a running set of notes about everything read and written so far — separate from the brain — and those notes grow with every piece.
>
> **The everyday picture:** A stenographer at an all-day meeting. She could re-read the whole transcript each time someone new speaks, but instead she keeps a short note about each person on her desk — "asked about the budget, wants numbers" — and glances at the notes, not the transcript. The notes are her working memory. The desk is what runs out of room.
>
> **What really happens:** As your conversation grows, the machine writes a small note for each word-piece — what that piece means for everything that comes later. Those notes are the reason each new piece can be written without redoing all the past work; without them, every next word would get slower the longer you talked. The notes live in the fastest, most expensive memory in the building, because they are consulted for every single piece generated.
>
> **Why you care:** For a long conversation, these notes can grow to be as large as the brain itself — and they are kept *per conversation*, so a busy kitchen is juggling one growing notebook per guest. When a company caps how much you can send, this notebook — not the brain — is usually the reason. And it sets up the last idea of this part.

## 6. Long conversations cost more: the seating chart

> **In one sentence:** A company's "this AI handles huge conversations" claim is a claim about building space, not brainpower — every long conversation occupies a big table, and only so many tables fit.
>
> **The everyday picture:** A venue with a sign that says "seats two hundred." The chef is one person — the same chef could cook in a forty-seat bistro. "Seats two hundred" was decided by floor space, fire code, and table count: the landlord's arithmetic, not the recipes. The sign sells the venue, but the building set the number.
>
> **What really happens:** Each conversation occupies a slice of the kitchen's precious memory, and that slice grows steadily as the chat gets longer. The same kitchen that comfortably hosts a dozen medium conversations might manage only a few very long ones — same kitchen, same brain, same rent. So companies treat big-conversation ability as a premium product: higher prices, special tiers, strict caps on how much you can send at once. It is a seating decision sold as a talent.
>
> **Why you care:** If you rely on very long chats, expect to pay for the space, and expect quality quirks too — brains genuinely struggle to use the middle of an enormous pile of notes evenly, so an AI may "forget" something said earlier not because the note is gone, but because the pile got hard to search. Trimming a conversation, or starting a fresh one, isn't just tidiness — it frees a real table in a real kitchen.

---

*That is the whole of Part I in plain words: three workers and which one to blame, a private currency called word-pieces, replies that can only be built one piece at a time, fetching-limited speed, and the growing notebook that makes long conversations a premium product. Part II walks into the kitchen itself — grouping orders, sharing notes, and the tricks that make serving thousands at once possible.*
