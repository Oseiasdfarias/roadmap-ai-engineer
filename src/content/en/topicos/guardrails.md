---
titulo: "Guardrails"
nivel: 2
grupo: "Quality and protection"
ordem: 2
resumo: "Checks before and after the model: scope and policy on input, format and content on output. See what existing tools cover and why guardrails reduce risk without eliminating it, and how to test them."
tempo: "1 to 2 weeks"
ferramentas:
  - "Python"
  - "Pydantic"
  - "NeMo Guardrails"
prerequisitos:
  - "saida-estruturada"
relacionados:
  - "prompt-injection"
  - "human-in-the-loop"
  - "evals"
referencias:
  - titulo: "NVIDIA NeMo Guardrails"
    url: "https://github.com/NVIDIA/NeMo-Guardrails"
    tipo: "Repositório"
    idioma: "en"
    gratuito: true
  - titulo: "Llama Guard: LLM-based Input-Output Safeguard for Human-AI Conversations (Inan et al., 2023)"
    url: "https://arxiv.org/abs/2312.06674"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Mitigate jailbreaks and prompt injections: Claude API documentation"
    url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

Guardrails are checks you put before and after the call to the model to keep the system within what it should do. On input, they check scope and policy. On output, they check format, content and whether the answer can move forward.

## Why it matters for an AI Engineer

A well-written prompt does not guarantee behavior: the model can go off topic, leak data, answer in a broken format or say something the company cannot say. Guardrails turn rules into code you test and measure, instead of asking the model "please, don't do that".

## How it works

Think of two layers around the model:

- **Input:** is the question within the assistant's scope? Does it contain personal data that should be masked? Is there an attempt to manipulate the instructions? Are size and format within the limit?
- **Output:** is the JSON valid and does it have the required fields? Does the answer cite the source? Does it contain something forbidden (personal data, advice outside the policy)? If it fails, you block it, ask for a retry or send it to a human.

Methods range from simple to sophisticated: rules and regular expressions, schema validation (with Pydantic, as in structured output), a classifier (such as Llama Guard, a model trained to classify inputs and outputs as safe or not) and an extra call to an LLM as a checker.

```python
import json

def guard_input(text, topics=("compressor", "order", "part", "error")):  # illustrative scope
    return len(text) <= 2000 and any(t in text.lower() for t in topics)

def guard_output(text):
    try:
        data = json.loads(text)
    except ValueError:
        return False
    return isinstance(data, dict) and {"answer", "source"} <= data.keys()
```

The keyword scope check is crude: it serves to understand the design, not for production, where a classifier or an LLM checker does better. Existing tools cover parts of the problem: NeMo Guardrails (from NVIDIA) defines programmable conversation rules, and the Claude API documentation describes mitigation techniques. Evaluate each tool in your case, measuring what it lets through and what it blocks unnecessarily.

**The limit.** Guardrails reduce risk and do not eliminate it. A model-based checker also makes mistakes, and attackers test variations until something gets through. Against prompt injection, the main defense is limiting what the system can do, not just filtering text. Each check adds latency and, if it uses an LLM, cost.

## In practice

In P1: Automaker Assistant, the guardrails layer blocks questions outside the automaker's scope and validates the answer's format before delivering it. Also place checks around the tools: before running one, check the arguments; afterwards, check the result. For risky actions, add human-in-the-loop.

## Common mistakes

- **Thinking the guardrail solves the problem.** It is one layer, not the whole defense.
- **Blocking too much.** False positives annoy the user; measure them on the golden set.
- **Not testing the guardrail.** Build attack cases and legitimate-use cases and run them on every change (see evals).
- **Checking only the input.** The model can produce something inappropriate from a legitimate input.
- **Fragile rules.** A list of forbidden words is easy to get around.

## How to study

1. Read the jailbreak mitigation page of the Claude documentation (1 hour).
2. Implement the two functions above for your assistant (half a day).
3. Create 20 out-of-scope inputs and 20 legitimate ones and measure both kinds of errors (1 day).
4. Try NeMo Guardrails on a small example (2 days).
5. Read the Llama Guard abstract and compare it with your rule (2 hours).

## How to show it

In the README, describe the input and output layers, the test cases and what each guardrail catches and lets through, with numbers. In the interview, explain why guardrails are not enough and what you would add beyond them.
