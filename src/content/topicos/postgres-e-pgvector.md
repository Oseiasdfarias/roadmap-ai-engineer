---
titulo: "Postgres e pgvector"
nivel: 3
grupo: "Construir com IA"
ordem: 3
resumo: "Guarde dados relacionais e vetores no mesmo banco com a extensão pgvector. Veja o tipo vector, índices HNSW e IVFFlat e a busca híbrida com full-text search, e por que um banco só costuma bastar."
tempo: "2 semanas"
ferramentas:
  - "PostgreSQL"
  - "pgvector"
  - "SQL"
prerequisitos:
  - "sql-essencial"
  - "embeddings"
relacionados:
  - "busca-hibrida-e-reranking"
  - "rag"
referencias:
  - titulo: "pgvector"
    url: "https://github.com/pgvector/pgvector"
    tipo: "Repositório"
    idioma: "en"
    gratuito: true
  - titulo: "PostgreSQL: busca de texto completo"
    url: "https://www.postgresql.org/docs/current/textsearch.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

PostgreSQL é um banco de dados relacional de código aberto. O pgvector é uma extensão (um módulo que se instala no banco) que adiciona o tipo `vector` e a busca por similaridade: dado o embedding (vetor numérico que representa o sentido de um texto) de uma pergunta, o banco devolve as linhas mais próximas.

## Por que importa para um AI Engineer

Num RAG, você guarda chunks (pedaços de texto) com vetores, mas também documento, página, permissões e data. Usar um banco vetorial separado significa dois sistemas para operar, duas cópias dos dados para manter sincronizadas e nenhum filtro relacional na mesma consulta. Com pgvector, tudo fica no Postgres: um backup, uma conexão, e `JOIN` e `WHERE` funcionam junto da busca. Para a escala dos projetos deste roadmap e de muitos produtos reais, um banco só basta; só considere outro quando medir um limite de volume ou de latência.

## Como funciona

Você cria uma coluna `vector(N)`, em que N é o número de dimensões do modelo de embeddings, e ordena pela distância até o vetor da pergunta:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE chunks (
  id bigserial PRIMARY KEY,
  manual text, pagina int, texto text,
  embedding vector(384)  -- 384 = dimensões do modelo usado
);
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);
SELECT manual, pagina, texto
FROM chunks
WHERE manual = 'Compressor X200'
ORDER BY embedding <=> $1  -- $1: vetor da pergunta
LIMIT 5;
```

O operador `<=>` é a distância de cosseno (existem também `<->`, distância euclidiana, e `<#>`, produto interno negativo). Use o que combina com o seu modelo de embeddings; muitos recomendam cosseno.

**Índices.** Sem índice, o banco compara a pergunta com todas as linhas: resultado exato, mas lento em tabelas grandes. Os índices abaixo são aproximados, trocam um pouco de precisão por velocidade:

- **HNSW** (grafo em camadas): boa relação entre velocidade e qualidade, funciona mesmo com tabela vazia, mas demora mais para construir e usa mais memória.
- **IVFFlat** (divide os vetores em grupos): constrói mais rápido e ocupa menos, mas deve ser criado depois de haver dados e exige ajustar o número de grupos.

Com um filtro como o `WHERE` acima, o índice aproximado pode devolver menos linhas do que o `LIMIT` pede. As versões recentes do pgvector trazem opções para isso; confira o README da sua versão.

```sql
CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
SET hnsw.ef_search = 100;   -- mais candidatos: mais recall, mais lento
SET ivfflat.probes = 10;    -- mais grupos visitados: idem
```

Os valores (`lists`, `ef_search`, `probes`) são ilustrativos; ajuste medindo o recall. Crie um dos dois índices por coluna, não os dois.

**Busca híbrida.** Vetores acham sentido, mas falham em códigos exatos como "E-21". O Postgres tem full-text search (busca por palavras): `to_tsvector('portuguese', texto)` com `plainto_tsquery`. Com um índice GIN e uma consulta:

```sql
CREATE INDEX ON chunks USING gin (to_tsvector('portuguese', texto));
SELECT id FROM chunks
WHERE to_tsvector('portuguese', texto) @@ plainto_tsquery('portuguese', 'erro E-21')
LIMIT 20;
```

Você roda as duas buscas e funde as listas (por exemplo, somando `1/(60 + posição)` de cada uma, a fusão por ranking recíproco). Ver busca-hibrida-e-reranking.

## Na prática

No P2: RAG de Manuais Técnicos, a tabela de chunks guarda manual, seção e página como colunas, para filtrar a busca e montar a citação. No P1: Assistente da Montadora e no PF: Agente Completo, o mesmo banco guarda também o histórico de conversas e os registros do projeto.

## Erros comuns

- **Dimensão errada.** A coluna `vector(384)` rejeita vetores de outro tamanho. Troque o modelo e você precisa recriar e reindexar.
- **Misturar modelos de embeddings** na mesma coluna: as distâncias deixam de ter sentido.
- **Criar IVFFlat com a tabela vazia.** O índice precisa dos dados para formar os grupos.
- **Não medir o efeito do índice.** Compare a busca exata com a aproximada nas suas perguntas de teste (recall) antes de ajustar parâmetros.

## Como estudar

1. Suba o Postgres com pgvector e crie a tabela do exemplo (meio dia).
2. Insira 50 chunks com embeddings gerados em Python e consulte (1 dia).
3. Compare a busca exata e a com HNSW em tempo e em resultados (1 dia).
4. Adicione full-text search em português e funda as duas listas (2 dias).
5. Leia o README do pgvector sobre índices e filtros (meio dia).

## Como mostrar

No portfólio, inclua no README o esquema da tabela, o índice escolhido e o motivo. Na entrevista, explique por que um banco só basta no seu caso, a diferença entre HNSW e IVFFlat e por que a busca híbrida achou o que a vetorial perdeu.
