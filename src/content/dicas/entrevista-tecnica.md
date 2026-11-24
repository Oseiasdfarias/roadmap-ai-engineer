---
titulo: "Entrevista técnica"
fase: 3
grupo: "Desenvolvedor júnior"
ordem: 1
resumo: "Como se preparar para live coding em Python, explicar seus projetos por dentro, responder perguntas de IA e pensar em voz alta. Justificar decisões vale mais do que acertar de primeira."
relacionados:
  - "entrevista-comportamental"
  - "teste-pratico"
  - "design-de-sistemas-com-llm"
referencias:
  - titulo: "Tech Interview Handbook: Preparação"
    url: "https://www.techinterviewhandbook.org/coding-interview-prep/"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Documentação do Python em português"
    url: "https://docs.python.org/pt-br/3/tutorial/"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

A entrevista técnica é a conversa em que a equipe confere se você sabe fazer o trabalho. Em vagas júnior, ela costuma combinar três partes: um exercício de programação ao vivo (live coding, em geral em Python), perguntas sobre os seus projetos e, em vagas ligadas a IA, perguntas sobre como LLMs funcionam. O formato varia por empresa, então pergunte à pessoa de recrutamento o que esperar.

## Por que importa

Quem entrevista quer ver como você pensa, não só o código final. Alguém que explica o raciocínio, testa o resultado e pede esclarecimento passa mais confiança do que alguém que digita em silêncio e acerta. Também é onde aparece a diferença entre quem construiu um projeto e quem apenas copiou um tutorial: as perguntas vão atrás das suas decisões.

Preparar-se reduz o nervosismo, mas não garante aprovação.

## Passo a passo

1. **Treine Python sem ajuda de IA.** Resolva problemas curtos com listas, dicionários, strings e funções, de preferência em um editor simples, com tempo marcado.
2. **Pense em voz alta.** Diga o que entendeu do enunciado, dê um exemplo simples, descreva a ideia antes de escrever e teste com um caso pequeno no fim.
3. **Peça esclarecimento.** Pergunte sobre entradas vazias, tamanhos e formato da saída antes de codar.
4. **Prepare cada projeto de portfólio por dentro.** Para cada um, escreva em meia página o problema, a arquitetura, três decisões e por que escolheu cada uma, um erro que você corrigiu e o que mudaria.
5. **Estude as perguntas de IA mais comuns**: o que é um embedding, como funciona RAG, por que o modelo alucina, quando usar workflow em vez de agente, como você mediu a qualidade. Use as páginas de tópicos do roadmap como roteiro.
6. **Faça simulações com outra pessoa**, uma vez por semana, e peça feedback sobre clareza.
7. **Tenha um plano para travar.** Se não souber, diga o que sabe, o que tentaria e como descobriria.

## Exemplo

Pergunta: "Por que você usou busca híbrida no seu projeto?"

Resposta, antes:

> Porque vi num tutorial que funciona melhor.

Depois (números ilustrativos):

> A busca por significado errava códigos de falha como "F0021", porque o código não tem significado para o modelo. Combinei com busca por palavra-chave. Medi com 30 perguntas de teste: o trecho certo entre os cinco primeiros subiu de 62% para 81%. Se o volume de manuais crescesse, eu reavaliaria o custo do reranking.

A segunda resposta mostra a causa, a decisão, a medida e a consciência dos limites.

## Erros comuns

- **Ficar em silêncio durante o exercício.** A pessoa não sabe o que você está pensando.
- **Começar a codar sem entender o problema.**
- **Decorar respostas.** Perguntas de aprofundamento derrubam respostas decoradas.
- **Falar do projeto como se fosse só a biblioteca.** "Usei LangChain" não explica nada. Explique o problema e a decisão.
- **Inflar o que você sabe.** Se não sabe, diga e descreva como investigaria.
- **Depender de IA para treinar.** Na entrevista não haverá, e você precisa saber o que o código faz.

## Checklist

- Dez a vinte exercícios de Python resolvidos sem ajuda de IA.
- Meia página por projeto: problema, arquitetura, decisões, erros e melhorias.
- Respostas sobre os principais temas de IA ensaiadas em voz alta.
- Pelo menos uma simulação com outra pessoa.
- Ambiente de vídeo e editor testados antes da entrevista.
- Perguntas para a equipe preparadas.
