---
titulo: "Engenharia de contexto"
nivel: 2
grupo: "Como funciona"
ordem: 7
resumo: "Decidir o que entra em cada chamada: instruções, histórico resumido, memória e resultados de ferramentas, na ordem certa. Contexto mal montado causa mais erros do que um modelo fraco."
tempo: "1 a 2 semanas"
ferramentas:
  - "Python"
prerequisitos:
  - "tokens-e-janela-de-contexto"
relacionados:
  - "rag"
  - "custo-e-latencia"
  - "tool-use"
referencias:
  - titulo: "Effective context engineering for AI agents"
    url: "https://www.anthropic.com/research/effective-context-engineering-for-ai-agents"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Lost in the Middle: How Language Models Use Long Contexts (Liu et al., 2023)"
    url: "https://arxiv.org/abs/2307.03172"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Context windows: documentação da API do Claude"
    url: "https://platform.claude.com/docs/en/build-with-claude/context-windows"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Engenharia de contexto é decidir, a cada chamada ao modelo, o que entra na janela de contexto (o texto total que o modelo lê de uma vez): instruções, histórico, memória, documentos recuperados e resultados de ferramentas. É a evolução do prompt engineering: em vez de escrever uma boa instrução, você monta o conjunto certo de informação.

## Por que importa para um AI Engineer

O modelo só sabe o que está no contexto. Informação faltando gera invenção; informação demais gera ruído, custo e lentidão. O artigo da Anthropic sobre o tema trata o contexto como um recurso limitado: mais tokens (as unidades de texto) não garantem melhor resposta, e o modelo pode usar pior o que está no meio de um texto longo, como mostra o estudo "Lost in the Middle". Em agentes que rodam por muitas voltas, o contexto cresce a cada ferramenta chamada, e controlá-lo é o que mantém o agente funcionando.

## Como funciona

Pense em cinco decisões:

1. **O que entra.** Só o necessário para esta chamada: as instruções do papel, as últimas mensagens e os trechos que a pergunta pede (RAG). Cada item extra precisa se justificar.
2. **Histórico resumido.** Conversas longas não cabem. Mantenha as últimas mensagens na íntegra e transforme o resto num resumo, o que se chama compactação (compaction).
3. **Memória fora da janela.** Fatos que duram, como preferências do usuário ou decisões, ficam num arquivo ou banco e voltam ao contexto só quando relevantes.
4. **Resultados de ferramentas enxutos.** Devolva o campo que importa, não a tabela inteira. Resultados antigos e já usados podem ser removidos.
5. **A ordem.** Instruções estáveis no início (isso também favorece o prompt caching, que reaproveita um começo de prompt igual), material longo depois e a pergunta no fim. Teste a ordem no seu caso; o efeito varia.

```python
def montar_contexto(sistema, resumo, recentes, trechos, pergunta):
    partes = [sistema]                       # estável: fica no início
    if resumo:
        partes.append("Resumo da conversa até aqui:\n" + resumo)
    partes.append("Trechos recuperados:\n" + "\n".join(trechos))
    partes += recentes[-6:]                  # só as últimas mensagens
    partes.append("Pergunta: " + pergunta)   # a pergunta por último
    return "\n\n".join(partes)

print(montar_contexto("Você ajuda técnicos.", "", ["Oi"], ["[X200, p. 47] Erro E-21..."], "O que é E-21?"))
```

Isso é uma função de montagem simples; num sistema real você também conta tokens para respeitar um orçamento por parte. Outra técnica é dividir o trabalho em subagentes, cada um com contexto próprio e limpo, que devolvem só um resumo ao agente principal.

## Na prática

No P1: Assistente da Montadora, o histórico da conversa cresce a cada turno; resumir as mensagens antigas e manter as recentes evita custo e perda de foco. No P2: RAG de Manuais Técnicos, a decisão é quantos trechos entram no prompt. No PF: Agente Completo, os resultados das ferramentas MCP entram no contexto a cada volta, então você precisa de uma regra para descartá-los ou resumi-los.

## Erros comuns

- **Mandar tudo "por garantia".** Mais contexto aumenta custo e latência e pode piorar a resposta.
- **Reenviar o histórico inteiro para sempre.** Conversas longas estouram a janela ou diluem a atenção.
- **Resumo que perde o essencial.** Compactar apaga detalhes; teste com perguntas sobre o que foi resumido.
- **Instruções no meio de um texto longo.** Ponha o que é crítico no início ou no fim.
- **Misturar instrução e dado não confiável.** Documentos recuperados são dados, não ordens.

## Como estudar

1. Leia o artigo de engenharia de contexto da Anthropic (2 horas).
2. Leia a página de janelas de contexto da API que você usa (1 hora).
3. Rode a função acima com um histórico de 30 mensagens e faça o resumo do trecho antigo (1 dia).
4. Meça o número de tokens antes e depois da compactação e verifique se a resposta continua correta (1 dia).
5. Leia o Lost in the Middle e teste a posição de uma informação-chave em 10 perguntas (1 dia).

## Como mostrar

No README, mostre um diagrama do que entra em cada chamada e uma tabela com tokens por componente antes e depois da compactação, ao lado da qualidade medida. Na entrevista, explique como você decide o que sai do contexto e como verifica que o resumo não perdeu nada importante.
