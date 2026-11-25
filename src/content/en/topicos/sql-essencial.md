---
titulo: "Essential SQL"
nivel: 1
grupo: "Programming (without AI)"
ordem: 5
resumo: "SELECT, WHERE, JOIN, GROUP BY, keys and the idea of an index, with Postgres. Almost every junior AI role asks for SQL, and the RAG projects in this roadmap store their data in a relational database."
tempo: "2 to 3 weeks"
ferramentas:
  - "PostgreSQL"
  - "SQLite"
prerequisitos:
  - "python-fundamentos"
relacionados:
  - "postgres-e-pgvector"
referencias:
  - titulo: "SQLBolt"
    url: "https://sqlbolt.com/"
    tipo: "Curso"
    idioma: "en"
    gratuito: true
  - titulo: "PostgreSQL Tutorial"
    url: "https://www.postgresql.org/docs/current/tutorial.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

SQL (Structured Query Language) is the language for querying and changing data in relational databases, which store information in tables: rows (records) and columns (fields), like spreadsheets linked to each other. PostgreSQL, MySQL and SQLite are relational databases; basic SQL is almost the same in all of them.

## Why it matters for an AI Engineer

A company's data lives in databases: customers, orders, maintenance work orders, logs of LLM calls. To build an AI system you need to fetch and combine that data, and many junior roles ask for SQL for exactly that reason.

There is also the project angle: P2: Technical Manuals RAG stores texts, metadata and vectors in PostgreSQL, and filtering by document or by date is an SQL query.

## How it works

The read commands you use all the time:

- `SELECT` chooses columns; `FROM` says the table.
- `WHERE` filters rows; `ORDER BY` sorts; `LIMIT` cuts.
- `GROUP BY` groups rows to count, sum or average (`COUNT`, `SUM`, `AVG`).
- `JOIN` combines tables through the key that links them.

A **primary key** uniquely identifies each row (the `id`). A **foreign key** is a column that points to another table's primary key: that is how a maintenance work order "knows" which machine it belongs to.

An example that runs without installing anything, since SQLite comes with Python:

```python
import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE machine (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE work_order (id INTEGER PRIMARY KEY, machine_id INTEGER, status TEXT);
INSERT INTO machine VALUES (1, 'Compressor X200'), (2, 'Lathe T5');
INSERT INTO work_order VALUES (1, 1, 'open'), (2, 1, 'closed'), (3, 2, 'open');
""")
print(con.execute("""
SELECT m.name, COUNT(*) AS open_orders
FROM work_order o JOIN machine m ON m.id = o.machine_id
WHERE o.status = 'open' GROUP BY m.name ORDER BY open_orders DESC
""").fetchall())
```

The result lists each machine with its number of open orders. Read the query out loud: "of the open orders, join with the machine, group by name and count".

An **index** is an auxiliary structure, like the index at the back of a book, that speeds up searches on a column. Without it, the database reads the whole table. To see how the database runs a query, use `EXPLAIN`.

## In practice

In P4: Maintenance Work Order Triage, the orders and the triage result live in tables, and you query "how many critical orders per machine this month". In P2: Technical Manuals RAG, the passages table has a column with the document, and the search filters by it. When calling SQL from Python, pass values as parameters (`execute("... WHERE id = ?", (value,))`) instead of building the text with an f-string, to avoid SQL injection (someone inserting commands into the value you built).

## Common mistakes

- **Forgetting the `WHERE` in an `UPDATE` or `DELETE`.** The command applies to the whole table. Test first with a `SELECT` and use a transaction (a block you can undo).
- **Building SQL by concatenating user text.** It opens the door to SQL injection. Use parameters.
- **`SELECT *` everywhere.** It brings unnecessary columns and breaks when the table changes. List the columns.
- **Confusing `WHERE` and `HAVING`.** `WHERE` filters rows before grouping; `HAVING` filters the groups.
- **Not creating an index where you filter a lot.** The query works with ten rows and stalls with ten million.

## How to study

1. Do all of SQLBolt (3 to 4 days).
2. Install PostgreSQL (or use SQLite) and recreate the example tables with your own data (1 day).
3. Write 15 queries with JOIN and GROUP BY over a public dataset (1 week).
4. Create an index, run `EXPLAIN` before and after and note the difference (1 day).
5. Read the official PostgreSQL tutorial through the advanced features part (3 days).

## How to show it

In your portfolio, include the table creation script and three queries with results in the projects' READMEs. In the interview, be ready to write a JOIN with GROUP BY on the spot and explain primary and foreign keys.
