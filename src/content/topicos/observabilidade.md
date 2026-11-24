---
titulo: "Observabilidade"
nivel: 4
grupo: "Operar IA em produção"
ordem: 1
resumo: "Rastreie cada passo de uma resposta: entrada, saída, tokens, custo e latência, com Langfuse ou OpenTelemetry. Assim um erro em produção vira um caso novo no golden set em vez de um palpite."
tempo: "1 a 2 semanas"
ferramentas:
  - "Langfuse"
  - "OpenTelemetry"
  - "Docker"
prerequisitos:
  - "evals"
relacionados:
  - "custo-e-latencia"
  - "lgpd-e-dados-pessoais"
referencias:
  - titulo: "Langfuse"
    url: "https://langfuse.com/docs"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Langfuse: visão geral de observabilidade"
    url: "https://langfuse.com/docs/observability/overview"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "OpenTelemetry: introdução à observabilidade"
    url: "https://opentelemetry.io/docs/concepts/observability-primer/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Observabilidade é a capacidade de entender, olhando os registros do sistema, o que aconteceu dentro dele. Para uma aplicação com LLM, isso significa guardar, para cada resposta, o caminho completo: a pergunta, os trechos recuperados, o prompt enviado, a resposta, as ferramentas chamadas, os tokens, o custo e o tempo de cada etapa. Esse registro se chama trace (rastro).

## Por que importa para um AI Engineer

Em produção, um usuário reclama: "a resposta estava errada". Sem rastro, você tenta adivinhar. Com ele, vê se o chunk certo foi recuperado, se o prompt estava certo, se a ferramenta falhou. O erro vira dado: você o copia para o golden set (o conjunto de casos de teste dos evals), corrige e confirma que não volta. É o ciclo que fecha a ligação entre produção e evals. A observabilidade também mostra onde estão o custo e a lentidão.

## Como funciona

Um trace é a árvore de uma requisição. Cada passo é um span (um trecho com início, fim e dados). Exemplo ilustrativo, com valores inventados:

```text
trace "O que significa E-21?"  usuário u42   total 2,4 s
├─ span recuperação   180 ms   5 chunks (manual X200)
├─ span llm           2,1 s    1.850 tokens de entrada, 120 de saída
└─ span resposta      citação [Compressor X200, p. 47]
```

O que registrar em cada span: entrada e saída, modelo e versão do prompt, tokens, custo calculado a partir da tabela de preços do provedor, latência e erros. Guarde também um identificador da sessão e da versão do código, para comparar antes e depois.

**Ferramentas.** O Langfuse é uma plataforma de observabilidade para LLM, de código aberto, que você pode rodar localmente (veja docker-local) ou usar na nuvem. Ele mostra os traces, o custo, e permite avaliar respostas. O OpenTelemetry é um padrão aberto de instrumentação, para qualquer tipo de aplicação, que envia os dados a várias ferramentas. Os SDKs mudam entre versões, então siga a documentação atual: em geral você marca a função com um decorador ou envolve a chamada ao modelo, e o SDK cria o span.

**Do erro ao golden set.** O fluxo de trabalho: filtrar traces ruins (nota baixa do usuário, erro, custo alto), abrir o rastro, achar a etapa que falhou, transformar o caso em teste e rodar os evals (veja testes-e-evals-no-projeto).

**Privacidade.** Os traces guardam as perguntas dos usuários, que podem conter dados pessoais. Mascare o que for sensível, defina por quanto tempo guarda e quem acessa (veja lgpd-e-dados-pessoais).

## Na prática

No PF: Agente Completo, cada chamada à API gera um trace com recuperação, chamadas de ferramenta e resposta, e é a base para provar que dá para diagnosticar uma resposta ruim. No P1: Assistente da Montadora e no P2: RAG de Manuais Técnicos, o Langfuse local, subido com o compose, já ajuda a ver o que o modelo recebeu. O custo por pergunta que você calcula aqui alimenta as decisões de custo-e-latencia.

## Erros comuns

- **Registrar só a resposta final.** Sem recuperação e ferramentas, você não acha a causa.
- **Guardar dados pessoais sem cuidado.** Traces são dados do usuário; trate como tal.
- **Não versionar o prompt.** Você não consegue comparar o antes e o depois.
- **Olhar só a média.** Latência e custo pesam nos casos extremos; veja percentis e os piores casos.
- **Coletar tudo e nunca olhar.** Defina uma rotina de revisão e alertas.

## Como estudar

1. Leia a introdução do OpenTelemetry sobre traces e spans (2 horas).
2. Suba o Langfuse localmente e envie um trace de teste (1 dia).
3. Instrumente a chamada ao LLM do seu projeto e veja tokens e latência (1 dia).
4. Adicione spans para recuperação e ferramentas (1 dia).
5. Pegue uma resposta ruim, ache a causa no rastro e inclua o caso no golden set (1 dia).

## Como mostrar

No portfólio, inclua no README do PF um print de um trace, com os spans, os tokens e a latência. Na entrevista, conte um caso de diagnóstico: a resposta ruim, o que o rastro mostrou, a correção e o caso novo no golden set.
