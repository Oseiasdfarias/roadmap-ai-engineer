---
titulo: "Cost and latency"
nivel: 2
grupo: "Quality and protection"
ordem: 5
resumo: "Choose the model per step, use prompt caching, streaming and batch, and measure cost per request and p95 latency. Optimizing without measuring before and after with the same evals is guesswork."
tempo: "1 week"
ferramentas:
  - "Python"
  - "Prompt caching"
  - "Batch API"
prerequisitos:
  - "tokens-e-janela-de-contexto"
relacionados:
  - "engenharia-de-contexto"
  - "observabilidade"
  - "evals"
referencias:
  - titulo: "Prompt caching: Claude API documentation"
    url: "https://platform.claude.com/docs/en/build-with-claude/prompt-caching"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Batch processing: Claude API documentation"
    url: "https://platform.claude.com/docs/en/build-with-claude/batch-processing"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Reducing latency: Claude API documentation"
    url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

Cost is how much each call to the LLM (language model) costs, usually charged per input and output token (the unit of text). Latency is the time until the answer arrives. Both grow with the context size, the model size and the number of calls, and they need to be measured, not assumed.

## Why it matters for an AI Engineer

A cheap prototype with few users can become unaffordable in production, and a 15-second answer kills usage. Architecture choices, such as a workflow instead of an agent or a smaller model for classification, change cost by orders of magnitude. Prices and limits vary by provider and change over time, so always check the current official price table.

## How it works

**Measure first.** For each request, record input and output tokens (the API response reports them), calculated cost, total time and time to first token. On average, latency is misleading: use percentiles. p95 is the time below which 95% of requests fall, and it shows the experience of the slow cases.

```python
import statistics

def cost(tok_in, tok_out, price_in=3.0, price_out=15.0):   # illustrative prices, US$ per 1 million tokens
    return (tok_in * price_in + tok_out * price_out) / 1_000_000

lat = [0.8, 1.1, 0.9, 4.2, 1.0, 1.2, 0.9, 1.1, 1.0, 0.8,
       1.3, 1.0, 0.9, 1.1, 1.2, 1.0, 0.9, 1.0, 1.1, 5.0]   # seconds, illustrative data
print(round(cost(2000, 500), 4))                           # 0.0135 (US$, with the example prices)
print(statistics.median(lat), statistics.quantiles(lat, n=20)[18])   # median 1.0, p95 4.96
```

With few samples, p95 ends up close to the largest value; in a real system use hundreds of requests. Notice how the median (1.0 s) hides the 4 to 5 second calls.

**The levers:**

- **Model per step.** Smaller models classify and extract; the larger one is kept for hard reasoning.
- **Prompt caching.** Providers let you reuse a repeated prompt prefix (instructions, fixed documents), charging less for that part and reducing time. It requires the repeated part to come first and has rules on minimum size and expiry; read the documentation.
- **Streaming.** Sends the answer bit by bit. It does not reduce total time, but the user sees text early, which improves the perceived wait.
- **Batch.** Asynchronous batch processing for work that does not need an immediate answer; it usually costs less, with the answer arriving later.
- **Fewer tokens.** Lean context (see context engineering), short output with `max_tokens` and fewer sequential calls.

**Optimizing without measuring is guesswork.** Before switching the model or cutting the context, run the golden set (see evals): if cost dropped and quality held, the change is worth it; if quality dropped, you know how much you paid.

## In practice

In P4: Maintenance Work Order Triage, you compare a small and a large model by cost and quality on the same orders and show the before and after in the README. In PF: Complete Agent, cost per request and p95 appear on the observability dashboard, and the cost alert warns you if something goes off track. In P1: Automaker Assistant, streaming is what makes the conversation feel fast.

## Common mistakes

- **Looking only at the average.** It hides the slow tail.
- **Optimizing without evals.** A smaller model can save money and make the answer worse without you noticing.
- **Forgetting the output.** Output tokens usually cost more and take longer than input tokens.
- **Badly placed prompt caching.** A variable piece of data at the start of the prompt prevents reuse.
- **Copying prices from an article.** They change; read the provider's page.

## How to study

1. Read the caching, batch and latency pages of the documentation (2 hours).
2. Record tokens, cost and time for 50 calls in your project (1 day).
3. Calculate the median and p95 and compare (half a day).
4. Test caching with a long system prompt and see the effect on the reported tokens (1 day).
5. Compare two models on the same golden set by cost and quality (1 day).

## How to show it

In the README, include a table of cost per request, median and p95, before and after each optimization, with quality measured on the same evals. In the interview, explain why you use p95 instead of the average and one optimization you dropped because it made quality worse.
