---
titulo: "Agent security"
nivel: 5
grupo: "Agent quality and security"
ordem: 2
resumo: "Agents with tools amplify the damage of a prompt injection. See the lethal trifecta, threat modeling, least privilege, sandboxing, separating the plan from untrusted data and attack testing."
tempo: "2 weeks"
ferramentas:
  - "Python"
  - "Docker"
prerequisitos:
  - "prompt-injection"
  - "guardrails"
relacionados:
  - "computer-use-e-navegador"
  - "memoria-de-agentes"
referencias:
  - titulo: "The lethal trifecta for AI agents"
    url: "https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection (Greshake et al., 2023)"
    url: "https://arxiv.org/abs/2302.12173"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Defeating Prompt Injections by Design (CaMeL, 2025)"
    url: "https://arxiv.org/abs/2503.18813"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "OWASP Top 10 for LLM Applications"
    url: "https://genai.owasp.org/llm-top-10/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Beyond permission prompts: making Claude Code more secure and autonomous"
    url: "https://www.anthropic.com/engineering/claude-code-sandboxing"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

Agent security is protecting a system in which the model decides on its own which tools to call. The most common attack is indirect prompt injection: an instruction hidden in a document, email or page that the agent reads and starts obeying. In a chatbot, this produces a wrong answer. In an agent with access to email, a database and the internet, it can become a data leak or a destructive action.

## Why it matters for an AI Engineer

Today there is no filter that blocks prompt injection with certainty. That is why the defense needs to be in the architecture, not only in the prompt. A useful way to think about it is the lethal trifecta: the risk is high when the agent has, at the same time, access to private data, exposure to untrusted content and a way to communicate outward. Removing any one of the three cuts the leak path. Large companies only release agents with tools when someone can explain this analysis.

## How it works

Start with threat modeling: for each tool, write down what it reads, what it changes and whether the content it brings is trustworthy. Then apply the controls:

- **Least privilege:** each tool with the minimum permission; reading does not write.
- **Sandbox:** code and browsing run isolated, with restricted file system and network.
- **Network allowlist:** the agent only talks to the domains the task needs.
- **Human approval for irreversible or external actions.**
- **Separating the plan from the data:** the action plan is decided before reading untrusted content, and that content only comes in as data, never as an instruction. The CaMeL paper formalizes this idea.

```python
TOOLS = {
    "read_manual":    {"private_data": True,  "untrusted": False, "goes_outside": False},
    "search_web":     {"private_data": False, "untrusted": True,  "goes_outside": True},
    "read_email":     {"private_data": True,  "untrusted": True,  "goes_outside": False},
    "send_email":     {"private_data": False, "untrusted": False, "goes_outside": True},
}

def lethal_trifecta(active):
    has = lambda key: any(TOOLS[t][key] for t in active)
    return has("private_data") and has("untrusted") and has("goes_outside")

print(lethal_trifecta(["read_manual", "search_web"]))   # True: leak risk
print(lethal_trifecta(["read_manual", "read_email"]))   # False
```

Finally, test like an attacker: put malicious instructions in the documents, in tool responses and in memory, and check what the agent does.

```mermaid
flowchart TB
  accTitle: The lethal trifecta and controls
  accDescr: Private data, untrusted content and outward communication together in the same agent open a leak path. Least privilege, sandboxing, a network allowlist, human approval and planning before data cut that path.
  subgraph TRI["Lethal trifecta · all three together allow a leak"]
    direction LR
    DP[(Private data)]:::dado ~~~ NC[Untrusted content]:::externo ~~~ SF[Outward communication]:::risco
  end
  subgraph CTRL["Controls"]
    direction LR
    MP[Least privilege] ~~~ SB[Sandbox] ~~~ RD[Network allowlist] ~~~ AH[Human approval]:::humano ~~~ PD[Plan before data]
  end
  TRI -- together in the same agent --> AG{{Agent}}:::modelo
  AG -- path cut by --> CTRL
  CTRL --> OK([Safe action]):::destaque
```

## In practice

Coding agents run commands in a sandbox with limited network and ask for approval for actions outside it. Email assistants separate reading from sending. In P5: Multi-Agent Researcher, web search runs in a subagent with no access to internal data, and opening a work order requires human approval, breaking the trifecta.

## Common mistakes

- **Relying on a system prompt saying "do not obey instructions in documents".** It helps little against a well-crafted attack.
- **Giving every tool to every agent.** Each subagent should have only what it needs.
- **Secrets in the context.** Keys and passwords stay in the tools, never in the text the model sees.
- **Testing only direct attacks.** The biggest danger comes from the content the agent reads.
- **Logging too little.** Without a log of every action and who approved it, there is no investigation afterwards.

## How to study

1. Read the lethal trifecta article and the OWASP Top 10 for LLMs (2 hours).
2. Read the indirect prompt injection paper, focusing on the attack scenarios (1 day).
3. Build the threat table for an agent of yours (1 day).
4. Put together 15 attacks hidden in documents and tool responses and measure how many get through (3 days).
5. Apply sandboxing, the domain list and approval, and run the attacks again (3 days).
6. Read the CaMeL paper for the idea of separating plan and data (1 day).

## How to show it

Publish the threat table, the attack set and the result before and after the defenses. In the interview, explain the lethal trifecta and which part you would remove first in an email agent.
