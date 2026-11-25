---
titulo: "Local Docker"
nivel: 3
grupo: "Tools"
ordem: 1
resumo: "Image, container, volume and network, and a docker compose with database, API and Langfuse running on your machine. It is the rehearsal of the environment that level 4 takes to the cloud."
tempo: "1 to 2 weeks"
ferramentas:
  - "Docker"
  - "Docker Compose"
  - "PostgreSQL"
prerequisitos:
  - "terminal-e-ambientes"
relacionados:
  - "ci-cd"
  - "observabilidade"
referencias:
  - titulo: "Docker: Get started"
    url: "https://docs.docker.com/get-started/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Docker Compose: overview"
    url: "https://docs.docker.com/compose/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

Docker packages an application with everything it needs (Python, libraries, configuration) so it runs the same on any machine. Four concepts:

- **Image:** the ready, read-only package, described by a `Dockerfile`.
- **Container:** an image running, isolated from the rest of the system.
- **Volume:** a folder that outlives the container; it is where the database's data lives.
- **Network:** lets containers find each other by service name.

## Why it matters for an AI Engineer

"It works on my machine" does not cut it for a portfolio project or for production. With Docker, whoever clones your repository starts the database, API and tools with one command. It is also the rehearsal for level 4: the image you run locally is the one that goes to the cloud, and the CI/CD pipeline builds it.

## How it works

`docker compose` (version 2, written with a space, not a hyphen) describes several containers in a YAML file and starts them together. A minimal example with a database and an API:

```yaml
services:
  db:
    image: pgvector/pgvector:pg17
    env_file: .env
    volumes: [data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
  api:
    build: .
    ports: ["8000:8000"]
    env_file: .env
    depends_on:
      db: {condition: service_healthy}
volumes:
  data:
```

The `.env` file stays out of Git (`.gitignore`) and holds `POSTGRES_PASSWORD` and `DATABASE_URL`. Inside the compose network, the API reaches the database by the name `db`, not `localhost`. The `healthcheck` runs `pg_isready`, and `service_healthy` makes the API wait until the database accepts connections, not just until the container starts. The image tag (`pg17`) changes over time; check the available versions on Docker Hub.

Essential commands: `docker compose up -d` starts everything in the background, `docker compose logs -f api` follows the logs and `docker compose down` stops and removes the containers. The volume remains, so the database's data stays; only `docker compose down -v` deletes the volume and the data.

**Langfuse.** For local observability (see the observability topic), Langfuse offers its own `docker compose` setup, with several services. Download the file from the official documentation and start it as a second compose, separate from yours, and the API sends traces to it using the Langfuse address and project keys, set in `.env` (from inside a container, `localhost` does not reach the other compose; use `host.docker.internal` or a shared network; on Linux, add `extra_hosts: ["host.docker.internal:host-gateway"]` to the `api` service). It uses memory and disk, so check what your machine can handle.

Images and volumes take up disk space. Check usage with `docker system df` before pulling large images and delete what you no longer use, without touching the volumes that hold data you want to keep.

## In practice

In P2: Technical Manuals RAG, the compose starts Postgres with pgvector and the API; in P1: Automaker Assistant and PF: Complete Agent, Langfuse joins to show every model call. In level 4, the same `Dockerfile` is built by the pipeline and run on AWS (see the AWS fundamentals and CI/CD topics).

## Common mistakes

- **Using `localhost` to talk to the database** from inside another container. Use the service name.
- **No volume for the database.** When the container is recreated, the data disappears.
- **Secrets in the `Dockerfile` or the compose file.** They get baked into the image and into Git. Use a `.env` ignored by Git.
- **A bloated image.** Use a lean base image and a `.dockerignore` so `.git` and data are not copied.
- **Running `docker system prune` without reading the warning.** It can delete what you needed; understand what each cleanup removes.

## How to study

1. Follow Get started: run a ready-made image and then build your own (1 day).
2. Write the `Dockerfile` for a simple API and run it (1 day).
3. Build the compose with database and API, with a volume (1 to 2 days).
4. Start Langfuse with the official setup and send a test trace (1 day).
5. Write the single command to start everything in the README (half a day).

## How to show it

In your portfolio, the README has `docker compose up` as the way to run the project, with a `.env.example` (no real values). In the interview, explain the difference between an image and a container, why the database needs a volume and how services find each other on the network.
