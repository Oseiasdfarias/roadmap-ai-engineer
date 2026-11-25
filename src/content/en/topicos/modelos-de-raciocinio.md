---
titulo: "Reasoning models"
nivel: 5
grupo: "How models work inside"
ordem: 4
resumo: "Models that generate internal reasoning before answering, trading more time and tokens for more accuracy on hard problems. When to use them, how to control the reasoning budget and how to measure the gain."
tempo: "1 to 2 weeks"
ferramentas:
  - "Python"
prerequisitos:
  - "transformer-por-dentro"
  - "evals"
relacionados:
  - "rl-com-recompensa-verificavel"
  - "custo-e-latencia"
referencias:
  - titulo: "Reasoning models: OpenAI guide"
    url: "https://platform.openai.com/docs/guides/reasoning"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Extended thinking: Claude API documentation"
    url: "https://platform.claude.com/docs/en/build-with-claude/extended-thinking"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning (2025)"
    url: "https://arxiv.org/abs/2501.12948"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Let's Verify Step by Step (Lightman et al., 2023)"
    url: "https://arxiv.org/abs/2305.20050"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

A reasoning model generates a sequence of thinking tokens before the final answer: it breaks down the problem, tests paths and corrects mistakes. This idea is called test-time compute: spending more computation when answering, instead of only making the model bigger. Providers expose it as an effort parameter or a reasoning token budget.

## Why it matters for an AI Engineer

Reasoning greatly improves tasks with a verifiable answer and several steps: math, code, planning, analysis of long documents with rules. But it costs: thinking tokens are billed, increase latency and often are not shown to you in full. On simple tasks, such as classifying or extracting a field, they barely help. Choosing where to turn reasoning on, and with how much budget, is a cost and quality decision you need to measure, not guess.

## How it works

These models are trained with reinforcement learning on problems whose answer can be checked, such as code tests or calculations with known results. The model learns that thinking more before answering increases the reward. The DeepSeek-R1 paper describes this process openly, including behaviors such as revisiting its own path.

Through the API, you control the effort. The right way to decide is an experiment: the same test set, several effort levels, and a table of accuracy, tokens and time.

```python
import time

def experiment(call_model, cases, efforts=("low", "medium", "high")):
    for effort in efforts:
        start, hits, tokens = time.time(), 0, 0
        for question, expected in cases:
            answer, used = call_model(question, effort)
            hits += expected in answer
            tokens += used
        print(effort, hits / len(cases), tokens, round(time.time() - start, 1))

fake = lambda q, e: ("42", {"low": 50, "medium": 200, "high": 800}[e])
experiment(fake, [("6 x 7?", "42")])
```

Replace the fake function with the real call to the API you use, passing the effort or thinking budget parameter.

## In practice

In an agentic system, reasoning usually pays off in planning (the orchestrator deciding how to split a task) and in the hard steps, while the mechanical steps use a fast model without reasoning. In P5: Multi-Agent Researcher, the orchestrator plans with reasoning and the search subagents run without it; the experiment's table justifies that choice.

## Common mistakes

- **Turning on high reasoning everywhere.** Cost and latency go up with no gain on simple tasks.
- **Asking "think step by step" to a model that already reasons.** It can get in the way; follow the provider's guide.
- **Trusting the reasoning text as a faithful explanation.** It helps with debugging, but it is not proof of how the model decided.
- **Forgetting thinking tokens in the budget.** They count toward cost and the output limit.

## How to study

1. Read OpenAI's reasoning guide and Claude's extended thinking guide (2 hours).
2. Put together 30 cases with verifiable answers from your domain (1 day).
3. Run the experiment with three effort levels and build the table (2 days).
4. Read the introduction and results of the DeepSeek-R1 paper (1 day).
5. Read Let's Verify Step by Step to understand step-level evaluation, which comes back in agent evaluation (1 day).

## How to show it

Show the table of accuracy, cost and latency per effort level and the rule you drew from it ("reasoning only for planning"). In the interview, explain what test-time compute is and why it does not replace good context.
