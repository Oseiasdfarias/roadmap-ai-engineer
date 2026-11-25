---
titulo: "Postgres and pgvector"
nivel: 3
grupo: "Building with AI"
ordem: 3
resumo: "Store relational data and vectors in the same database with the pgvector extension. See the vector type, HNSW and IVFFlat indexes and hybrid search with full-text search, and why one database is usually enough."
tempo: "2 weeks"
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
  - titulo: "PostgreSQL: full text search"
    url: "https://www.postgresql.org/docs/current/textsearch.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

PostgreSQL is an open source relational database. pgvector is an extension (a module you install in the database) that adds the `vector` type and similarity search: given the embedding (a numeric vector that represents the meaning of a text) of a question, the database returns the closest rows.

## Why it matters for an AI Engineer

In a RAG, you store chunks (pieces of text) with vectors, but also the document, page, permissions and date. Using a separate vector database means two systems to operate, two copies of the data to keep in sync and no relational filters in the same query. With pgvector, everything stays in Postgres: one backup, one connection, and `JOIN` and `WHERE` work together with the search. For the scale of this roadmap's projects and of many real products, one database is enough; only consider another one when you measure a volume or latency limit.

## How it works

You create a `vector(N)` column, where N is the number of dimensions of the embedding model, and order by the distance to the question's vector:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE chunks (
  id bigserial PRIMARY KEY,
  manual text, page int, content text,
  embedding vector(384)  -- 384 = dimensions of the model used
);
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);
SELECT manual, page, content
FROM chunks
WHERE manual = 'Compressor X200'
ORDER BY embedding <=> $1  -- $1: the question's vector
LIMIT 5;
```

The `<=>` operator is cosine distance (there are also `<->`, Euclidean distance, and `<#>`, negative inner product). Use the one that matches your embedding model; many recommend cosine.

**Indexes.** Without an index, the database compares the question with every row: an exact result, but slow on large tables. The indexes below are approximate, trading a little precision for speed:

- **HNSW** (a layered graph): a good balance between speed and quality, works even with an empty table, but takes longer to build and uses more memory.
- **IVFFlat** (splits vectors into groups): builds faster and takes less space, but should be created after there is data and requires tuning the number of groups.

With a filter like the `WHERE` above, the approximate index may return fewer rows than the `LIMIT` asks for. Recent versions of pgvector have options for this; check the README for your version.

```sql
CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
SET hnsw.ef_search = 100;   -- more candidates: more recall, slower
SET ivfflat.probes = 10;    -- more groups visited: same trade-off
```

The values (`lists`, `ef_search`, `probes`) are illustrative; tune them by measuring recall. Create one of the two indexes per column, not both.

**Hybrid search.** Vectors find meaning, but fail on exact codes like "E-21". Postgres has full-text search (search by words): `to_tsvector('english', content)` with `plainto_tsquery`. Use the text search configuration of your documents' language. With a GIN index and a query:

```sql
CREATE INDEX ON chunks USING gin (to_tsvector('english', content));
SELECT id FROM chunks
WHERE to_tsvector('english', content) @@ plainto_tsquery('english', 'error E-21')
LIMIT 20;
```

You run both searches and fuse the lists (for example, adding `1/(60 + position)` from each, reciprocal rank fusion). See the hybrid search and reranking topic.

## In practice

In P2: Technical Manuals RAG, the chunks table stores manual, section and page as columns, to filter the search and build the citation. In P1: Automaker Assistant and PF: Complete Agent, the same database also stores the conversation history and the project's records.

## Common mistakes

- **The wrong dimension.** A `vector(384)` column rejects vectors of another size. Switch models and you need to recreate and reindex.
- **Mixing embedding models** in the same column: the distances stop making sense.
- **Creating IVFFlat on an empty table.** The index needs data to form the groups.
- **Not measuring the index's effect.** Compare exact and approximate search on your test questions (recall) before tuning parameters.

## How to study

1. Start Postgres with pgvector and create the example table (half a day).
2. Insert 50 chunks with embeddings generated in Python and query them (1 day).
3. Compare exact search and HNSW search in time and in results (1 day).
4. Add full-text search for your documents' language and fuse the two lists (2 days).
5. Read the pgvector README on indexes and filters (half a day).

## How to show it

In your portfolio, include in the README the table schema, the index you chose and why. In the interview, explain why one database is enough in your case, the difference between HNSW and IVFFlat and why hybrid search found what vector search missed.
