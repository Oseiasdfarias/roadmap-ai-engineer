---
titulo: "Skills and dynamic tools"
nivel: 5
grupo: "Agents in action"
ordem: 2
resumo: "How to give an agent dozens of capabilities without crowding the context: skills loaded on demand, tool search, well-written descriptions and agents that write and run code instead of calling each tool."
tempo: "1 week"
ferramentas:
  - "Python"
  - "MCP"
prerequisitos:
  - "mcp"
  - "engenharia-de-contexto-avancada"
relacionados:
  - "agentes-de-programacao"
  - "seguranca-de-agentes"
referencias:
  - titulo: "Equipping agents for the real world with Agent Skills"
    url: "https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Agent Skills: Claude API documentation"
    url: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Writing effective tools for agents"
    url: "https://www.anthropic.com/engineering/writing-tools-for-agents"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Model Context Protocol"
    url: "https://modelcontextprotocol.io/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

Every tool an agent knows takes up context: name, description and parameters go into every call. With five tools, that is fine. With a hundred, the agent spends thousands of tokens just to know what it can do and starts choosing wrong. Dynamic tools solve this by loading capabilities on demand. A popular form is skills: folders with instructions, scripts and supporting files, of which the agent sees only the name and a short description, and reads the rest only when the task calls for it.

## Why it matters for an AI Engineer

Useful agents in companies accumulate capabilities: querying systems, producing reports in the house format, following internal procedures. Knowing how to organize this without degrading tool selection is what lets the agent grow safely. It also changes how you think about tools: sometimes, instead of ten small tools, it is better to give the agent an environment to run code and a well-documented library.

## How it works

Three techniques, which combine:

- **Progressive disclosure (skills):** the agent sees a short index. When a task matches a skill, it reads the full instructions and, if needed, runs the scripts that come with it.
- **Tool search:** instead of listing them all, the agent has a tool that searches for others by description and loads only the relevant ones.
- **Code as a tool:** the agent writes and runs code in an isolated environment, calling libraries or MCP servers as functions. This reduces round trips and keeps large results out of the context.

```python
SKILLS = {
    "failure-report": "Produces the failure report in the engineering template (sections, causes table).",
    "parts-lookup": "Looks up part stock and lead time by manufacturer code.",
    "safety-check": "Applies the safety checklist before releasing equipment.",
}

def index():
    """Only this goes into the context on every call: one line per skill."""
    return "\n".join(f"- {name}: {desc}" for name, desc in SKILLS.items())

def load(name):
    """Read only when the agent decides to use the skill."""
    return open(f"skills/{name}/SKILL.md", encoding="utf-8").read()

print(index())
```

The quality of the description decides everything: it needs to say when to use the skill, not just what it does. Test with real questions whether the agent picks the right one.

## In practice

Coding agents and corporate assistants already use skills and tool search to handle many capabilities. In P5: Multi-Agent Researcher, the investigation report format and the safety checklist become skills, loaded only when the orchestrator reaches those steps.

## Common mistakes

- **Vague descriptions.** "Helps with reports" does not say when to use it; the agent picks wrong.
- **Skills with conflicting instructions.** Two skills that say to do opposite things confuse the agent.
- **Running code without isolation.** Generated code runs with the environment's permissions; use a sandbox.
- **Not measuring the choice.** Without a tool selection test, you do not know whether the index works.

## How to study

1. Read the Agent Skills article and the official documentation (2 hours).
2. Reread the article on writing tools for agents (1 hour).
3. Create three skills for a domain of yours, each with instructions and a script (2 days).
4. Put together 20 questions and measure whether the agent picks the right skill; rewrite the descriptions until it improves (1 day).
5. Compare an agent with 30 listed tools and the same one with tool search: tokens and accuracy (2 days).

## How to show it

Show the skills index, the rate of correct choices before and after rewriting the descriptions and the tokens saved. In the interview, explain how you would grow an agent from 5 to 100 capabilities without losing quality.
