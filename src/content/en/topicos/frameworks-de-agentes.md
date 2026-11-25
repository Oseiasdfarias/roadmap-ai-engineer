---
titulo: "Agent frameworks"
nivel: 3
grupo: "Tools"
ordem: 3
resumo: "LangGraph and similar tools hide the agent loop, state and orchestration. See what they abstract, when they are worth it and why to learn them after building an agent by hand and understanding what is hidden."
tempo: "1 to 2 weeks"
ferramentas:
  - "LangGraph"
  - "Python"
prerequisitos:
  - "workflow-ou-agente"
  - "tool-use"
relacionados:
  - "workflow-ou-agente"
  - "human-in-the-loop"
referencias:
  - titulo: "LangGraph"
    url: "https://langchain-ai.github.io/langgraph/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Building effective agents"
    url: "https://www.anthropic.com/research/building-effective-agents"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

An agent framework is a library that comes with an agent's structure ready: the loop in which the model calls tools, the state that passes from one step to the next and the orchestration (the order and conditions between steps). LangGraph is one example; there are others, such as the agent SDKs from the providers themselves.

## Why it matters for an AI Engineer

Job openings and teams use these frameworks, so you will run into them. But the framework hides exactly what you need to master. When something goes wrong (an endless loop, a tool called with the wrong argument, high cost), someone who only knows the abstraction does not know where to look. Someone who has written the loop by hand reads the framework easily and makes a better call on whether to use it.

## How it works

Remember the tool use loop: the model asks for a tool, your code runs it, the result comes back, and the cycle repeats until the final answer. Frameworks organize this into parts:

- **State.** The data the agent carries: messages, tool results, counters.
- **Steps (nodes).** Functions that read the state and update it: call the model, run the tool.
- **Transitions (edges).** Rules about which step comes next. Some are fixed, others depend on the state ("if the model asked for a tool, go to the tool; otherwise, finish").
- **Persistence.** Saving the state at each step lets you pause, resume and, with human approval, wait for a decision (see human-in-the-loop).

A simple agent, as a graph (a diagram of steps connected by arrows):

```text
start -> model --asked for a tool--> tool -> model
               --answer ready-----> end
```

What you gain: less repeated code, state and persistence out of the box, flow visualization and integration with observability tools. What you pay: one more dependency, abstractions that change between versions and difficulty debugging what you do not understand. These frameworks' APIs change often, so follow the documentation of the version you install, instead of copying old examples.

When it is worth it: flows with several steps and branches, the need to pause and resume, or a team that has already adopted the framework. When it is not: a loop with one tool, or a fixed workflow that an `if` solves. "Building effective agents" recommends starting with the simplest option and adding abstraction only when it is justified.

## In practice

In P4: Work Order Triage, a fixed workflow is enough and a framework would be overkill. In P1: Automaker Assistant, write the tool use loop yourself. In PF: Complete Agent, with tools via MCP, human approval and state that needs to be resumed, consider rewriting the agent in a framework and comparing it with the hand-written version. Measuring both, in lines of code and ease of debugging, makes good interview material.

## Common mistakes

- **Starting with the framework.** You learn its API, not the concept.
- **Using a framework for a trivial case.** More code and more failure points, with no benefit.
- **Copying old tutorials.** The API changes; check the version.
- **Not limiting the loop's turns.** The framework does not remove the risk of infinite cost; configure the limit.
- **Ignoring what it sends to the model.** Inspect the real prompts and execution traces.

## How to study

1. Make sure you have written an agent with a tool use loop by hand (prerequisite).
2. Read the part on frameworks in "Building effective agents" (2 hours).
3. Follow the basic LangGraph tutorial (1 to 2 days).
4. Rewrite the agent from step 1 in the framework and compare lines of code and clarity (2 to 3 days).
5. Write down what the framework solved and what it hid (half a day).

## How to show it

In your portfolio, publish both versions of the same agent, one by hand and one in the framework, with a comparison table. In the interview, show that you understand what the framework abstracts and explain why you chose to use it, or not, in that project.
