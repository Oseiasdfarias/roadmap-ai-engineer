---
titulo: "Docker local"
nivel: 3
grupo: "Ferramentas"
ordem: 1
resumo: "Imagem, container, volume e rede, e um docker compose com banco, API e Langfuse rodando na sua máquina. É o ensaio do ambiente que o nível 4 leva para a nuvem."
tempo: "1 a 2 semanas"
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
  - titulo: "Docker Compose: visão geral"
    url: "https://docs.docker.com/compose/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Docker empacota uma aplicação com tudo o que ela precisa (Python, bibliotecas, configuração) para rodar igual em qualquer máquina. Quatro conceitos:

- **Imagem:** o pacote pronto, só leitura, descrito por um `Dockerfile`.
- **Container:** uma imagem em execução, isolada do resto do sistema.
- **Volume:** pasta que sobrevive ao container; é onde ficam os dados do banco.
- **Rede:** permite que os containers se encontrem pelo nome do serviço.

## Por que importa para um AI Engineer

"Funciona na minha máquina" não serve para um projeto de portfólio nem para produção. Com Docker, quem clona o seu repositório sobe banco, API e ferramentas com um comando. É também o ensaio do nível 4: a imagem que você roda localmente é a que vai para a nuvem, e o pipeline de CI/CD a constrói.

## Como funciona

O `docker compose` (versão 2, escrita com espaço, não hífen) descreve vários containers num arquivo YAML e os sobe juntos. Um exemplo mínimo com banco e API:

```yaml
services:
  db:
    image: pgvector/pgvector:pg17
    env_file: .env
    volumes: [dados:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
  api:
    build: .
    ports: ["8000:8000"]
    env_file: .env
    depends_on:
      db: {condition: service_healthy}
volumes:
  dados:
```

O `.env` fica fora do Git (`.gitignore`) e traz `POSTGRES_PASSWORD` e `DATABASE_URL`. Dentro da rede do compose, a API acessa o banco pelo nome `db`, não por `localhost`. O `healthcheck` roda `pg_isready`, e o `service_healthy` faz a API esperar o banco aceitar conexões, não só o container subir. A etiqueta da imagem (`pg17`) muda com o tempo; confira as versões disponíveis no Docker Hub.

Comandos essenciais: `docker compose up -d` sobe tudo em segundo plano, `docker compose logs -f api` acompanha os logs e `docker compose down` para e remove os containers. O volume continua, então os dados do banco permanecem; só `docker compose down -v` apaga o volume e os dados.

**Langfuse.** Para observabilidade local (veja observabilidade), o Langfuse oferece uma configuração `docker compose` própria, com vários serviços. Baixe o arquivo da documentação oficial e suba como um segundo compose, separado do seu, e a API envia os rastros a ele pelo endereço e pelas chaves de projeto do Langfuse, configurados no `.env` (de dentro de um container, `localhost` não alcança o outro compose; use `host.docker.internal` ou uma rede compartilhada). Isso consome memória e disco, então confira o que sua máquina suporta.

Imagens e volumes ocupam disco. Veja o uso com `docker system df` antes de baixar imagens grandes e apague o que não usa mais, sem tocar nos volumes que guardam dados que você quer manter.

## Na prática

No P2: RAG de Manuais Técnicos, o compose sobe o Postgres com pgvector e a API; no P1: Assistente da Montadora e no PF: Agente Completo, entra o Langfuse para ver cada chamada ao modelo. No nível 4, o mesmo `Dockerfile` é construído pelo pipeline e executado na AWS (veja aws-fundamentos e ci-cd).

## Erros comuns

- **Usar `localhost` para falar com o banco** de dentro de outro container. Use o nome do serviço.
- **Sem volume no banco.** Ao recriar o container, os dados somem.
- **Segredos no `Dockerfile` ou no compose.** Ficam gravados na imagem e no Git. Use `.env` ignorado pelo Git.
- **Imagem inchada.** Use uma imagem base enxuta e um `.dockerignore` para não copiar `.git` e dados.
- **Rodar `docker system prune` sem ler o aviso.** Pode apagar o que você precisava; entenda o que cada limpeza remove.

## Como estudar

1. Siga o Get started: rode uma imagem pronta e depois construa a sua (1 dia).
2. Escreva o `Dockerfile` de uma API simples e rode (1 dia).
3. Monte o compose com banco e API, com volume (1 a 2 dias).
4. Suba o Langfuse com a configuração oficial e envie um rastro de teste (1 dia).
5. Escreva no README o comando único para subir tudo (meio dia).

## Como mostrar

No portfólio, o README traz `docker compose up` como caminho de execução, com o `.env.example` (sem valores reais). Na entrevista, explique a diferença entre imagem e container, por que o banco precisa de volume e como os serviços se encontram na rede.
