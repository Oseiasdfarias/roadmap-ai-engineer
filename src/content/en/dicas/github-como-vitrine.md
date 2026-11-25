---
titulo: "GitHub as a showcase"
fase: 1
grupo: "Fundamentals"
ordem: 1
resumo: "Turn GitHub into your portfolio: a profile README, pinned projects, clear READMEs and frequent commits. It is the first place a technical recruiter checks what you can actually do."
relacionados:
  - "linkedin-desde-ja"
  - "curriculo"
referencias:
  - titulo: "GitHub Docs: Managing your profile README"
    url: "https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "GitHub Docs: Pinning items to your profile"
    url: "https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/pinning-items-to-your-profile"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "GitHub Docs: About READMEs"
    url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

GitHub is the platform where you store code with version history (Git). For people looking for a tech job, it works as a portfolio: it shows what you built, how you write and how often you work. A good showcase has three pieces: the profile, the pinned projects and the README (presentation file) of each repository.

## Why it matters

Recruiters for technical roles may open your GitHub after the résumé, and the read tends to be quick. An empty profile, or one full of unexplained repositories, does not help. A profile with a few well-presented projects answers on its own questions the résumé does not cover: does the code run? Are there tests? Does the person explain their decisions?

GitHub does not replace the interview, and nobody will read all your code. What you control is the first impression.

## Step by step

1. **Create the profile repository.** Create a public repository with your username. Its README appears at the top of your profile. Write who you are, what you study and links to LinkedIn and email, in ten lines.
2. **Pin two to four projects.** Pin the ones that show the most work and leave out loose course exercises.
3. **Write a README in each pinned project.** Include the problem it solves, how to run it (commands that actually work), a screenshot or usage example and the main decisions.
4. **Make small, frequent commits**, with a message that says what changed. A string of dozens of "update" commits teaches nothing to the reader.
5. **Use branches (parallel lines of work) and pull requests (requests to merge a branch into the main code) even when working alone.** It shows you know the team workflow.
6. **Never push secrets.** API keys and `.env` files stay out of Git. If you pushed one by mistake, revoke the key, because deleting the commit is not enough.
7. **Review every month.** Archive what got old and update what you pinned.

## Example

Project README, before:

> # chatbot
> AI project with Python.

After (illustrative example):

> # Technical manual search
> Answers questions about public manuals for industrial equipment and cites the manual and the page.
>
> **How to run:** `docker compose up`, then open `localhost:8000`.
> **Decision:** I used keyword search together with search by meaning, because fault codes such as "E014" do not show up in search by meaning.
> **Result:** on 20 test questions, the right passage appeared among the first five in 85% of cases (illustrative numbers, use yours).

The new version states the problem, the run command and a decision with a measured result. Someone reading for 30 seconds already knows whether it is worth opening the code.

## Common mistakes

- **Pinning repositories without a README.** The recruiter will not guess what the project does.
- **Copying a tutorial project without changing anything.** Make clear what is yours: add a feature, a test or a documented decision.
- **Committing secrets and personal data.** It exposes you and others and is hard to undo.
- **Waiting for the project to be perfect before publishing.** Publish early and improve through commits.
- **Relying only on the contributions graph.** Activity helps, but what convinces is the README and readable code.

## Checklist

- Profile repository created, with a short README.
- Two to four projects pinned.
- Each pinned project has a README with the problem, how to run it and the decisions.
- The README commands were tested in a clean folder.
- No secrets or personal data in the history.
- Commit messages describe the change.
- GitHub link in your résumé and on LinkedIn.
