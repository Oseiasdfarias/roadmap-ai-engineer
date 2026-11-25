---
titulo: "Take-home test"
fase: 3
grupo: "Junior developer"
ordem: 3
resumo: "The take-home test is your portfolio project in miniature: a well-read scope, a clear README, tests and explained decisions within the deadline. Learn what is usually evaluated and where people stumble."
relacionados:
  - "entrevista-tecnica"
  - "github-como-vitrine"
referencias:
  - titulo: "pytest: Get Started"
    url: "https://docs.pytest.org/en/stable/getting-started.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "GitHub Docs: About READMEs"
    url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "FastAPI: Tutorial"
    url: "https://fastapi.tiangolo.com/tutorial/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

The take-home test (also called a technical challenge) is a task the company sends you to solve at home, within a few days. It usually asks for a small API (the FastAPI documentation in the references helps you build one), a data script or a feature with an LLM, and the delivery goes into a repository with instructions to run it.

## Why it matters

It can be a heavy stage, because it shows how you work alone: how you read the scope, organize the code, test and communicate. Reviewers usually start with the README, try to run the project and only then look at the code. A project that does not run or does not explain what it did tends to lose points right away.

Criteria vary by company, and a good delivery does not guarantee you move forward. But the most common failures are avoidable.

## Step by step

1. **Read the prompt twice and list the requirements**, marking what is mandatory and what is optional. If something is ambiguous, ask and record the answer. Also ask whether AI assistants are allowed and how to declare their use; follow the company's rule.
2. **Agree on the deadline and plan your time.** Reserve the first part for the essentials working and the end for the README and tests.
3. **Do the minimum that meets the scope, and do it well.** Avoid adding features nobody asked for.
4. **Organize the code**: clear names, small functions and a simple folder structure.
5. **Write tests** for the main parts, with pytest. In LLM projects, use a test double (a fake version) of the model call so the test does not depend on the internet or a key.
6. **Write the README**: what the project does, how to install and run it, how to run the tests, decisions and what you would do with more time.
7. **Test in a clean folder.** Clone the repository from scratch, follow the README and confirm it works.
8. **Use Git properly**: small commits with clear messages, and no secrets in the repository.
9. **Deliver on time**, or let them know in advance if you need more time.

## Example

README excerpt, before:

> To run it, install the dependencies and run the project.

After:

> ## How to run
> 1. `python -m venv .venv`, and activate it with `source .venv/bin/activate` (Linux and macOS) or `.venv\Scripts\activate` (Windows)
> 2. `pip install -r requirements.txt`
> 3. `uvicorn app.main:app --reload`
> 4. Tests: `pytest`
>
> ## Decisions
> - I used SQLite to keep installation simple. In production, I would switch to PostgreSQL.
> - Authentication was outside the scope of the prompt. It would be the next step.

The second version has exact commands, shows you know the limits of the delivery and says what you would do next, instead of hiding it.

## Common mistakes

- **Not running the delivery from scratch.** The classic mistake is "it works on my machine".
- **Delivering without a README or with a generic one.**
- **Doing too much.** Adding frameworks and extras the scope does not ask for increases risk and the amount of code to explain.
- **Not testing.** Without tests, the reviewer does not know whether it works.
- **Pushing API keys.** Use environment variables and a `.env.example`.
- **Copying code without understanding it.** There will be questions about every part in the next interview.
- **Ignoring the deadline.** Delivering late without warning leaves a bad impression.

## Checklist

- Requirements listed and doubts cleared up.
- The project runs from a clean clone by following the README.
- README with how to run, how to test, decisions and next steps.
- Tests for the main flows passing.
- No secrets in the repository, with a `.env.example` included.
- Small commits with clear messages.
- Delivered within the deadline.
