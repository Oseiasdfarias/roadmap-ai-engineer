---
titulo: "Modelos de raciocínio"
nivel: 5
grupo: "Como os modelos funcionam por dentro"
ordem: 4
resumo: "Modelos que geram um raciocínio interno antes de responder e trocam mais tempo e tokens por mais acerto em problemas difíceis. Quando usar, como controlar o orçamento de raciocínio e como medir o ganho."
tempo: "1 a 2 semanas"
ferramentas:
  - "Python"
prerequisitos:
  - "transformer-por-dentro"
  - "evals"
relacionados:
  - "rl-com-recompensa-verificavel"
  - "custo-e-latencia"
referencias:
  - titulo: "Reasoning models: guia da OpenAI"
    url: "https://platform.openai.com/docs/guides/reasoning"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Extended thinking: documentação da API do Claude"
    url: "https://platform.claude.com/docs/en/build-with-claude/extended-thinking"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning (2025)"
    url: "https://arxiv.org/abs/2501.12948"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Let's Verify Step by Step (Lightman et al., 2023)"
    url: "https://arxiv.org/abs/2305.20050"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## O que é

Um modelo de raciocínio gera uma sequência de tokens de pensamento antes da resposta final: ele decompõe o problema, testa caminhos e corrige erros. Essa ideia se chama test-time compute: gastar mais cálculo na hora de responder, em vez de só aumentar o modelo. Os provedores expõem isso como um parâmetro de esforço ou um orçamento de tokens de raciocínio.

## Por que importa para um AI Engineer

Raciocínio melhora bastante tarefas com resposta verificável e vários passos: matemática, código, planejamento, análise de documentos longos com regras. Mas custa: os tokens de pensamento são cobrados, aumentam a latência e muitas vezes não aparecem inteiros para você. Em tarefas simples, como classificar ou extrair um campo, quase não ajudam. Escolher onde ligar o raciocínio, e com quanto orçamento, é uma decisão de custo e qualidade que você precisa medir, não adivinhar.

## Como funciona

Esses modelos são treinados com aprendizado por reforço em problemas cuja resposta pode ser conferida, como testes de código ou contas com resultado conhecido. O modelo aprende que pensar mais antes de responder aumenta a recompensa. O artigo do DeepSeek-R1 descreve esse processo de forma aberta, incluindo comportamentos como revisar o próprio caminho.

Na API, você controla o esforço. O jeito certo de decidir é um experimento: mesmo conjunto de testes, vários níveis de esforço, e uma tabela de acerto, tokens e tempo.

```python
import time

def experimento(chamar_modelo, casos, esforcos=("baixo", "medio", "alto")):
    for esforco in esforcos:
        inicio, acertos, tokens = time.time(), 0, 0
        for pergunta, esperado in casos:
            resposta, usados = chamar_modelo(pergunta, esforco)
            acertos += esperado in resposta
            tokens += usados
        print(esforco, acertos / len(casos), tokens, round(time.time() - inicio, 1))

falso = lambda p, e: ("42", {"baixo": 50, "medio": 200, "alto": 800}[e])
experimento(falso, [("6 x 7?", "42")])
```

Troque a função falsa pela chamada real da API que você usa, passando o parâmetro de esforço ou de orçamento de pensamento.

## Na prática

Num sistema agêntico, o raciocínio costuma valer no planejamento (o orquestrador decidindo como dividir uma tarefa) e nas etapas difíceis, enquanto as etapas mecânicas usam um modelo rápido sem raciocínio. No P5: Pesquisador Multiagente, o orquestrador planeja com raciocínio e os subagentes de busca rodam sem ele; a tabela do experimento justifica essa escolha.

## Erros comuns

- **Ligar raciocínio alto em tudo.** O custo e a latência sobem sem ganho em tarefas simples.
- **Pedir "pense passo a passo" num modelo que já raciocina.** Pode atrapalhar; siga o guia do provedor.
- **Confiar no texto do raciocínio como explicação fiel.** Ele ajuda a depurar, mas não é uma prova de como o modelo decidiu.
- **Esquecer os tokens de pensamento no orçamento.** Eles contam no custo e no limite de saída.

## Como estudar

1. Leia os guias de raciocínio da OpenAI e de extended thinking do Claude (2 horas).
2. Monte 30 casos com resposta verificável do seu domínio (1 dia).
3. Rode o experimento com três níveis de esforço e monte a tabela (2 dias).
4. Leia a introdução e os resultados do artigo do DeepSeek-R1 (1 dia).
5. Leia o Let's Verify Step by Step para entender a avaliação por etapa, que reaparece em avaliação de agentes (1 dia).

## Como mostrar

Mostre a tabela de acerto, custo e latência por nível de esforço e a regra que você tirou dela ("raciocínio só no planejamento"). Na entrevista, explique o que é test-time compute e por que ele não substitui um bom contexto.
