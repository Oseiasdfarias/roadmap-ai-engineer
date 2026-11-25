---
titulo: "P5: Multi-Agent Researcher"
codigo: "P5"
nivel: 5
resumo: "A system that investigates equipment failures with an orchestrator and parallel subagents, memory, durable execution, an open model you serve, trajectory evaluation and defenses against prompt injection."
camadas:
  - versao: "v1"
    nome: "Measured single agent"
    entrega: "One agent that investigates a failure in the manuals and old work orders, with 30 evaluation cases and cost per investigation."
  - versao: "v2"
    nome: "Orchestrator and subagents"
    entrega: "Plan, parallel subagents with their own context and a cited synthesis; comparison with v1 on accuracy, cost and time."
  - versao: "v3"
    nome: "Context and memory"
    entrega: "Token budget, research notes, compaction and memory of previous investigations with source and expiry."
  - versao: "v4"
    nome: "Durable execution and approval"
    entrega: "Checkpoints, resuming after a crash and opening a work order only with human approval and an idempotency key."
  - versao: "v5"
    nome: "Open model"
    entrega: "Classification subagent served with vLLM or llama.cpp, with a KV cache memory table, latency and cost against an API."
  - versao: "v6"
    nome: "Evaluation and security"
    entrega: "Trajectory evaluation with pass^3, 15 indirect prompt injection attacks and the defenses applied, with results before and after."
  - versao: "v7"
    nome: "Interoperability and traces"
    entrega: "The researcher exposed as an A2A agent and a single trace per investigation with OpenTelemetry, from the orchestrator to the subagents."
stack:
  - "Python"
  - "An agent framework or your own code"
  - "Postgres with pgvector"
  - "vLLM or llama.cpp"
  - "Temporal, DBOS or LangGraph checkpoints"
  - "OpenTelemetry and Langfuse"
  - "Docker"
criterios:
  - "The multi-agent version was compared with the single-agent one on the same evaluation, with cost and time"
  - "The evaluation measures trajectory and consistency (pass^3), not only the final answer"
  - "The system resumes an investigation after a crash without repeating actions with external effects"
  - "No work order is opened without a recorded human approval"
  - "The lethal trifecta was analyzed and broken; the test attacks are documented"
  - "The open-model subagent has its memory math and API comparison published"
referencias:
  - titulo: "How we built our multi-agent research system"
    url: "https://www.anthropic.com/engineering/multi-agent-research-system"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "τ-bench: A Benchmark for Tool-Agent-User Interaction (Yao et al., 2024)"
    url: "https://arxiv.org/abs/2406.12045"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "vLLM: documentation"
    url: "https://docs.vllm.ai/en/latest/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Agent2Agent (A2A) Protocol: documentation"
    url: "https://a2a-protocol.org/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## The problem

When a piece of production-line equipment fails, an engineer spends hours cross-checking manuals, old maintenance work orders and technical bulletins to find the probable causes. P4: Maintenance Work Order Triage classified orders; PF: Complete Agent put an agent in production. P5 solves a more open and longer task: investigating a failure end to end, searching several sources at the same time, and proposing a work order that is only opened after a person approves it.

This is the project where you apply, with numbers, everything level 5 covers: models inside, agentic architecture, evaluation and security.

## Architecture

An orchestrator receives the error code and the equipment, plans the investigation and launches subagents in parallel: one searches the manuals (with the code from P2: Technical Manuals RAG or P3: Manuals MCP Server), another searches old work orders, another searches public bulletins on the web. Each subagent has its own context and tools and returns only its findings with sources. The orchestrator synthesizes the probable causes, checks the memory of previous investigations and proposes a work order.

Execution is durable: every step is recorded, and the wait for human approval survives restarts. The web subagent has no access to internal data, which breaks the lethal trifecta. A simple classification subagent runs on an open model you serve. The whole flow produces a single trace, and bad traces become evaluation cases.

```mermaid
flowchart TB
  accTitle: Architecture of P5: Multi-Agent Researcher
  accDescr: The orchestrator plans and launches three subagents in parallel (manuals, old orders and an isolated web search), synthesizes the findings with memory and proposes a work order that is only opened with human approval. Everything runs with checkpoints and produces a single trace.
  IN([Error code + equipment]) --> O{{Orchestrator}}:::modelo
  O <-.-> MEM[(Investigation memory)]:::dado
  subgraph SUB["Parallel subagents · own context"]
    direction LR
    S1[Manuals · RAG/MCP]
    S2[Old orders]
    S3[Web bulletins · sandbox]:::externo
  end
  O --> SUB
  SUB -- findings with sources --> SIN[Synthesis of probable causes]
  SIN --> AP[Human approval]:::humano
  AP -- approved --> OS([Work order opened]):::destaque
  AP -- rejected --> FIM([Archived with reason])
  S3 -. no access to internal data .-x MEM
```

See the topics Multi-agent systems and orchestration, Advanced context engineering, Agent memory, Durable execution, Serving open models, Agent evaluation, Agent security and Agent observability.

## Layered versions

Each layer is a version tagged in Git, with that version's evaluation report. Start with the measured single agent: without that baseline, you cannot prove that the multi-agent version is worth the extra cost. The open-model layer can use a GPU rented for a few hours, with a cost alert turned on.

## Suggested stack

Python, an agent framework (or your own code, if you prefer to understand each part), Postgres with pgvector for search and memory, vLLM or llama.cpp for the open model, a durable execution engine (Temporal, DBOS or LangGraph checkpoints), OpenTelemetry with Langfuse for traces and Docker to isolate the web subagent.

## Acceptance criteria

- The multi-agent version was compared with the single-agent one on the same evaluation, with accuracy, cost and time.
- The evaluation measures trajectory and consistency (pass^3), not only the final answer.
- The system resumes an investigation after a crash without repeating actions with external effects.
- No work order is opened without a recorded human approval.
- The lethal trifecta was analyzed and broken, and the test attacks are documented.
- The open-model subagent has its memory math and API comparison published.

## What to put in the README

An architecture diagram with the orchestrator, the subagents, the sources and the approval points. The comparison table between single agent and multi-agent. The evaluation report with pass^3 and examples of good and bad trajectories. The threat table with the defenses and the results of the attacks. The KV cache memory math for the open model. A short video showing an investigation, a crash and the resume.

## How to present it in an interview

Tell the story in decisions: why you started with a single agent, what the numbers showed, why you split into subagents and how much it cost. Show a bad trajectory the evaluation caught and how you fixed it. Explain the security analysis in one sentence per tool. Be ready to answer when you would not use several agents and when you would not serve your own model.
