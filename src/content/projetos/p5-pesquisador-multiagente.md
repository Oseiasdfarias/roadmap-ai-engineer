---
titulo: "P5: Pesquisador Multiagente"
codigo: "P5"
nivel: 5
resumo: "Um sistema que investiga falhas de equipamento com um orquestrador e subagentes paralelos, memória, execução durável, um modelo aberto servido por você, avaliação de trajetória e defesas contra prompt injection."
camadas:
  - versao: "v1"
    nome: "Agente único medido"
    entrega: "Um agente que investiga uma falha nos manuais e nas ordens antigas, com 30 casos de avaliação e custo por investigação."
  - versao: "v2"
    nome: "Orquestrador e subagentes"
    entrega: "Plano, subagentes paralelos com contexto próprio e síntese com citação; comparação com o v1 em acerto, custo e tempo."
  - versao: "v3"
    nome: "Contexto e memória"
    entrega: "Orçamento de tokens, notas de pesquisa, compactação e memória de investigações anteriores com origem e validade."
  - versao: "v4"
    nome: "Execução durável e aprovação"
    entrega: "Checkpoints, retomada depois de queda e abertura de ordem de serviço só com aprovação humana e chave de idempotência."
  - versao: "v5"
    nome: "Modelo aberto"
    entrega: "Subagente de classificação servido com vLLM ou llama.cpp, com tabela de memória do KV cache, latência e custo contra uma API."
  - versao: "v6"
    nome: "Avaliação e segurança"
    entrega: "Avaliação de trajetória com pass^3, 15 ataques de prompt injection indireta e defesas aplicadas, com resultado antes e depois."
  - versao: "v7"
    nome: "Interoperabilidade e rastros"
    entrega: "Pesquisador exposto como agente A2A e rastro único por investigação com OpenTelemetry, do orquestrador aos subagentes."
stack:
  - "Python"
  - "Um framework de agentes ou código próprio"
  - "Postgres com pgvector"
  - "vLLM ou llama.cpp"
  - "Temporal, DBOS ou checkpoints do LangGraph"
  - "OpenTelemetry e Langfuse"
  - "Docker"
criterios:
  - "A versão multiagente foi comparada com a de agente único na mesma avaliação, com custo e tempo"
  - "A avaliação mede trajetória e consistência (pass^3), não só a resposta final"
  - "O sistema retoma uma investigação depois de uma queda sem repetir ações com efeito externo"
  - "Nenhuma ordem de serviço é aberta sem aprovação humana registrada"
  - "A tríade letal foi analisada e quebrada; os ataques de teste estão documentados"
  - "O subagente com modelo aberto tem a conta de memória e a comparação com a API publicadas"
referencias:
  - titulo: "How we built our multi-agent research system"
    url: "https://www.anthropic.com/engineering/multi-agent-research-system"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "τ-bench: A Benchmark for Tool-Agent-User Interaction (Yao et al., 2024)"
    url: "https://arxiv.org/abs/2406.12045"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "vLLM: documentação"
    url: "https://docs.vllm.ai/en/latest/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Agent2Agent (A2A) Protocol: documentação"
    url: "https://a2a-protocol.org/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## O problema

Quando um equipamento da linha de produção falha, um engenheiro gasta horas cruzando manuais, ordens de manutenção antigas e boletins técnicos para chegar às causas prováveis. O P4: Triagem de Ordens de Manutenção classificou ordens; o PF: Agente Completo colocou um agente em produção. O P5 resolve uma tarefa mais aberta e longa: investigar uma falha de ponta a ponta, buscando em várias fontes ao mesmo tempo, e propor uma ordem de serviço que só é aberta depois da aprovação de uma pessoa.

É o projeto em que você aplica, com números, tudo o que o nível 5 trata: modelos por dentro, arquitetura agêntica, avaliação e segurança.

## Arquitetura

