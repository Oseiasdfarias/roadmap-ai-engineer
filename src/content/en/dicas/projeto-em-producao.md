---
titulo: "Project in production"
fase: 4
grupo: "Transition to AI"
ordem: 2
resumo: "The final project live is your proof: a working link, known cost, evals and a documented architecture. It shows that you go beyond a local demo and can actually operate a system."
relacionados:
  - "puxar-tarefas-de-ia"
  - "contar-a-historia"
referencias:
  - titulo: "AWS Budgets: managing costs"
    url: "https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Langfuse: documentation"
    url: "https://langfuse.com/docs"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "GitHub Actions: documentation"
    url: "https://docs.github.com/en/actions"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

It is putting the roadmap's final project (PF: Complete Agent) live, at a public address, with what is expected of a real system: measured cost, automated evaluation (evals, tests that measure answer quality), tracing of answers and a documented architecture. Production here means someone else opens the link and uses it, without you running anything.

## Why it matters

A project that only runs on your computer shows you can build. A live project shows you can operate: deal with cost, failure, secrets and diagnosis. That brings your portfolio closer to professional work.

A live link also creates obligations, such as cost and security. Have controls in place before publishing.

## Step by step

1. **Define the minimum public scope.** A simple interface, limited use and synthetic or public data.
2. **Protect the account before creating resources.** Turn on MFA (two-step verification), use minimal permissions and set up an AWS Budgets alert before any other resource. Note: by default AWS Budgets only alerts and does not block spending (Budget Actions can apply restrictions, but it requires configuration). Also set a monthly spending limit in the model provider's dashboard.
3. **Keep secrets out of the code**, in environment variables or a secrets service.
4. **Automate tests and evals with GitHub Actions.** Every change should run tests and evaluate quality before going live.
5. **Deploy with a container.** Package the application in Docker and run it on a managed service. The roadmap uses ECS on AWS, and the fixed infrastructure cost (container, load balancer, database) exists even when nobody uses it.
6. **Turn on tracing.** Use Langfuse (an observability tool for LLMs) or similar to see the input, output, tokens, cost and latency of each answer.
7. **Limit usage** with rate limiting and a model fallback, so a wave of requests does not generate a big bill.
8. **Document the architecture** with a diagram, the measured monthly cost and what happens when something fails.
9. **Record a short demo** and put the link in the README.

## Example

README, before:

> AI agent project. Run locally with `python main.py`.

After (illustrative values, use yours):

> **Demo:** https://demo.example.com (test user in the README; change the password after sharing)
> **Architecture:** diagram in `docs/architecture.png`
> **Measured cost:** fixed infrastructure of US$ X per month, plus US$ Y of model usage for 200 test conversations. AWS Budgets alert at US$ Z and a monthly limit at the model provider. (Fill in X, Y and Z with what you measure on the bill; in a small project, infrastructure usually weighs more than the model.)
> **Quality:** 42 of 50 golden set cases (a fixed set of questions with expected answers) passing, running on every pull request.
> **Diagnosis:** every answer has a trace in Langfuse; see `docs/diagnosis.md`.

The second version answers the reviewer's questions before they are asked: is it live? how much does it cost? how do you know it works?

## Common mistakes

- **Publishing without an alert and a spending limit.** A forgotten resource or abuse can generate an unexpected charge, and an alert alone does not stop it.
- **Leaving the API key in a public repository.**
- **Having no usage limit.** Anyone can exhaust your quota.
- **The link being down at interview time.** Test it beforehand and have a backup video.
- **Uploading real or personal data.**
- **Forgetting to shut down** what is not in use and paying for it.

## Checklist

- MFA and minimal permissions on the account.
- Cost alert set up before creating resources, and a spending limit at the model provider.
- Secrets out of the code and out of Git.
- CI with tests and evals on every change.
- Answer tracing turned on.
- Rate limiting and fallback implemented.
- README with the link, architecture, cost and eval results.
- Link tested on the day of the interview.
