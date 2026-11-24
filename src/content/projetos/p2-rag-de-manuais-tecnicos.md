---
titulo: "P2: RAG de Manuais Técnicos"
codigo: "P2"
nivel: 3
resumo: "Ferramenta interna para técnicos de manutenção acharem falha, procedimento ou peça no manual do equipamento, com citação de manual e página, busca híbrida, reranking e evals de recuperação."
stack:
  - "Python"
  - "FastAPI"
  - "PostgreSQL com pgvector"
  - "BM25 ou full-text search"
  - "Modelo de reranking"
  - "Streamlit ou interface web"
criterios:
  - "Vários manuais públicos indexados com metadados de fabricante, modelo, seção e página"
  - "Toda resposta cita manual e página"
  - "Filtro por equipamento funciona"
  - "Métricas de recuperação (recall@k e MRR) estão no README"
  - "A interface funciona bem no celular"
referencias:
  - titulo: "pgvector: busca vetorial no PostgreSQL"
    url: "https://github.com/pgvector/pgvector"
    tipo: "Repositório"
    idioma: "en"
    gratuito: true
  - titulo: "Contextual Retrieval"
    url: "https://www.anthropic.com/research/contextual-retrieval"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Citations: documentação da API do Claude"
    url: "https://platform.claude.com/docs/en/build-with-claude/citations"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O problema

Técnicos de manutenção perdem tempo procurando, em PDFs longos, o significado de um código de falha, um procedimento ou a referência de uma peça. Você constrói uma ferramenta interna em que o técnico escolhe o equipamento, pergunta em linguagem comum e recebe uma resposta curta com a citação do manual e da página.

Use manuais públicos de equipamentos industriais, como inversores de frequência, CLPs e sensores. Muitos fabricantes os distribuem em PDF. Confira a licença de cada documento antes de publicar qualquer trecho no repositório. Se houver dúvida, não publique o PDF: publique só o script que o baixa.

## Arquitetura

Há dois fluxos. Na indexação, o sistema lê cada PDF, divide o texto por seção (chunking, ou corte do texto em trechos), guarda os metadados (fabricante, modelo, seção, página) e gera os embeddings, vetores que representam o significado. Na consulta, aplica o filtro por equipamento, roda a busca híbrida (por significado e por palavra-chave), reordena os melhores resultados com um modelo de reranking e envia ao LLM só os trechos finais, com a instrução de citar manual e página.

A busca por significado sozinha erra códigos de falha e nomes de peça, que não têm significado próprio. A busca por palavra-chave resolve esse caso. Veja os tópicos RAG, Busca híbrida e reranking e Embeddings.

Um detalhe que decide a qualidade: guarde, junto de cada trecho, o texto da seção e o número da página. Sem isso a citação fica vaga e o técnico não consegue conferir no PDF. Tabelas e figuras costumam sair mal da extração de texto; teste pelo menos um manual com tabelas e anote o que perdeu.

## Stack sugerida

Python, FastAPI, PostgreSQL com pgvector (vetores e full-text search no mesmo banco, o que simplifica), um modelo de reranking e Streamlit ou uma interface web simples. Veja os tópicos Postgres e pgvector, FastAPI e Frontend com IA.

## Critérios de aceite

- Vários manuais públicos indexados, com fabricante, modelo, seção e página.
- Toda resposta cita manual e página, e responde "não encontrei" quando o trecho não existe.
- O filtro por equipamento funciona.
- As métricas de recuperação (recall@k e MRR) estão no README, medidas num conjunto de perguntas com o trecho certo marcado.
- A interface funciona bem no celular.

## O que colocar no README

- O problema e uma captura de tela da interface no celular.
- Quais manuais foram indexados e a licença de cada um.
- Diagrama dos dois fluxos.
- Tabela de métricas: recall@5 e MRR com busca vetorial, com busca híbrida e com reranking.
- Três perguntas em que o sistema errou e o que você concluiu de cada uma.
- Como reindexar um manual novo.
- Limitações, como tabelas e figuras dentro dos PDFs.

## Como apresentar na entrevista

A história mais forte é a da medição: "comecei só com vetor e o recall@5 foi X; códigos de falha falhavam; acrescentei busca por palavra-chave e o resultado foi Y; o reranking mudou Z". Explique recall@k e MRR em uma frase cada. Esteja pronto para falar de chunking, de por que os metadados importam e de como você evitaria resposta inventada. Mostre a pergunta em que o sistema ainda falha e o que tentaria depois.
