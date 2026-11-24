---
titulo: "Agentes de programação"
nivel: 3
grupo: "Construir com IA"
ordem: 1
resumo: "Claude Code e Codex: como usam contexto, ferramentas e permissões, e o fluxo planejar, implementar e revisar. Você é o revisor; por isso a base do nível 1 vem antes e pacotes de vibe coding ficam de fora."
tempo: "1 a 2 semanas, depois uso contínuo"
ferramentas:
  - "Claude Code"
  - "Codex"
  - "Git"
prerequisitos:
  - "python-fundamentos"
  - "git-e-github"
relacionados:
  - "fastapi"
  - "frontend-com-ia"
referencias:
  - titulo: "Anthropic Academy"
    url: "https://anthropic.skilljar.com/"
    tipo: "Curso"
    idioma: "en"
    gratuito: true
  - titulo: "OpenAI Academy: Codex"
    url: "https://academy.openai.com/pages/codex-9t6874"
    tipo: "Curso"
    idioma: "en"
    gratuito: true
  - titulo: "Claude Code: visão geral"
    url: "https://code.claude.com/docs/en/overview"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Codex: documentação"
    url: "https://developers.openai.com/codex"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Um agente de programação é um LLM (large language model, o modelo de linguagem) que trabalha dentro do seu projeto: lê arquivos, edita código, roda comandos e testes num loop, até cumprir a tarefa que você pediu. Claude Code e Codex são dois exemplos. Eles rodam no terminal, no editor ou na nuvem, e a ideia é a mesma nos dois.

## Por que importa para um AI Engineer

Usar bem esses agentes já é requisito, não diferencial: eles aceleram os projetos de portfólio e o trabalho em equipe. Há um limite, porém. O agente erra com confiança, e quem responde pelo código que entra no repositório é você. Quem entende o que está por baixo (contexto, ferramentas, permissões) conduz melhor e erra menos.

## Como funciona

O agente é o mesmo loop do tool use (o modelo pede uma ferramenta, o programa executa e devolve o resultado), com ferramentas voltadas a código. Três peças explicam o comportamento:

- **Contexto.** O agente só enxerga o que está na janela de contexto: sua instrução, os arquivos que leu e a saída dos comandos. Por isso projetos têm um arquivo de instruções (`CLAUDE.md` no Claude Code, `AGENTS.md` no Codex) com como rodar testes, convenções e o que não mexer. Conversa muito longa degrada o resultado; comece uma sessão nova por tarefa.
- **Ferramentas.** Ler e editar arquivos, rodar comandos de terminal, buscar no código. Servidores MCP (Model Context Protocol, o padrão para ligar ferramentas externas) acrescentam outras.
- **Permissões.** Antes de editar ou executar um comando, o agente pede sua aprovação, e você define o que ele pode fazer sem perguntar. Comece restritivo. Liberar tudo, inclusive comandos destrutivos, só num ambiente isolado.

O fluxo que funciona é planejar, implementar e revisar:

1. **Planejar.** Peça um plano antes de qualquer edição e corrija o rumo no texto, que é barato.
2. **Implementar.** Passos pequenos, um commit por passo, com testes rodando a cada um.
3. **Revisar.** Leia o diff (o conjunto de linhas alteradas) inteiro, rode os testes e só então faça o commit.

## Na prática

Divida o trabalho assim. No backend e na parte de IA do P1: Assistente da Montadora, do P2: RAG de Manuais Técnicos e do P4: Triagem de Ordens, você conduz e entende cada linha. No frontend, use o agente desde o começo para montar a interface, mas aprenda o básico para revisar (veja frontend-com-ia). Aqui a base de Python do nível 1 se paga: sem ela, você não percebe o erro que o agente cometeu.

Existem pacotes de prompts e gerenciadores de contexto, comuns em repositórios de "vibe coding" (programar aceitando o que a IA entrega, sem ler), que prometem abstrair tudo. Evite: escondem o que você precisa aprender e tendem a quebrar a cada atualização da ferramenta. No máximo, admita um complemento pequeno e bem mantido, usado junto dos recursos oficiais (arquivo de instruções, comandos, skills, MCP).

## Erros comuns

- **Aceitar sem ler.** Código que roda não é código correto. Revise o diff como revisaria o de um colega.
- **Pedir tudo de uma vez.** Tarefas enormes geram mudanças grandes demais para revisar. Divida.
- **Liberar todas as permissões** na sua máquina de trabalho. Um comando destrutivo apaga arquivos de verdade.
- **Colar segredos** (chaves de API) no chat ou deixar o agente ler o `.env`. Mantenha-os fora do alcance.
- **Não testar.** Sem teste, você não sabe se o agente quebrou algo que já funcionava.

## Como estudar

1. Escolha uma ferramenta e faça o curso oficial dela: a Anthropic Academy para o Claude Code, a OpenAI Academy para o Codex (1 a 2 dias).
2. Leia a documentação sobre contexto, arquivo de instruções e permissões (meio dia).
3. Crie o arquivo de instruções de um projeto pequeno (1 hora).
4. Faça uma feature pequena no fluxo planejar, implementar e revisar, com commit por passo (1 dia).
5. Repita num projeto seu e anote o que o agente errou e como você percebeu (1 semana de uso).

## Como mostrar

No portfólio, deixe o arquivo de instruções do projeto no repositório e commits pequenos e legíveis. Na entrevista, explique como o agente gerencia contexto e permissões, e conte um caso em que você revisou e recusou uma sugestão, com o motivo. Isso mostra que você conduz o agente, e não o contrário.
