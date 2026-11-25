---
titulo: "Terminal and environments"
nivel: 1
grupo: "Programming (without AI)"
ordem: 3
resumo: "Essential shell commands, environment variables, venv and uv, pyproject.toml and project structure. Includes keeping keys and secrets in .env files out of Git from your very first script."
tempo: "1 to 2 weeks"
ferramentas:
  - "Bash"
  - "venv"
  - "uv"
  - "pyproject.toml"
prerequisitos:
  - "python-fundamentos"
relacionados:
  - "git-e-github"
  - "docker-local"
referencias:
  - titulo: "The Missing Semester of Your CS Education (MIT)"
    url: "https://missing.csail.mit.edu/"
    tipo: "Curso"
    idioma: "en"
    gratuito: true
  - titulo: "Virtual Environments and Packages: official Python tutorial"
    url: "https://docs.python.org/3/tutorial/venv.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "uv: documentation"
    url: "https://docs.astral.sh/uv/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "The Twelve-Factor App: Config"
    url: "https://12factor.net/config"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

The terminal (or shell) is the computer's text interface: you type commands instead of clicking. A virtual environment is an isolated folder with the Python and libraries of one project, so that different projects do not fight over versions. Environment variables are named values the system hands to programs, the right place for API keys (the password that identifies you to a service).

## Why it matters for an AI Engineer

Almost everything in your work happens outside windows: installing libraries, running servers, reading logs (records of what the program did), connecting to remote machines. Tutorials and documentation assume you use the terminal without fear.

The second reason is security and reproducibility. An API key pushed to GitHub by mistake can be found and used by others within minutes, and you pay the bill. And a project that only runs on your machine is no use to a colleague or a recruiter.

## How it works

**Essential commands:** `pwd` (where am I), `ls` (list), `cd` (enter a folder), `mkdir` (create a folder), `cp` and `mv` (copy and move), `cat` (show a file), `grep` (search text), `|` (pass one command's output to another). On Windows, use WSL (Linux inside Windows) to get the same commands.

**Virtual environment:** each project has its own.

```bash
mkdir my-project && cd my-project
python3 -m venv .venv            # create the environment
source .venv/bin/activate        # activate (on Windows: .venv\Scripts\activate)
pip install requests
pip freeze > requirements.txt    # record the versions
```

**uv** is a newer tool that does the same, faster: `uv init`, `uv add requests` and `uv run main.py` create the environment, install and record dependencies in `pyproject.toml`, the standard file that describes the project (name, Python version, libraries).

**Secrets:** keep keys in a `.env` file, listed in `.gitignore` (the file that tells Git what not to version). The code reads the value from the environment:

```python
import os
key = os.environ.get("MY_KEY")
if key is None:
    raise SystemExit("Set MY_KEY in the environment or in .env")
```

To load `.env` automatically, use the `python-dotenv` library. To publish, leave a `.env.example` with the variable names and fake values.

**Project structure:** a `src/` folder or the package name, `tests/`, `README.md`, `pyproject.toml` and `.gitignore`.

## In practice

Every roadmap project starts with `uv init` (or `venv`), a `.gitignore` with `.venv` and `.env`, and a README with the commands to run it. In P1: Automaker Assistant, the LLM provider key lives in `.env`. In P3: Manuals MCP Server and the others, the same structure lets someone clone the repository and run it in minutes.

## Common mistakes

- **Installing packages into the global Python.** It causes version conflicts. Always activate the environment first.
- **Putting the API key directly in the code.** It ends up in Git history, and deleting it later does not remove it from history. If it leaks, revoke the key.
- **Forgetting to list dependencies.** Without `requirements.txt` or `pyproject.toml`, nobody can reproduce your project.
- **Versioning the `.venv` folder.** It is large and specific to your machine.
- **Running a copied command without reading it.** Especially with `rm -rf` or `sudo`.

## How to study

1. Do the Missing Semester shell lessons (1 day).
2. Create a project with `venv`, install a library and record the versions (1 day).
3. Do the same with `uv` and compare (1 day).
4. Set up `.env`, `.env.example` and `.gitignore`; check with `git status` that `.env` does not show up (half a day).
5. Read the Twelve-Factor App "Config" principle (1 hour).

## How to show it

In your portfolio, every repository has `pyproject.toml` or `requirements.txt`, a `.env.example` and a README with "how to run" in a few commands. In the interview, explain how you keep secrets out of Git and what you would do if a key leaked: revoke it, generate a new one and clean up any misuse.
