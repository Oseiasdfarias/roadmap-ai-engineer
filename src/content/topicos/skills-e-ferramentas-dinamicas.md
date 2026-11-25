---
titulo: "Skills e ferramentas dinâmicas"
nivel: 5
grupo: "Agentes em ação"
ordem: 2
resumo: "Como dar a um agente dezenas de capacidades sem lotar o contexto: skills carregadas sob demanda, busca de ferramentas, descrições bem escritas e agentes que escrevem e rodam código em vez de chamar cada ferramenta."
tempo: "1 semana"
ferramentas:
  - "Python"
  - "MCP"
prerequisitos:
  - "mcp"
  - "engenharia-de-contexto-avancada"
relacionados:
  - "agentes-de-programacao"
  - "seguranca-de-agentes"
referencias:
  - titulo: "Equipping agents for the real world with Agent Skills"
    url: "https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Agent Skills: documentação da API do Claude"
    url: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Writing effective tools for agents"
    url: "https://www.anthropic.com/engineering/writing-tools-for-agents"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Model Context Protocol"
    url: "https://modelcontextprotocol.io/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## O que é

Cada ferramenta que um agente conhece ocupa contexto: nome, descrição e parâmetros entram em toda chamada. Com cinco ferramentas, tudo bem. Com cem, o agente gasta milhares de tokens só para saber o que pode fazer e começa a escolher errado. Ferramentas dinâmicas resolvem isso carregando capacidades sob demanda. Uma forma popular são as skills: pastas com instruções, scripts e arquivos de apoio, das quais o agente vê só o nome e uma descrição curta, e lê o resto apenas quando a tarefa pede.

## Por que importa para um AI Engineer

Agentes úteis em empresas acumulam capacidades: consultar sistemas, gerar relatórios no formato da casa, seguir procedimentos internos. Saber organizar isso sem degradar a escolha de ferramentas é o que permite crescer o agente com segurança. Também muda como você pensa ferramentas: às vezes, em vez de dez ferramentas pequenas, é melhor dar ao agente um ambiente para rodar código e uma biblioteca bem documentada.

## Como funciona

Três técnicas, que se combinam:

- **Divulgação progressiva (skills):** o agente vê um índice curto. Quando uma tarefa combina com uma skill, ele lê as instruções completas e, se precisar, roda os scripts que vêm junto.
- **Busca de ferramentas:** em vez de listar todas, o agente tem uma ferramenta que busca outras pela descrição e carrega só as relevantes.
- **Código como ferramenta:** o agente escreve e executa código num ambiente isolado, chamando bibliotecas ou servidores MCP como funções. Isso reduz idas e vindas e mantém resultados grandes fora do contexto.

```python
SKILLS = {
    "relatorio-de-falha": "Gera o relatório de falha no modelo da engenharia (seções, tabela de causas).",
    "consulta-pecas": "Consulta estoque e prazo de peças pelo código do fabricante.",
    "norma-seguranca": "Aplica o checklist de segurança antes de liberar um equipamento.",
}

def indice():
    """Só isto entra no contexto em toda chamada: uma linha por skill."""
    return "\n".join(f"- {nome}: {desc}" for nome, desc in SKILLS.items())

def carregar(nome):
    """Lido só quando o agente decide usar a skill."""
    return open(f"skills/{nome}/SKILL.md", encoding="utf-8").read()

print(indice())
```

A qualidade da descrição decide tudo: ela precisa dizer quando usar a skill, não só o que ela faz. Teste com perguntas reais se o agente escolhe a certa.

## Na prática

Agentes de programação e assistentes corporativos já usam skills e busca de ferramentas para lidar com muitas capacidades. No P5: Pesquisador Multiagente, o formato do relatório de investigação e o checklist de segurança viram skills, carregadas só quando o orquestrador chega a essas etapas.

## Erros comuns

- **Descrições vagas.** "Ajuda com relatórios" não diz quando usar; o agente erra a escolha.
- **Skills com instruções conflitantes.** Duas skills que mandam fazer o oposto confundem o agente.
- **Rodar código sem isolamento.** Código gerado executa com as permissões do ambiente; use sandbox.
- **Não medir a escolha.** Sem um teste de seleção de ferramenta, você não sabe se o índice funciona.

## Como estudar

1. Leia o artigo sobre Agent Skills e a documentação oficial (2 horas).
2. Releia o artigo sobre escrever ferramentas para agentes (1 hora).
3. Crie três skills para um domínio seu, com instruções e um script cada (2 dias).
4. Monte 20 perguntas e meça se o agente escolhe a skill certa; reescreva as descrições até melhorar (1 dia).
5. Compare um agente com 30 ferramentas listadas e o mesmo com busca de ferramentas: tokens e acerto (2 dias).

## Como mostrar

Mostre o índice de skills, a taxa de escolha correta antes e depois de reescrever as descrições e os tokens economizados. Na entrevista, explique como você faria um agente crescer de 5 para 100 capacidades sem perder qualidade.
