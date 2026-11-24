---
titulo: "PF: Agente Completo"
codigo: "PF"
nivel: 4
resumo: "Projeto final: um agente de manutenção industrial com ferramentas via MCP, aprovação humana, guardrails, evals no CI, observabilidade, rate limit e fallback, no ar na AWS com alerta de custo."
stack:
  - "Python"
  - "FastAPI"
  - "PostgreSQL"
  - "Servidores MCP do P3"
  - "Langfuse"
  - "GitHub Actions"
  - "Docker"
  - "AWS"
criterios:
  - "Está no ar, com link funcionando"
  - "CI/CD roda testes e evals a cada mudança"
  - "Há alerta de custo configurado e o custo mensal é conhecido"
  - "O README traz a arquitetura completa com diagrama"
  - "Dá para diagnosticar uma resposta ruim pelos rastros da observabilidade"
referencias:
  - titulo: "Amazon ECS: Developer Guide"
    url: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "AWS Budgets: gerenciar custos"
    url: "https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Langfuse: documentação"
    url: "https://langfuse.com/docs"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "GitHub Actions: documentação"
    url: "https://docs.github.com/pt/actions"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O problema

Este é o projeto final: um agente de manutenção industrial que junta tudo o que você construiu. Ele conversa com o técnico, usa os servidores MCP do P3 como ferramentas, consulta e grava o histórico de ordens no Postgres, lembra do contexto da conversa, pede aprovação antes de ações irreversíveis e aplica guardrails e anonimização. E fica no ar, em um endereço público, com custo conhecido.

Se preferir outro domínio, tudo bem, desde que use todas as camadas. Use apenas dados públicos ou sintéticos.

## Arquitetura

Um serviço FastAPI recebe a mensagem e roda o loop do agente: o modelo decide qual ferramenta chamar, o sistema executa, devolve o resultado e repete até concluir. As ferramentas vêm dos servidores MCP do P3; ações que mudam o mundo passam por aprovação humana. Antes e depois do modelo agem os guardrails e o mascaramento de dados pessoais. Um limite de requisições por usuário e um fallback de modelo protegem contra picos e falhas do provedor. Cada passo é rastreado no Langfuse. O PostgreSQL guarda ordens e histórico.

O deploy usa contêiner Docker em ECS (Elastic Container Service, o serviço de contêineres da AWS), com um alerta de custo no AWS Budgets criado antes dos demais recursos. O CI/CD, no GitHub Actions, roda testes e evals a cada mudança e publica a imagem.

Veja os tópicos Frameworks de agentes, Rate limit e fallback, Observabilidade, CI/CD, AWS fundamentos e Segurança e custo na nuvem.

## Stack sugerida

Python, FastAPI, PostgreSQL, os servidores MCP do P3, Langfuse, GitHub Actions, Docker e AWS (ECS). Faça antes um curso introdutório de AWS e crie MFA e permissões mínimas antes de qualquer recurso.

## Critérios de aceite

- Está no ar, com link funcionando.
- O CI/CD roda testes e evals a cada mudança.
- Há alerta de custo configurado e o custo mensal é conhecido.
- O README traz a arquitetura completa com diagrama.
- Dá para diagnosticar uma resposta ruim pelos rastros da observabilidade.
- Ações irreversíveis exigem aprovação humana e ficam registradas.
- Há limite de uso e fallback de modelo, testados.

## O que colocar no README

- Link da demonstração, usuário de teste e um vídeo curto.
- Diagrama da arquitetura completa.
- Custo mensal medido e o alerta configurado, com o valor.
- Resultados dos evals e como rodam no CI.
- Uma resposta ruim real e o caminho do diagnóstico, do rastro ao ajuste e ao novo caso no golden set.
- Decisões e riscos conhecidos: prompt injection, dados pessoais, falha do provedor.
- Como desligar tudo para não gerar cobrança.

## Como apresentar na entrevista

Este é o projeto que sustenta a entrevista de design de sistemas. Percorra o desenho de ponta a ponta e, em cada caixa, diga a decisão e o porquê: por que agente aqui e workflow no P4, onde entra a aprovação humana, como você controla custo. Conte um incidente real: "uma resposta saiu errada, achei o motivo no rastro, corrigi e acrescentei o caso aos evals". Mostre o link no ar e o custo medido. Diga o que não está coberto e o que faria com mais tempo.
