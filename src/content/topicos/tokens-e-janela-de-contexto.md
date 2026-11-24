---
titulo: "Tokens e janela de contexto"
nivel: 1
grupo: "Fundamentos de LLM (sem matemática)"
ordem: 2
resumo: "Preço, limite e corte são medidos em tokens. Veja como o texto vira tokens, por que o português costuma custar mais que o inglês e por que a qualidade cai antes de a janela de contexto acabar."
tempo: "1 semana"
ferramentas:
  - "tiktoken"
  - "API de contagem de tokens"
prerequisitos:
  - "evolucao-dos-modelos"
relacionados:
  - "custo-e-latencia"
  - "engenharia-de-contexto"
referencias:
  - titulo: "Contagem de tokens"
    url: "https://platform.claude.com/docs/en/build-with-claude/token-counting"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Janelas de contexto"
    url: "https://platform.claude.com/docs/en/build-with-claude/context-windows"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Lost in the Middle: How Language Models Use Long Contexts (Liu et al., 2023)"
    url: "https://arxiv.org/abs/2307.03172"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Token é o pedaço de texto que o modelo processa: pode ser uma palavra curta, parte de uma palavra, um sinal de pontuação ou um espaço. A janela de contexto é o limite de tokens que o modelo consegue considerar numa única chamada, somando o que você envia e o que ele responde.

## Por que importa para um AI Engineer

Tudo em LLM é medido em tokens. O provedor cobra por token de entrada e de saída. O limite da janela decide quanto texto cabe no prompt. E a velocidade da resposta cresce com o número de tokens gerados. Quem não pensa em tokens leva dois sustos: a conta no fim do mês e o erro de "contexto excedido" no meio de um teste.

## Como funciona

O texto passa por um **tokenizador**, que o quebra em pedaços de uma lista fixa, o vocabulário do modelo. Palavras comuns viram um token só; palavras raras ou longas viram vários.

Como tokenizadores foram desenhados com muito texto em inglês, o inglês costuma render mais caracteres por token. O português tem acentos, conjugações longas e palavras compostas, e tende a gastar mais tokens para dizer o mesmo. No exemplo abaixo, a frase em inglês dá 5 tokens e a equivalente em português dá 8 (resultado deste tokenizador; outros modelos dão números diferentes). O código e os números também gastam mais tokens do que parece.

Você pode ver isso rodando um tokenizador. O exemplo usa a biblioteca `tiktoken` (`pip install tiktoken`), que baixa o vocabulário na primeira execução:

```python
import tiktoken

enc = tiktoken.get_encoding("cl100k_base")
for frase in ["Replace the oil filter.", "Troque o filtro de óleo."]:
    tokens = enc.encode(frase)
    print(len(tokens), [enc.decode([t]) for t in tokens])
```

Cada modelo tem o seu tokenizador, então o número exato varia. Para o valor oficial, use a ferramenta de contagem de tokens do provedor, que a documentação indica.

Sobre a **janela de contexto**, pense numa mesa de trabalho: só o que cabe na mesa você consegue olhar ao mesmo tempo. Nela entram o prompt do sistema, o histórico da conversa, os documentos que você anexa e a resposta. Há também um **limite de saída**, menor que a janela, para o tamanho da resposta.

Janela grande não quer dizer atenção uniforme. Pesquisas como "Lost in the Middle" mostram que a informação no meio de um texto longo é usada pior do que a do começo e do fim, e a qualidade pode cair antes de a janela encher. Os tamanhos de janela mudam de modelo para modelo e de mês para mês, então consulte a documentação do provedor em vez de decorar um número.

## Na prática

No P1: Assistente da Montadora, o histórico da conversa cresce a cada mensagem, e você decide quando resumir ou cortar. No P2: RAG de Manuais Técnicos, o número de trechos recuperados (os top-k) é limitado pelo orçamento de tokens. Antes de enviar, estime o tamanho; depois, registre os tokens de entrada e saída que a API devolve em cada resposta, para calcular o custo por requisição.

## Erros comuns

- **Contar caracteres ou palavras como se fossem tokens.** A relação varia por idioma e por modelo.
- **Enviar o documento inteiro "porque cabe".** Cabe, mas custa mais, demora mais e pode piorar a resposta.
- **Esquecer a saída.** Se você pede uma resposta longa e o limite de saída é curto, o texto é cortado no meio.
- **Ignorar o histórico.** Numa conversa longa, você paga de novo por todas as mensagens antigas a cada chamada.
- **Citar preço ou tamanho de janela de cabeça.** Valores mudam; consulte a página oficial do provedor.

## Como estudar

1. Rode o exemplo com dez frases suas em português e inglês e compare (2 horas).
2. Leia a página de contagem de tokens da documentação e conte um prompt real (2 horas).
3. Leia a página de janelas de contexto (1 hora).
4. Leia o resumo e as figuras de "Lost in the Middle" (1 hora).
5. Escreva uma função que corta o histórico para caber num limite de tokens e teste com uma conversa longa (1 dia).

## Como mostrar

No portfólio, mostre no README o custo médio por requisição do seu projeto, em tokens e em reais, com a conta explicada. Na entrevista, explique por que o português custa mais e como você reduziria tokens (resumo do histórico, menos trechos, prompt mais enxuto).
