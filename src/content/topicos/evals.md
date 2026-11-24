---
titulo: "Evals"
nivel: 2
grupo: "Qualidade e proteção"
ordem: 1
resumo: "Responda \"melhorou?\" com número: monte um golden set, analise os erros e meça a recuperação com recall@k e MRR. Veja LLM-as-judge, rubricas objetivas e como rodar evals a cada mudança no CI."
tempo: "2 a 3 semanas"
ferramentas:
  - "Python"
  - "Promptfoo"
prerequisitos:
  - "prompt-engineering"
relacionados:
  - "rag"
  - "testes-e-evals-no-projeto"
  - "observabilidade"
referencias:
  - titulo: "Your AI product needs evals"
    url: "https://hamel.dev/blog/posts/evals/"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Creating a LLM-as-a-Judge that drives business results"
    url: "https://hamel.dev/blog/posts/llm-judge/"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena (Zheng et al., 2023)"
    url: "https://arxiv.org/abs/2306.05685"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Define success criteria and build evaluations: documentação da API do Claude"
    url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Evals (avaliações) são testes automáticos da qualidade de um sistema com LLM (modelo de linguagem). Em vez de olhar algumas respostas e achar que melhorou, você roda o sistema numa lista fixa de casos e calcula métricas. A saída é um número que você compara antes e depois de cada mudança.

## Por que importa para um AI Engineer

Prompt, modelo, chunking e ferramentas mudam o tempo todo. Sem eval, cada mudança é uma aposta: um ajuste conserta um caso e quebra três que você não viu. Com eval, você responde "melhorou?" com dados, e trava o que piora.

## Como funciona

**Golden set.** Uma lista fixa de casos reais com a resposta (ou a fonte) esperada. Comece com 30 a 50, tirados de perguntas verdadeiras, e inclua cada erro que já aconteceu. Ele cresce com o tempo.

**Análise de erros.** Antes de escolher métricas, leia as falhas e classifique-as (recuperou o trecho errado, ignorou a instrução, inventou a fonte). As categorias mais frequentes dizem onde melhorar e quais evals escrever.

**Métricas de recuperação.** Para RAG (busca de trechos para o prompt), meça a busca separada da geração. O recall@k é a fração de perguntas em que o trecho certo está entre os k primeiros. O MRR (mean reciprocal rank) é a média de `1 / posição` do trecho certo, o que premia colocá-lo no topo.

```python
def recall_at_k(casos, k=5):
    return sum(c["certo"] in c["recuperados"][:k] for c in casos) / len(casos)

def mrr(casos):
    total = 0
    for c in casos:
        if c["certo"] in c["recuperados"]:
            total += 1 / (c["recuperados"].index(c["certo"]) + 1)
    return total / len(casos)

casos = [{"certo": "c1", "recuperados": ["c1", "c4"]},   # dados ilustrativos
         {"certo": "c2", "recuperados": ["c9", "c2"]},
         {"certo": "c3", "recuperados": ["c5", "c6"]}]
print(recall_at_k(casos, 2), mrr(casos))   # 0.666... 0.5
```

**Rubricas.** Quebre "a resposta está boa?" em critérios objetivos de sim ou não: cita a fonte? responde o que foi perguntado? não inventa dado? Critérios binários são mais fáceis de pontuar do que notas de 1 a 10.

**LLM-as-judge.** Para critérios que o código não checa, um segundo modelo avalia a resposta com a rubrica. Ele erra, então calibre: um humano rotula 30 a 50 respostas, você compara o veredito do juiz com o humano (percentual de concordância) e ajusta a rubrica até concordar o bastante. Juízes têm vieses conhecidos, como preferir respostas longas, e o artigo de Zheng et al. os descreve.

**Evals no CI.** O CI (integração contínua) roda a cada mudança. Rode o golden set e bloqueie a mudança se a métrica cair além de uma tolerância. Como o LLM varia, use tolerância e, se preciso, repita as execuções.

## Na prática

No P2: RAG de Manuais Técnicos, você mede recall@5 e MRR de cada estratégia de busca. No P4: Triagem de Ordens de Manutenção, os evals comparam modelos pequenos e grandes em custo e qualidade. No PF: Agente Completo, os evals rodam no CI a cada mudança. Ferramentas como o Promptfoo ajudam a organizar os casos; veja também testes-e-evals-no-projeto.

## Erros comuns

- **Eval só com casos fáceis.** O golden set precisa de casos difíceis e perguntas fora da base, em que a resposta certa é "não sei".
- **Mudar o golden set a cada teste.** Compare sempre no mesmo conjunto.
- **Juiz sem calibração.** Um LLM-as-judge não conferido contra humanos é só mais uma opinião.
- **Medir só a resposta final.** Se a recuperação falha, a geração não tem como acertar.
- **Eval pesado demais para rodar.** Se demora, ninguém roda; separe um subconjunto rápido.

## Como estudar

1. Leia "Your AI product needs evals" (2 horas).
2. Escreva 30 casos do seu projeto, com a fonte esperada (1 dia).
3. Implemente recall@k e MRR e calcule para a sua busca (1 dia).
4. Leia as 20 respostas piores e classifique os erros (meio dia).
5. Crie um juiz com rubrica, rotule 30 respostas à mão e compare (2 dias).
6. Rode o golden set num fluxo de CI simples (1 dia).

## Como mostrar

No README, traga uma tabela com a métrica por versão, a lista das categorias de erro e o resultado da calibração do juiz. Na entrevista, conte uma mudança que parecia melhor e o eval mostrou que piorou.
