---
titulo: "Coding agents"
nivel: 3
grupo: "Building with AI"
ordem: 1
resumo: "Claude Code and Codex: how they use context, tools and permissions, and the plan, implement and review workflow. You are the reviewer; that is why the level 1 base comes first and vibe coding packs stay out."
tempo: "1 to 2 weeks, then ongoing use"
ferramentas:
  - "Claude Code"
  - "Codex"
  - "Git"
prerequisitos:
  - "python-fundamentos"
  - "git-e-github"
relacionados:
  - "fastapi"
  - "frontend-com-ia"
referencias:
  - titulo: "Anthropic Academy"
    url: "https://anthropic.skilljar.com/"
    tipo: "Curso"
    idioma: "en"
    gratuito: true
  - titulo: "OpenAI Academy: Codex"
    url: "https://academy.openai.com/pages/codex-9t6874"
    tipo: "Curso"
    idioma: "en"
    gratuito: true
  - titulo: "Claude Code: overview"
    url: "https://code.claude.com/docs/en/overview"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Codex: documentation"
    url: "https://developers.openai.com/codex"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

A coding agent is an LLM (large language model) that works inside your project: it reads files, edits code, runs commands and tests in a loop, until it completes the task you asked for. Claude Code and Codex are two examples. They run in the terminal, in the editor or in the cloud, and the idea is the same in both.

## Why it matters for an AI Engineer

Using these agents well is already a requirement, not a differentiator: they speed up portfolio projects and teamwork. There is a limit, though. The agent makes mistakes with confidence, and you are the one responsible for the code that goes into the repository. People who understand what is underneath (context, tools, permissions) steer it better and make fewer mistakes.

## How it works

The agent is the same tool use loop (the model asks for a tool, the program runs it and returns the result), with tools aimed at code. Three pieces explain its behavior:

- **Context.** The agent only sees what is in the context window: your instruction, the files it read and the output of commands. That is why projects have an instructions file (`CLAUDE.md` in Claude Code, `AGENTS.md` in Codex) with how to run tests, conventions and what not to touch. A very long conversation degrades the result; start a new session per task.
- **Tools.** Reading and editing files, running terminal commands, searching the code. MCP servers (Model Context Protocol, the standard for connecting external tools) add others.
- **Permissions.** Before editing or running a command, the agent asks for your approval, and you define what it can do without asking. Start restrictive. Allow everything, including destructive commands, only in an isolated environment.

The workflow that works is plan, implement and review:

1. **Plan.** Ask for a plan before any edit and correct the course in text, which is cheap.
2. **Implement.** Small steps, one commit per step, with tests running at each one.
3. **Review.** Read the whole diff (the set of changed lines), run the tests and only then commit.

## In practice

Split the work like this. In the backend and AI parts of P1: Automaker Assistant, P2: Technical Manuals RAG and P4: Work Order Triage, you drive and understand every line. In the frontend, use the agent from the start to build the interface, but learn the basics to review it (see the frontend topic). This is where the level 1 Python base pays off: without it, you do not notice the mistake the agent made.

There are prompt packs and context managers, common in "vibe coding" repositories (programming by accepting whatever AI delivers, without reading it), that promise to abstract everything away. Avoid them: they hide what you need to learn and tend to break with every tool update. At most, allow a small, well-maintained add-on, used alongside the official features (instructions file, commands, skills, MCP).

## Common mistakes

- **Accepting without reading.** Code that runs is not correct code. Review the diff as you would review a colleague's.
- **Asking for everything at once.** Huge tasks produce changes too big to review. Split them.
- **Allowing all permissions** on your work machine. A destructive command deletes real files.
- **Pasting secrets** (API keys) into the chat or letting the agent read `.env`. Keep them out of reach.
- **Not testing.** Without tests, you do not know whether the agent broke something that already worked.

## How to study

1. Pick one tool and take its official course: Anthropic Academy for Claude Code, OpenAI Academy for Codex (1 to 2 days).
2. Read the documentation on context, the instructions file and permissions (half a day).
3. Create the instructions file for a small project (1 hour).
4. Build a small feature in the plan, implement and review workflow, with one commit per step (1 day).
5. Repeat it in a project of yours and note what the agent got wrong and how you noticed (1 week of use).

## How to show it

In your portfolio, keep the project's instructions file in the repository, with small, readable commits. In the interview, explain how the agent manages context and permissions, and tell about a case where you reviewed and rejected a suggestion, with the reason. That shows you drive the agent, not the other way around.
