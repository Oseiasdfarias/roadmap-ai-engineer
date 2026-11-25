---
titulo: "Prompt engineering"
nivel: 1
grupo: "LLM fundamentals (no math)"
ordem: 8
resumo: "The prompt is the task specification: role, context, instructions, examples and output format. Learn to structure it with tags, use few-shot examples and iterate by measuring, instead of trial and error."
tempo: "2 weeks"
ferramentas:
  - "Python"
  - "Provider SDK"
prerequisitos:
  - "api-e-parametros"
relacionados:
  - "api-e-parametros"
  - "evals"
  - "fine-tuning"
referencias:
  - titulo: "Prompt engineering guide"
    url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Anthropic Courses"
    url: "https://github.com/anthropics/courses"
    tipo: "Repositório"
    idioma: "en"
    gratuito: true
  - titulo: "Interactive prompt engineering tutorial"
    url: "https://github.com/anthropics/prompt-eng-interactive-tutorial"
    tipo: "Repositório"
    idioma: "en"
    gratuito: true
  - titulo: "Prompt Engineering Guide"
    url: "https://www.promptingguide.ai/"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

Prompt engineering is writing the instructions you send to the LLM (large language model) so that it carries out the task consistently. The prompt (the text sent to the model) works as a specification: the clearer what you want, the less the model has to guess.

## Why it matters for an AI Engineer

The prompt is the part of the system that changes the result the most and the cheapest to change. A good part of an AI Engineer's work is turning a user's vague request into a precise, testable instruction. Before thinking about RAG or fine-tuning, a well-structured prompt solves a lot.

## How it works

A good prompt has parts. Think about how you would explain the task to a smart new colleague who has no context:

1. **Role:** who the model is in this task ("you are a senior maintenance technician").
2. **Context:** what it needs to know: documents, data, audience.
3. **Instructions:** what to do, in clear steps, and what not to do.
4. **Examples:** cases of input and desired output. Showing is worth more than describing. With a few examples, the technique is called few-shot; with none, zero-shot.
5. **Output format:** how the answer should come (a list, JSON, one word).

**Tags** (markers such as `<document>...</document>`) separate the parts and keep the model from mixing data with instructions. For reasoning tasks, asking it to think step by step before answering usually improves the result; reasoning models already do that on their own.

```python
notice = "Error E-21: pressure sensor disconnected."
examples = """<example>
Input: Error E-05: low battery.
Output: {"cause": "low battery", "urgency": "low"}
</example>"""
prompt = f"""You are a senior maintenance technician.
Extract the cause and the urgency (low, medium or high) from the notice.
Answer only with JSON, as in the examples.

{examples}

<notice>{notice}</notice>"""
print(prompt)
```

The prompt has a role, instructions, an example, tags and a format. Replace the `print` with the API call to test it.

The most important point is **iterating by measuring**. Changing a word and looking at one answer is misleading: the model varies from one call to another. Put together 20 to 30 inputs with the expected answer, run the prompt on all of them, record the accuracy and only then compare versions. Change one thing at a time and keep each version in Git.

## In practice

In P1: Automaker Assistant, the system prompt defines the role, the tone and what to do when information is missing. In P4: Maintenance Work Order Triage, examples (few-shot) and the JSON format make the classification stable, and the test set tells you whether a new prompt version improved or got worse. Providers publish best-practice guides for their models; the tips change with each generation, so read the current guide.

## Common mistakes

- **A vague prompt.** "Summarize" produces different summaries every time. State the length, audience and format.
- **Changing everything at once.** Without isolating the change, you do not know what helped.
- **Judging by the first answer.** Test on dozens of cases, including hard ones.
- **Mixing data and instructions.** User text inside the prompt without separation can be taken as an order; use tags.
- **All examples alike.** The model copies the pattern; vary the cases and include a hard one.
- **A giant prompt out of fear.** Too many contradictory instructions make the result worse; reread and cut.

## How to study

1. Do the interactive prompt engineering tutorial (2 to 3 days).
2. Read the official guide of the provider you use (3 hours).
3. Pick a task (extracting data from notices) and write 25 cases with the expected answer (1 day).
4. Test three versions of the prompt and record the accuracy of each (2 days).
5. Explore the courses in the Anthropic Courses repository, and the Prompt Engineering Guide for techniques such as step-by-step reasoning (1 week, in parallel).

## How to show it

In your portfolio, publish the folder of versioned prompts and a table with each version's accuracy on the same test set, something like "v1: 18 of 25; v3: 23 of 25" (illustrative numbers). In the interview, tell about one prompt change you tested with a number and one that did not work.
