---
titulo: "Taking on AI tasks"
fase: 4
grupo: "Transition to AI"
ordem: 1
resumo: "At the company where you already work, propose and own LLM features. Internal experience can count as AI experience and is one possible path from developer to AI Engineer, with real users and stakes."
relacionados:
  - "projeto-em-producao"
  - "contar-a-historia"
  - "base-larga-foco-em-um"
referencias:
  - titulo: "Anthropic: Building effective agents"
    url: "https://www.anthropic.com/research/building-effective-agents"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Your AI product needs evals"
    url: "https://hamel.dev/blog/posts/evals/"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

Taking on AI tasks means proposing and owning, at the company where you already work as a developer, the features that use an LLM (large language model): document search, ticket classification, summaries, data extraction. Instead of waiting for an AI Engineer opening, you build the experience in your current job, with a real problem and real users.

## Why it matters

Junior AI Engineer openings are usually rare, and it is common for people to reach the role coming from software development or data. Internal experience can count as AI experience: you have a business problem, constraints, cost and a result to show. That usually weighs more than a personal project.

It depends on the company's context and the support of leadership. There is no guarantee the proposal will be accepted, but there is a way of proposing that increases the chance.

## Step by step

1. **Look for pains that resemble your projects.** Support teams answering the same questions, long documents nobody can find, forms typed by hand. Talk to the people who suffer from the problem.
2. **Measure the starting point.** How long does the task take today? How many errors happen? Without the before, you cannot prove the after.
3. **Propose a small pilot.** One page: the problem, the solution in two lines, how to measure, estimated cost and risk. Prefer the simplest thing that solves it, and start with a workflow (a fixed flow of steps) before thinking of an agent (a model that decides the steps) (see the Anthropic article).
4. **Handle data and security before anything else.** Define which data can go to the model, mask personal data and talk to whoever is responsible for security and data protection at the company.
5. **Build with evaluation.** Put together a set of real examples with expected answers and measure before releasing (evals are tests of answer quality; see the evals article in the references).
6. **Release to a few people**, collect feedback and measure again.
7. **Record the results** as résumé lines and interview stories, without exposing company data.

## Example

Proposal, before:

> Can we use AI in support?

After (illustrative numbers):

> **Problem:** the support team spends about 30 minutes per ticket looking for the answer in the knowledge base. **Proposal:** an assistant that suggests the answer with a link to the source article, reviewed by the agent before sending. **Measurement:** average time per ticket and rate of accepted suggestions, on 100 old tickets and then over two weeks of real use. **Estimated cost:** to be calculated with the monthly ticket volume. **Risks:** personal data in tickets, which will be masked before going to the model.

The second proposal gives the decision-maker a concrete question: approve a two-week pilot or not.

## Common mistakes

- **Proposing "AI" without a defined problem.**
- **Starting with a complex agent.** Prefer a simple, predictable flow.
- **Not measuring before and after.** Without numbers, the pilot becomes an opinion.
- **Sending sensitive data to the model without approval.** It can cause legal and trust problems.
- **Taking it on alone without telling leadership.** Align first, and ask for a sponsor on the team.
- **Promising what the model does not guarantee.** Say where it fails and who reviews.

## Checklist

- A real problem identified, with the affected people heard.
- Starting point measured.
- One-page proposal approved by the decision-maker.
- Personal data handled and security consulted.
- A set of examples for evaluation.
- A small pilot with recorded feedback.
- Result documented for résumé and interview.
