---
titulo: "P1: Assistente da Montadora"
codigo: "P1"
nivel: 3
resumo: "Assistente de atendimento de uma montadora que cresce em sete camadas: conversa, ferramentas, RAG, LGPD, guardrails, evals e observabilidade. Cada camada é uma versão marcada no Git."
camadas:
  - versao: "v1"
    nome: "Conversa"
    entrega: "Chat com system prompt e histórico, no terminal e depois numa interface simples."
  - versao: "v2"
    nome: "Saída estruturada e tools"
    entrega: "Extração da intenção do cliente em JSON e ferramentas simuladas, como consultar preço e agendar revisão."
  - versao: "v3"
    nome: "RAG"
    entrega: "Respostas com base no manual do proprietário e no catálogo, citando a fonte."
  - versao: "v4"
    nome: "LGPD"
    entrega: "Detecção e máscara de CPF, telefone, placa e nome antes de enviar ao LLM e de gravar log."
  - versao: "v5"
    nome: "Guardrails e segurança"
    entrega: "Recusa do que está fora do escopo, nenhuma promessa de preço sem consultar a ferramenta e testes de prompt injection."
  - versao: "v6"
    nome: "Evals"
    entrega: "Golden set com 30 a 50 perguntas, LLM-as-judge com rubrica e relatório de resultados."
  - versao: "v7"
    nome: "Observabilidade e custo"
    entrega: "Rastreio de cada conversa com Langfuse local, medindo custo e latência por conversa."
stack:
  - "Python"
  - "FastAPI"
  - "PostgreSQL com pgvector"
  - "Pydantic"
  - "Presidio"
  - "Langfuse"
  - "Docker Compose"
criterios:
  - "Roda local com um comando e tem README com instruções"
  - "Cada camada tem uma tag no Git (v1 a v7)"
  - "Respostas do RAG citam a fonte"
  - "Dados pessoais são mascarados antes do LLM e dos logs"
  - "Há um relatório de evals com o golden set"
referencias:
  - titulo: "Microsoft Presidio"
    url: "https://microsoft.github.io/presidio/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Langfuse: documentação"
    url: "https://langfuse.com/docs"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "OWASP Top 10 for LLM Applications"
    url: "https://genai.owasp.org/llm-top-10/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "pgvector: busca vetorial no PostgreSQL"
    url: "https://github.com/pgvector/pgvector"
    tipo: "Repositório"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O problema

Uma montadora de carros (fictícia) quer atender clientes por chat: tirar dúvidas sobre modelos, revisões e garantia, e agendar revisão. Você constrói esse assistente. O desafio não é fazer o chat responder, e sim fazê-lo responder certo: sem inventar preço, sem vazar dado pessoal, sem obedecer instruções maliciosas e com a qualidade medida.

Este é o projeto principal do Nível 3 e cresce em camadas. Cada camada pratica um tópico do roadmap, e no fim você tem um sistema com as peças de um produto real.

## Arquitetura

O cliente fala com uma API em FastAPI. Antes de qualquer chamada ao modelo, uma camada de privacidade mascara CPF, telefone, placa e nome. Em seguida, o assistente decide se responde com o manual (RAG, busca em PostgreSQL com pgvector) ou se chama uma ferramenta (consultar preço, agendar revisão). A saída é validada com Pydantic e passa por guardrails antes de chegar ao cliente. Cada conversa é rastreada no Langfuse.

Use dados públicos ou sintéticos: um manual do proprietário de domínio público ou escrito por você, um catálogo e clientes inventados. Nunca use dados reais de uma empresa ou de pessoas.

## Versões em camadas

Cada camada é uma versão marcada com tag no Git, de `v1` a `v7`, para que quem olhar o repositório veja a evolução. A cada versão, refaça os testes das anteriores. Os tópicos de estudo de cada uma são: API e parâmetros (v1), saída estruturada e tool use (v2), RAG (v3), LGPD e dados pessoais (v4), guardrails e prompt injection (v5), evals (v6), observabilidade e custo e latência (v7).

## Stack sugerida

Python, FastAPI, PostgreSQL com pgvector, Pydantic, Presidio para detectar dados pessoais, Langfuse para rastreamento e Docker Compose para subir tudo com um comando. Veja os tópicos Postgres e pgvector, Docker local e Observabilidade.

## Critérios de aceite

- Roda local com um comando e tem README com instruções.
- Cada camada tem uma tag no Git (v1 a v7).
- Respostas do RAG citam a fonte.
- Dados pessoais são mascarados antes do LLM e dos logs.
- Há um relatório de evals com o golden set (30 a 50 perguntas).
- Ao menos cinco testes de prompt injection estão documentados, com o que passou e o que falhou.

## O que colocar no README

- O problema e o público, em um parágrafo.
- Diagrama da arquitetura e a lista das sete camadas, com a tag de cada uma.
- Como rodar (`docker compose up`) e como rodar os testes.
- Decisões técnicas e o motivo, por exemplo por que mascarar antes do modelo e não depois.
- Resultados dos evals: a nota por camada, os erros mais frequentes e o que você mudou depois deles.
- Custo e latência médios por conversa (meça no Langfuse).
- O que você faria diferente e as limitações conhecidas.

## Como apresentar na entrevista

Conte o projeto em camadas: o problema, a camada em que você mais aprendeu e uma decisão medida. Exemplo de decisão: "o RAG respondia mal perguntas sobre garantia, então mudei o corte do texto por seção e medi de novo no golden set". Esteja pronto para explicar por que o modelo pode alucinar, o que o mascaramento resolve e o que ele não resolve, e por que não existe filtro perfeito contra prompt injection. Mostre o relatório de evals e o rastro de uma conversa ruim no Langfuse. Diga com honestidade o que o assistente ainda faz mal.
