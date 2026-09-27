# Pip: the support agent that can't hurt you

**Agents don't fail because the model is dumb. They fail because nothing checks the action.** Pip is the proof of the fix: a fully autonomous customer support agent, a policy layer that inspects every tool call before it runs, and a judge (Jev) for the decisions code can't make.

## The problem

Give a support agent tools and a scorecard and it will do exactly what you incentivised: close fast, keep customers happy, never escalate. In our world that agent cancels orders that already shipped, reads out home addresses to whoever asks, refunds money to any account typed into a message, and follows instructions planted in ticket comments. Not because it is broken. Because nothing stood between the decision and the action.

That is every production agent today. The prompt is a suggestion, not a control.

## What we built

- **Kettle & Co**, a kitchenware store: 16 MCP tools (tickets, customers, orders, refunds, exchanges, address changes, org chart, human escalation), a world that does what it is told and records the harm, and **13 tasks ported from tau-bench's retail benchmark**: cancel-shipped, vague cancel, unverified disclosure, two-intent tickets, refund diversion, false promises, prompt injection, human escalation, and clean controls.
- **8 PreToolUse policies** in front of every tool call. Each returns allow, or deny with coaching the agent reads and adapts to. A denied call never executes, so it can never cost score. Those `⊘` lines in the run log are the saves.
- **9 session evaluations** in FailproofAI Cloud, one per failure mode, including false-claim: the agent telling the customer it did something a policy actually blocked.

## The lifecycle

![How a support ticket becomes a save](assets/lifecycle.png)

One ticket, end to end: a twice-charged customer demands a human. Raw Pip apologises and closes (harm flags: closed with a pending intent, closed when a human was requested). With the layer on, the close hits the escalation guard: Jev scores the frustration rubric at 3/3 and wants-human near 1.0, both over the 0.85 / 0.70 thresholds. Deny, with coaching: "escalate to billing first." Pip calls `escalate_to_human`, the routing check matches double-charge to billing, and the ticket lands with Rohan Mehta. The customer gets a person. The run log shows the save.

## Code decides what code can; Jev decides the rest

| Check | Decided by |
|---|---|
| Order status, refund destination, verified?, intents handled, one exchange per order, escalation required | Code (free, deterministic, zero latency) |
| Did the customer confirm *this* order? Is this instruction planted in the data? Is this reply leaking account details? Is this a promise policy never made? How angry is this customer? Right team? | Jev (typed noul/score verdicts, one fast call, thresholded) |

Two discipline rules carry the design: the injection guard only spends a Jev call when a ticket with comments was actually read, so clean tickets cost nothing. And every Jev call is wrapped so an outage degrades to the code rules instead of opening the gates. Thresholds (0.70 wants-human, 0.85 frustration handoff, 0.75 confidence floor) are not vibes: they were measured against real Jev on a support-agent prototype and tuned on the practice tasks.

## The evidence

- `node agents/support-agent/tests/run-tests.mjs`: **20/20 passing**. Every trap produces its harm flag raw; every clean control produces none; escalation routes to the right person; unknown teams are rejected.
- No policy mentions a ticket id, order id, or name. The checks run off records fetched in-session and off the conversation itself, so the sealed round's new tickets change nothing. Generality is the product, not a claim.
- Runs on the buildathon harness untouched: `setup`, `doctor`, `run support SA-01`, `pack`. Model pins kept, pinned agents untouched.

## The demo, three commands

```bash
node bin/buildathon.mjs run support SA-01    # layer off: Pip cancels a shipped order
# move .failproofai back in
node bin/buildathon.mjs run support SA-01    # layer on: ⊘ blocked, agent offers the return route
node bin/buildathon.mjs run support SA-10    # showcase: furious customer routed to a human in billing
```

## What is next

- A full tau-bench port: LLM-simulated customers, database state assertions, pass^k reliability over the same scenarios. "tau-bench retail, running under Jev policies" is a benchmark contribution, not just a demo.
- The same guard pattern ported to the other three domains: privilege checks for Lex, PHI disclosure for Care, payment-release approval for Ledger.
- Confidence routing: escalate the *decision*, not just the customer, when Jev's confidence falls below the floor.

Built on FailproofAI (policy enforcement, sessions, Cloud evals) and Jev (semantic verdicts). Scenarios from tau-bench retail.