Um orquestrador recebe o código de erro e o equipamento, planeja a investigação e dispara subagentes em paralelo: um busca nos manuais (com o código do P2: RAG de Manuais Técnicos ou do P3: Servidor MCP de Manuais), outro nas ordens antigas, outro nos boletins públicos na web. Cada subagente tem contexto e ferramentas próprios e devolve só os achados com fonte. O orquestrador sintetiza as causas prováveis, consulta a memória de investigações anteriores e propõe uma ordem de serviço.

A execução é durável: cada passo fica registrado, e a espera pela aprovação humana sobrevive a reinícios. O subagente da web não tem acesso aos dados internos, o que quebra a tríade letal. Um subagente de classificação simples roda num modelo aberto servido por você. Todo o fluxo gera um rastro único, e os rastros ruins viram casos de avaliação.

```mermaid
flowchart TB
  accTitle: Arquitetura do P5: Pesquisador Multiagente
  accDescr: O orquestrador planeja e dispara três subagentes em paralelo (manuais, ordens antigas e web isolada), sintetiza os achados com a memória e propõe uma ordem de serviço que só é aberta com aprovação humana. Tudo roda com checkpoints e gera um rastro único.
  IN([Código de erro + equipamento]) --> O{{Orquestrador}}:::modelo
  O <-.-> MEM[(Memória de investigações)]:::dado
  subgraph SUB["Subagentes em paralelo · contexto próprio"]
    direction LR
    S1[Manuais · RAG/MCP]
    S2[Ordens antigas]
    S3[Boletins na web · sandbox]:::externo
  end
  O --> SUB
  SUB -- achados com fonte --> SIN[Síntese das causas prováveis]
  SIN --> AP[Aprovação humana]:::humano
  AP -- aprovada --> OS([Ordem de serviço aberta]):::destaque
  AP -- recusada --> FIM([Arquivada com motivo])
  S3 -. sem acesso a dados internos .-x MEM
```

Veja os tópicos Multiagentes e orquestração, Engenharia de contexto avançada, Memória de agentes, Execução durável, Servir modelos abertos, Avaliação de agentes, Segurança de agentes e Observabilidade de agentes.

## Versões em camadas

Cada camada é uma versão marcada no Git, com o relatório de avaliação daquela versão. Comece pelo agente único medido: sem essa linha de base, não dá para provar que a versão multiagente vale o custo extra. A camada do modelo aberto pode usar uma GPU alugada por poucas horas, com alerta de custo ligado.

## Stack sugerida

Python, um framework de agentes (ou código próprio, se preferir entender cada parte), Postgres com pgvector para busca e memória, vLLM ou llama.cpp para o modelo aberto, um motor de execução durável (Temporal, DBOS ou checkpoints do LangGraph), OpenTelemetry com Langfuse para rastros e Docker para isolar o subagente da web.

## Critérios de aceite

- A versão multiagente foi comparada com a de agente único na mesma avaliação, com acerto, custo e tempo.
- A avaliação mede trajetória e consistência (pass^3), não só a resposta final.
- O sistema retoma uma investigação depois de uma queda sem repetir ações com efeito externo.
- Nenhuma ordem de serviço é aberta sem aprovação humana registrada.
- A tríade letal foi analisada e quebrada, e os ataques de teste estão documentados.
- O subagente com modelo aberto tem a conta de memória e a comparação com a API publicadas.

## O que colocar no README

Um diagrama da arquitetura com o orquestrador, os subagentes, as fontes e os pontos de aprovação. A tabela de comparação entre agente único e multiagente. O relatório de avaliação com pass^3 e exemplos de trajetórias boas e ruins. A tabela de ameaças com as defesas e o resultado dos ataques. A conta de memória do KV cache do modelo aberto. Um vídeo curto mostrando uma investigação, uma queda e a retomada.

## Como apresentar na entrevista

Conte a história em decisões: por que começou com um agente único, o que os números mostraram, por que dividiu em subagentes e quanto isso custou. Mostre uma trajetória ruim que a avaliação pegou e como você corrigiu. Explique a análise de segurança em uma frase por ferramenta. Esteja pronto para responder quando você não usaria vários agentes e quando não serviria um modelo próprio.
