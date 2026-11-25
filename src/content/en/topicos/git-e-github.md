---
titulo: "Git and GitHub"
nivel: 1
grupo: "Programming (without AI)"
ordem: 4
resumo: "Commit, branch, merge and pull request, plus .gitignore, README and team workflow. Your commit history is one of the first signals a technical recruiter checks on your profile."
tempo: "1 to 2 weeks"
ferramentas:
  - "Git"
  - "GitHub"
prerequisitos:
  - "terminal-e-ambientes"
relacionados:
  - "terminal-e-ambientes"
  - "ci-cd"
referencias:
  - titulo: "Pro Git"
    url: "https://git-scm.com/book/en/v2"
    tipo: "Livro"
    idioma: "en"
    gratuito: true
  - titulo: "GitHub Skills"
    url: "https://skills.github.com/"
    tipo: "Curso"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

Git is a version control system: it stores your project's history as "snapshots" called commits, and lets you go back to any of them. GitHub is the website that hosts Git repositories in the cloud and adds collaboration: code review, issues (tasks and bugs) and pull requests (requests to bring changes in).

## Why it matters for an AI Engineer

Every software team uses Git, and junior roles ask about it. It is also your showcase: technical recruiters open your GitHub and look at the projects, the README and the history. Frequent, well-described commits show that you work in an organized way. A repository with a single commit called "final" says the opposite.

In day-to-day AI work, Git protects you from a common problem: experiments. You change a prompt, the result gets worse, and you want to go back. With commits, going back is one command.

## How it works

The basic flow has three areas: the working folder, the staging area (where you choose what goes into the next commit) and the history.

```bash
git init -b main                 # start a repository (main branch)
git add main.py README.md        # stage files
git commit -m "Add CSV reading"
git switch -c tweak-prompt       # create and enter a branch
git switch main                  # go back (older installs may default to master)
git merge tweak-prompt           # merge the branch into the current one
git log --oneline                # see the history
```

A **branch** is a parallel line of work: you test an idea without touching the stable version. A **merge** joins the lines. When two people change the same line, a conflict appears, which you resolve by choosing the final text by hand.

In a team, the common flow is: create a branch for each task, open a **pull request** on GitHub, get a review, adjust and only then bring it into the main branch. That main branch is usually protected, and nobody changes it directly.

**`.gitignore`** lists what Git ignores: `.venv/`, `.env`, `__pycache__/`. **README.md** is the front door: what the project does, how to run it and an example of the result.

Good commit messages say what changed and, when it matters, why: "Change chunk size from 500 to 300 characters" is useful; "tweaks" is not.

## In practice

Each roadmap project (P1: Automaker Assistant to PF: Complete Agent) is a public GitHub repository, with a README, a correct `.gitignore` and a history that tells the evolution: first the minimal version, then each improvement in its own commit or pull request. Even working alone, use branches and pull requests for larger changes; it is the habit the market expects.

## Common mistakes

- **Committing secrets.** Keys in `.env` pushed to GitHub can be used by others. Check `.gitignore` before the first commit.
- **Huge commits and empty messages.** A commit should have one purpose; that makes it easy to review and to undo.
- **Working directly on the main branch.** It makes review and rollback harder.
- **Using `git push --force` without understanding it.** It rewrites the remote history and can erase other people's work.
- **A repository without a README.** Newcomers do not know what it is or how to run it.

## How to study

1. Read chapters 1 to 3 of Pro Git: fundamentals and branches (2 to 3 days).
2. Take the introductory GitHub Skills courses, including the one on pull requests (2 days).
3. Create a test repository and cause a merge conflict on purpose to resolve it (1 day).
4. Publish a project of yours with `.gitignore`, a README and at least ten meaningful commits (1 week).
5. Ask a colleague to open a pull request on your repository and review it (1 day).

## How to show it

In your portfolio, pin your best repositories on your GitHub profile, each with a clear README and a clean history. In the interview, be able to explain the difference between a merge and a pull request, describe how you resolved a conflict and say what you would do if you committed a key by mistake: revoke the key, not just delete the file.
