---
titulo: "Frameworks de agentes"
nivel: 3
grupo: "Ferramentas"
ordem: 3
resumo: "LangGraph e afins escondem o loop de agente, estado e orquestração. Veja o que abstraem, quando valem a pena e por que aprender depois de construir um agente na mão e entender o que está escondido."
tempo: "1 a 2 semanas"
ferramentas:
  - "LangGraph"
  - "Python"
prerequisitos:
  - "workflow-ou-agente"
  - "tool-use"
relacionados:
  - "workflow-ou-agente"
  - "human-in-the-loop"
referencias:
  - titulo: "LangGraph"
    url: "https://langchain-ai.github.io/langgraph/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Building effective agents"
    url: "https://www.anthropic.com/research/building-effective-agents"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Um framework de agentes é uma biblioteca que traz pronta a estrutura de um agente: o loop em que o modelo chama ferramentas, o estado que passa de um passo ao outro e a orquestração (a ordem e as condições entre os passos). LangGraph é um exemplo; há outros, como os SDKs de agentes dos próprios provedores.

## Por que importa para um AI Engineer

Vagas e times usam esses frameworks, então você vai encontrá-los. Mas o framework esconde justamente o que você precisa dominar. Quando algo dá errado (loop sem fim, ferramenta chamada com argumento errado, custo alto), quem só conhece a abstração não sabe onde olhar. Quem já escreveu o loop na mão lê o framework com facilidade e decide melhor se vale usá-lo.

## Como funciona

Lembre o loop de tool use: o modelo pede uma ferramenta, seu código executa, o resultado volta, e o ciclo se repete até a resposta final. Os frameworks organizam isso em partes:

- **Estado.** Os dados que o agente carrega: mensagens, resultados de ferramentas, contadores.
- **Passos (nós).** Funções que leem o estado e o atualizam: chamar o modelo, executar a ferramenta.
- **Transições (arestas).** Regras sobre qual passo vem depois. Algumas são fixas, outras dependem do estado ("se o modelo pediu ferramenta, vá para a ferramenta; senão, termine").
- **Persistência.** Salvar o estado a cada passo permite pausar, retomar e, com aprovação humana, esperar uma decisão (veja human-in-the-loop).

Um agente simples, em forma de grafo (um diagrama de passos ligados por setas):

```text
início -> modelo --pediu ferramenta--> ferramenta -> modelo
                 --resposta pronta---> fim
```

O que você ganha: menos código repetido, estado e persistência prontos, visualização do fluxo e integração com ferramentas de observabilidade. O que você paga: mais uma dependência, abstrações que mudam de versão e dificuldade de depurar o que não entende. A API desses frameworks muda com frequência, então siga a documentação da versão que instalar, em vez de copiar exemplos antigos.

Quando vale usar: fluxos com vários passos e ramificações, necessidade de pausar e retomar, ou um time que já adotou o framework. Quando não vale: um loop de uma ferramenta, ou um workflow fixo que um `if` resolve. O texto "Building effective agents" recomenda começar pelo mais simples e só adicionar abstração quando ela se justificar.

## Na prática

No P4: Triagem de Ordens, um workflow fixo basta e um framework seria exagero. No P1: Assistente da Montadora, escreva o loop de tool use você mesmo. No PF: Agente Completo, com ferramentas via MCP, aprovação humana e estado que precisa ser retomado, avalie reescrever o agente num framework e compare com a versão feita na mão. Medir as duas, em linhas de código e em facilidade de depurar, vale como material para a entrevista.

## Erros comuns

- **Começar pelo framework.** Você aprende a API dele, não o conceito.
- **Usar framework para um caso trivial.** Mais código e mais pontos de falha, sem benefício.
- **Copiar tutoriais antigos.** A API muda; confira a versão.
- **Não limitar as voltas do loop.** O framework não elimina o risco de custo infinito; configure o limite.
- **Ignorar o que ele envia ao modelo.** Inspecione os prompts reais e os traços de execução.

## Como estudar

1. Garanta que você escreveu um agente com loop de tool use na mão (pré-requisito).
2. Leia "Building effective agents", a parte sobre frameworks (2 horas).
3. Siga o tutorial básico do LangGraph (1 a 2 dias).
4. Reescreva o agente do passo 1 no framework e compare linhas de código e clareza (2 a 3 dias).
5. Anote o que o framework resolveu e o que escondeu (meio dia).

## Como mostrar

No portfólio, publique as duas versões do mesmo agente, uma na mão e outra no framework, com uma tabela de comparação. Na entrevista, mostre que entende o que o framework abstrai e explique por que escolheu usá-lo, ou não, naquele projeto.
