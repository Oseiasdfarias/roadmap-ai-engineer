---
titulo: "Hallucination"
nivel: 1
grupo: "LLM fundamentals (no math)"
ordem: 3
resumo: "The model generates the most likely text, not the verified one. Understand why it makes things up and how to reduce it with trusted context, citations, permission to say \"I don't know\", structured output and evals."
tempo: "1 week"
ferramentas:
  - "Python"
prerequisitos:
  - "evolucao-dos-modelos"
relacionados:
  - "rag"
  - "evals"
  - "saida-estruturada"
referencias:
  - titulo: "Reduce hallucinations"
    url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "A Survey on Hallucination in Large Language Models (Huang et al., 2023)"
    url: "https://arxiv.org/abs/2311.05232"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Citations: Claude API documentation"
    url: "https://platform.claude.com/docs/en/build-with-claude/citations"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

Hallucination is when the LLM (large language model) produces an answer that looks correct and confident, but is made up or wrong: a scientific paper that does not exist, a function the library does not have, a clause the contract does not contain.

## Why it matters for an AI Engineer

In a casual chat, a made-up answer is just an annoyance. In a real system, it becomes a problem: a technician follows a procedure that does not exist in the manual, or a customer receives false information in the company's name. Your job is not to eliminate hallucination, which is not possible today, but to reduce it, detect it and design the system so that the error costs little.

## How it works

The model was trained to generate the most likely text, not the verified one. It does not consult a database of facts: it continues the sentence in a plausible way. If the fact is not well represented in training, the plausible continuation is an invention delivered with the same confidence as a correct answer. An analogy: a student who, instead of leaving an exam question blank, writes an answer that sounds good.

Common types:

- **Invented fact:** names, dates, numbers, references.
- **Contradiction with the context:** you provide a document and the answer says something else.
- **Overconfidence:** no signal of doubt.
- **Fake citation:** a link or paper with a perfect format and nonexistent content.

Ways to reduce it, in the suggested order of application:

1. **Grounding** (anchoring the answer in sources): give the model the trusted text (for example, with RAG) and tell it to answer only based on it.
2. **Citations:** ask for the passage that supports each claim, so that you (or a program) can check it.
3. **Allow "I don't know":** without that way out, the model tends to answer anything.
4. **Structured output:** fixed fields and allowed values reduce the room for invention, and the code validates what came back.
5. **Evals:** they do not reduce hallucination by themselves, but they measure whether the other measures work: a set of questions with known answers measures the error rate before and after each change.

An example prompt that applies the first three:

```python
passage = "Error E-21: pressure sensor disconnected. Reconnect cable B7."
question = "What should I do for error E-30?"
prompt = f"""Answer using ONLY the text between <source> and </source>.
Quote the sentence you used. If the source does not answer, write exactly: I don't know.

<source>{passage}</source>
Question: {question}"""
print(prompt)
```

With the source only covering E-21, the desired behavior is "I don't know". Test precisely with questions the source does not cover.

## In practice

In P2: Technical Manuals RAG, every answer includes manual and page, and there are test questions with no answer in the base to check whether the system says "I don't know". In P4: Maintenance Work Order Triage, the classification comes out in fields with allowed values, and a set of orders already labeled by people measures the errors. In higher-risk applications, the answer goes through human review before acting.

## Common mistakes

- **Trusting the model's "confidence".** A confident tone does not prove the answer is correct.
- **Writing "do not make anything up" and thinking it is solved.** The instruction helps, but it does not replace a source and checking.
- **Never testing questions without an answer.** Testing only happy cases hides the problem.
- **Forgetting to check citations.** A citation needs to be verified against the source passage.
- **Using high temperature for factual tasks.** More randomness increases the chance of invention (see the API and parameters topic).

## How to study

1. Ask a chat for 10 references on a niche subject and check each one (2 hours).
2. Read the "Reduce hallucinations" page in the documentation (1 hour).
3. Read the introduction and taxonomy of the Huang et al. survey (2 hours).
4. Put together 15 questions, 5 with no answer in the source, and run the example prompt with an LLM (1 day).
5. Read the Citations documentation and see how it points to the passage behind each sentence (2 hours).

## How to show it

In your portfolio, show in the README the cases where the system got it wrong, what you changed and the error rate before and after, something like "from 6 made-up answers in 30 to 1 in 30" (illustrative numbers). In the interview, be able to explain why the model hallucinates and name at least three mitigations along with what each one costs.
