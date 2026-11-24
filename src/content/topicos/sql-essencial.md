---
titulo: "SQL essencial"
nivel: 1
grupo: "Programação (sem IA)"
ordem: 5
resumo: "SELECT, WHERE, JOIN, GROUP BY, chaves e noção de índice, com Postgres. Quase toda vaga júnior de IA pede SQL, e os projetos de RAG deste roadmap guardam seus dados num banco relacional."
tempo: "2 a 3 semanas"
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
  - titulo: "Tutorial do PostgreSQL"
    url: "https://www.postgresql.org/docs/current/tutorial.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

SQL (Structured Query Language) é a linguagem para consultar e alterar dados em bancos relacionais, que guardam informação em tabelas: linhas (registros) e colunas (campos), como planilhas ligadas entre si. PostgreSQL, MySQL e SQLite são bancos relacionais; o SQL básico é quase igual em todos.

## Por que importa para um AI Engineer

Os dados de uma empresa vivem em bancos: clientes, pedidos, ordens de manutenção, logs das chamadas ao LLM. Para montar um sistema de IA você precisa buscar e juntar esses dados, e muitas vagas júnior pedem SQL justamente por isso.

Há também o ponto dos projetos: o P2: RAG de Manuais Técnicos guarda textos, metadados e vetores no PostgreSQL, e filtrar por documento ou por data é uma consulta SQL.

## Como funciona

Os comandos de leitura que você usa o tempo todo:

- `SELECT` escolhe colunas; `FROM` diz a tabela.
- `WHERE` filtra linhas; `ORDER BY` ordena; `LIMIT` corta.
- `GROUP BY` agrupa linhas para contar, somar ou tirar média (`COUNT`, `SUM`, `AVG`).
- `JOIN` combina tabelas pela chave que as liga.

Uma **chave primária** identifica cada linha de forma única (o `id`). Uma **chave estrangeira** é uma coluna que aponta para a chave primária de outra tabela: é assim que uma ordem de manutenção "sabe" de qual máquina é.

Um exemplo que roda sem instalar nada, pois o SQLite vem com o Python:

```python
import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE maquina (id INTEGER PRIMARY KEY, nome TEXT);
CREATE TABLE ordem (id INTEGER PRIMARY KEY, maquina_id INTEGER, status TEXT);
INSERT INTO maquina VALUES (1, 'Compressor X200'), (2, 'Torno T5');
INSERT INTO ordem VALUES (1, 1, 'aberta'), (2, 1, 'fechada'), (3, 2, 'aberta');
""")
print(con.execute("""
SELECT m.nome, COUNT(*) AS abertas
FROM ordem o JOIN maquina m ON m.id = o.maquina_id
WHERE o.status = 'aberta' GROUP BY m.nome ORDER BY abertas DESC
""").fetchall())
```

O resultado traz cada máquina com a quantidade de ordens abertas. Leia a consulta em voz alta: "das ordens abertas, junte com a máquina, agrupe por nome e conte".

Um **índice** é uma estrutura auxiliar, como o índice remissivo de um livro, que acelera buscas numa coluna. Sem ele, o banco lê a tabela inteira. Para ver como o banco executa uma consulta, use `EXPLAIN`.

## Na prática

No P4: Triagem de Ordens de Manutenção, as ordens e o resultado da triagem ficam em tabelas, e você consulta "quantas ordens críticas por máquina neste mês". No P2: RAG de Manuais Técnicos, a tabela de trechos tem uma coluna com o documento, e a busca filtra por ela. Ao chamar SQL a partir do Python, passe valores por parâmetro (`execute("... WHERE id = ?", (valor,))`) em vez de montar o texto com f-string, para evitar SQL injection (alguém inserir comandos no valor que você montou).

## Erros comuns

- **Esquecer o `WHERE` num `UPDATE` ou `DELETE`.** O comando vale para a tabela inteira. Teste antes com um `SELECT` e use transação (um bloco que você pode desfazer).
- **Montar SQL concatenando texto do usuário.** Abre a porta para SQL injection. Use parâmetros.
- **`SELECT *` em tudo.** Traz colunas desnecessárias e quebra quando a tabela muda. Liste as colunas.
- **Confundir `WHERE` e `HAVING`.** `WHERE` filtra linhas antes de agrupar; `HAVING` filtra os grupos.
- **Não criar índice onde se filtra muito.** A consulta funciona com dez linhas e trava com dez milhões.

## Como estudar

1. Faça o SQLBolt inteiro (3 a 4 dias).
2. Instale o PostgreSQL (ou use SQLite) e recrie as tabelas do exemplo com dados seus (1 dia).
3. Escreva 15 consultas com JOIN e GROUP BY sobre um dataset público (1 semana).
4. Crie um índice, rode `EXPLAIN` antes e depois e anote a diferença (1 dia).
5. Leia o tutorial oficial do PostgreSQL até o fim da parte de funcionalidades avançadas (3 dias).

## Como mostrar

No portfólio, inclua nos projetos o script de criação das tabelas e três consultas com resultado no README. Na entrevista, esteja pronto para escrever na hora um JOIN com GROUP BY e explicar chaves primária e estrangeira.
