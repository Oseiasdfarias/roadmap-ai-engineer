---
titulo: "Computer use and browser agents"
nivel: 5
grupo: "Agents in action"
ordem: 1
resumo: "Agents that operate interfaces like a person: they see the screen, click and type. When to use them instead of an API, how to isolate the environment, how to handle slowness and errors and why the security risk is higher."
tempo: "1 to 2 weeks"
ferramentas:
  - "Python"
  - "Playwright"
  - "Docker"
prerequisitos:
  - "tool-use"
  - "docker-local"
relacionados:
  - "seguranca-de-agentes"
  - "avaliacao-de-agentes"
referencias:
  - titulo: "Computer use tool: Claude API documentation"
    url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Computer use: OpenAI guide"
    url: "https://platform.openai.com/docs/guides/tools-computer-use"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Playwright for Python"
    url: "https://playwright.dev/python/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "browser-use"
    url: "https://github.com/browser-use/browser-use"
    tipo: "Repositório"
    idioma: "en"
    gratuito: true
  - titulo: "OSWorld: benchmark of agents on real computers"
    url: "https://os-world.github.io/"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

Computer use is when an agent controls a computer through the graphical interface: it receives a screenshot, decides where to click or what to type and repeats until the task is done. Browser agents are the most common case, and they can work with screenshots, with the page's accessibility tree or with both. The major providers offer their own tools for this, and there are open libraries that connect a model to a browser controlled by Playwright.

## Why it matters for an AI Engineer

Many important systems have no API: supplier portals, old internal systems, government websites. An agent that operates the interface solves cases that used to require fragile, hand-made automation. On the other hand, it is slow, more expensive per task and more error-prone than an API call, and every page it reads may contain malicious instructions. Knowing when it is worth it, and how to isolate the agent, is what separates a demo from something usable.

## How it works

The cycle is the same as any agent's, with interface actions instead of ordinary tools: observe (screenshot or page tree), decide the next action, execute and observe again. Prefer giving the model selectors and page text when possible; screenshots cost more tokens and get small details wrong more often.

```python
from playwright.sync_api import sync_playwright

def observe(page):
    """Visible text and clickable elements: cheaper input than a screenshot."""
    links = page.get_by_role("link").all()[:20]
    return {"title": page.title(),
            "links": [l.inner_text().strip() for l in links if l.inner_text().strip()]}

with sync_playwright() as p:
    browser = p.chromium.launch()              # headless, isolated
    page = browser.new_page()
    page.goto("https://playwright.dev/python/")
    print(observe(page))                       # the model would decide the next click
    browser.close()
```

To run it safely:

- **Isolated environment:** a container or virtual machine with no access to your personal credentials and with limited network.
- **Allowed domains list:** the agent only browses where the task requires.
- **Human confirmation for sensitive actions:** buying, sending, deleting, accepting terms.
- **Step and time limits:** interface agents can get into loops.

## In practice

The uses that work today are repetitive, well-defined tasks in systems without an API: filling in a form with known data, extracting information from a portal, testing an interface flow. Benchmarks such as OSWorld show that open-ended tasks on real computers are still hard for agents. In P5: Multi-Agent Researcher, an optional layer adds a subagent that queries a technical bulletin portal without an API, in an isolated container.

## Common mistakes

- **Using the interface when an API exists.** The API is faster, cheaper and more stable.
- **Running in your personal browser.** The agent inherits your logins and can act on your behalf.
- **Trusting the page text.** A page can contain instructions for the agent; treat it as data.
- **Not logging the actions.** Without screenshots and logs of each step, you cannot debug.

## How to study

1. Read a provider's computer use documentation, including the security recommendations (2 hours).
2. Run the Playwright example and evolve it into a loop with the model choosing the next link (2 days).
3. Run the same agent in a Docker container with an allowed domains list (2 days).
4. Create 10 test tasks and measure success rate, steps and cost (2 days).
5. Put a hidden instruction on a test page and check whether the agent obeys (1 day).

## How to show it

Show a video of the agent completing a task, the success rate on the test tasks and the isolation setup. In the interview, explain when you would choose computer use and which controls you would put in place before releasing it to users.
