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
referencias: []
revisado: "2026-11-24"
rascunho: true
---

## O problema

Em construção.

## Arquitetura

Em construção.

## Versões em camadas

Em construção.

## Stack sugerida

Em construção.

## Critérios de aceite

Em construção.

## O que colocar no README

Em construção.

## Como apresentar na entrevista

Em construção.
