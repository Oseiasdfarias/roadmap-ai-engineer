---
titulo: "Fine-tuning"
nivel: 1
grupo: "Fundamentos de LLM (sem matemática)"
ordem: 5
resumo: "Ajustar um modelo muda comportamento e formato, não ensina fatos novos de forma confiável. Veja a ordem prompt, RAG e só então fine-tuning, o que é LoRA em uma frase, e quanto custa decidir errado."
tempo: "1 semana"
ferramentas:
  - "Hugging Face PEFT"
prerequisitos:
  - "prompt-engineering"
relacionados:
  - "rag"
  - "evolucao-dos-modelos"
referencias:
  - titulo: "LoRA: Low-Rank Adaptation of Large Language Models (Hu et al., 2021)"
    url: "https://arxiv.org/abs/2106.09685"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "PEFT: documentação da Hugging Face"
    url: "https://huggingface.co/docs/peft"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Karpathy: Intro to Large Language Models"
    url: "https://www.youtube.com/watch?v=zjkBMFhNj_g"
    tipo: "Vídeo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Fine-tuning (ajuste fino) é continuar o treinamento de um modelo já pronto com os seus exemplos, para mudar o jeito como ele responde. Em vez de escrever instruções no prompt toda vez, você "grava" o comportamento nos pesos do modelo, os números internos que ele aprendeu.

## Por que importa para um AI Engineer

Fine-tuning é a primeira ideia de muita gente ("vou treinar o modelo com meus documentos") e quase sempre a errada. Saber o que ele resolve, e o que não resolve, evita semanas de trabalho e custo. Também é uma pergunta clássica de entrevista.

## Como funciona

A ideia central: fine-tuning muda **comportamento e formato**, não ensina **fatos** de forma confiável. Treinar com um manual não faz o modelo "saber" o manual como um banco de dados; ele aprende o estilo e pode continuar inventando detalhes. Para conhecimento que muda ou precisa ser citado, use RAG.

A ordem prática de decisão:

1. **Prompt:** instruções claras, exemplos e formato. Barato, rápido de testar, e resolve a maioria dos casos.
2. **RAG:** se faltam informações que o modelo não tem (documentos internos, dados recentes), busque-as e entregue no prompt.
3. **Fine-tuning:** só se o prompt e o RAG, bem feitos e medidos, ainda não bastam, em geral por um destes motivos: manter um tom ou formato muito específico, ensinar uma tarefa estreita e repetitiva para um modelo menor e mais barato, ou reduzir o tamanho do prompt em volume muito alto.

Analogia: o prompt é dar ao funcionário um roteiro; o RAG é dar acesso à biblioteca da empresa; o fine-tuning é um treinamento que muda hábitos dele.

**LoRA em uma frase:** em vez de reescrever todos os pesos do modelo, treina-se um pequeno conjunto de pesos extras que se soma aos originais, o que reduz muito o custo e a memória exigidos. É a técnica por trás da maioria dos ajustes feitos por equipes pequenas, com bibliotecas como a PEFT.

O que um fine-tuning exige: centenas ou milhares de exemplos de boa qualidade (entrada e saída desejada), uma forma de medir o resultado (evals) antes e depois, tempo de treino (em GPU) e a manutenção a cada vez que o modelo-base mudar. Cada provedor tem regras próprias sobre quais modelos aceitam ajuste; consulte a documentação oficial dele em vez de assumir.

Um esboço de como os exemplos costumam ser preparados, em formato de mensagens (JSONL, um JSON por linha):

```python
import json

exemplos = [
    {"messages": [
        {"role": "user", "content": "Erro E-21 no compressor."},
        {"role": "assistant", "content": "Causa: sensor desconectado. Ação: reconectar o cabo."},
    ]},
]
with open("treino.jsonl", "w", encoding="utf-8") as f:
    for ex in exemplos:
        f.write(json.dumps(ex, ensure_ascii=False) + "\n")
```

## Na prática

Neste roadmap, nenhum projeto exige fine-tuning, e isso é proposital: no P2: RAG de Manuais Técnicos o conhecimento vem da busca, e no P4: Triagem de Ordens de Manutenção um bom prompt com exemplos e saída estruturada costuma bastar. Se você tentar fine-tuning num deles, trate como experimento: compare com a versão de prompt, em números.

## Erros comuns

- **Querer ensinar fatos.** Para fatos, use RAG; o ajuste não substitui a fonte.
- **Pular o prompt e o RAG.** Muita gente descobre depois que um prompt melhor já resolvia.
- **Poucos exemplos ou exemplos ruins.** O modelo aprende também os erros e inconsistências do seu conjunto de treino.
- **Não medir antes e depois.** Sem eval, você não sabe se melhorou.
- **Ignorar a manutenção.** Quando o modelo-base é atualizado, o ajuste precisa ser refeito.

## Como estudar

1. Veja no vídeo de Karpathy a parte sobre como o modelo é treinado e ajustado (1 hora).
2. Leia o resumo e a introdução do artigo do LoRA, pulando as fórmulas (1 hora).
3. Leia o guia de início rápido da PEFT (2 horas).
4. Escreva em um parágrafo, para um caso seu, por que prompt ou RAG bastam ou não (1 hora).
5. Prepare 50 exemplos no formato acima para uma tarefa estreita, mesmo sem treinar (1 dia).

## Como mostrar

No portfólio, registre uma comparação honesta entre prompt, RAG e, se fez, um ajuste, com a mesma métrica. Na entrevista, responda "quando você usaria fine-tuning?" com a ordem prompt, RAG, ajuste, e com um critério mensurável de por que os dois primeiros não bastaram.
