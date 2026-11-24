---
titulo: "Filas e tarefas assíncronas"
nivel: 4
grupo: "Operar IA em produção"
ordem: 3
resumo: "Indexação, transcrição e evals pesados ficam fora do caminho da requisição, em filas. Veja idempotência e reprocessamento, para que uma tarefa repetida ou interrompida não gere duplicidade."
tempo: "1 a 2 semanas"
ferramentas:
  - "Amazon SQS"
  - "FastAPI"
  - "PostgreSQL"
prerequisitos:
  - "fastapi"
relacionados:
  - "rate-limit-e-fallback"
  - "fastapi"
referencias:
  - titulo: "Amazon SQS: o que é"
    url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Amazon SQS: filas de mensagens não entregues"
    url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "FastAPI: tarefas em segundo plano"
    url: "https://fastapi.tiangolo.com/tutorial/background-tasks/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Uma tarefa assíncrona roda fora do caminho da requisição: a API recebe o pedido, registra o trabalho numa fila e responde logo, e outro processo, o worker (trabalhador), executa depois. A fila é uma lista de mensagens que guarda o que falta fazer, mesmo que um processo caia.

## Por que importa para um AI Engineer

Muita tarefa de IA é lenta: indexar centenas de páginas (extrair texto, gerar embeddings, gravar), transcrever áudio, rodar um conjunto grande de evals. Se isso fica dentro da requisição, o usuário espera minutos, a conexão cai por tempo esgotado e um pico de uso derruba a API. Com fila, a API responde "recebido, número do trabalho", o worker processa no ritmo que o provedor e o banco aguentam, e você controla custo e limite (veja rate-limit-e-fallback).

## Como funciona

1. **Enfileirar.** A rota valida o pedido, grava uma mensagem com o identificador do trabalho e devolve o status "pendente".
2. **Processar.** O worker lê a mensagem, executa e registra o resultado.
3. **Consultar.** O cliente pergunta o status por uma rota de consulta, ou recebe um aviso ao final.

Há opções por tamanho: as tarefas em segundo plano do FastAPI (`BackgroundTasks`) são simples, mas morrem junto do processo e não se repetem sozinhas, então servem para coisas leves. Para trabalho que não pode se perder, use uma fila de verdade: o Amazon SQS (gerenciado pela AWS) ou outras, como Redis com uma biblioteca de tarefas. O formato muda conforme a ferramenta; siga a documentação.

**Entrega repetida.** Filas costumam garantir "pelo menos uma vez": a mesma mensagem pode chegar duas vezes, ou o worker pode cair no meio e a tarefa ser repetida. Por isso a tarefa precisa ser idempotente, ou seja, repetir tem o mesmo efeito que executar uma vez. Uma forma é registrar o identificador do trabalho no banco, na mesma transação:

```python
def processar(job_id: str, doc_id: str):
    with conexao.transaction():  # conexao: psycopg 3
        novo = conexao.execute(
            "INSERT INTO jobs_feitos (job_id) VALUES (%s) ON CONFLICT DO NOTHING",
            (job_id,)).rowcount
        if not novo:
            return  # repetição: ignora
        indexar(doc_id)  # grava com upsert, dentro da transação
```

Se `indexar` falhar, a transação desfaz o registro e a nova tentativa reprocessa. Se o trabalho incluir uma chamada externa que não entra na transação, torne-a idempotente também (por exemplo, com uma chave de idempotência).

**Reprocessamento e falhas.** Defina quantas vezes tentar e, depois disso, mande a mensagem para uma dead-letter queue (fila de mensagens não entregues), onde fica guardada para você inspecionar. Também permita reprocessar um trabalho manualmente, sem criar duplicatas, o que a idempotência garante.

## Na prática

No P2: RAG de Manuais Técnicos, o upload de um manual enfileira a indexação, em vez de bloquear a requisição. No PF: Agente Completo, a fila absorve a indexação e os evals pesados, e o worker respeita o limite do provedor. Se um manual é enviado duas vezes ou o worker reinicia no meio, o índice não pode ter chunks duplicados.

## Erros comuns

- **Processar dentro da requisição** algo que leva minutos.
- **Tarefa sem idempotência.** Uma repetição duplica chunks, e-mails ou cobranças.
- **Confiar em `BackgroundTasks` para o que não pode se perder.** Se o processo cai, a tarefa some.
- **Falha sem limite de tentativas nem dead-letter queue.** Uma mensagem com erro reaparece para sempre.
- **Sem status de trabalho.** O usuário não sabe se terminou, falhou ou está na fila.

## Como estudar

1. Leia a introdução do SQS e o conceito de dead-letter queue (2 horas).
2. Faça uma rota que enfileira e uma de consulta de status, com `BackgroundTasks` (1 dia).
3. Troque por uma fila real e um worker separado, rodando no compose (2 dias).
4. Torne a tarefa idempotente com o registro do identificador e teste enviando a mesma mensagem duas vezes (1 dia).
5. Provoque uma falha no meio e confira que o reprocessamento não duplica nada (1 dia).

## Como mostrar

No portfólio, o README do PF traz um diagrama com API, fila e worker, e explica como a idempotência evita duplicidade. Na entrevista, descreva o que acontece se o worker cair no meio de uma indexação e como você testou isso.
