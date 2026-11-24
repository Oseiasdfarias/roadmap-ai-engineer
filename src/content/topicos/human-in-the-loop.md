---
titulo: "Human-in-the-loop"
nivel: 2
grupo: "Como funciona"
ordem: 6
resumo: "Ações irreversíveis, como pagar, apagar ou enviar, devem parar e pedir aprovação humana. Veja onde colocar os pontos de aprovação, como desenhar a tela de decisão e como registrar quem aprovou."
tempo: "1 semana"
ferramentas:
  - "Python"
  - "LangGraph (opcional)"
prerequisitos:
  - "tool-use"
relacionados:
  - "guardrails"
  - "prompt-injection"
  - "workflow-ou-agente"
referencias:
  - titulo: "OWASP LLM06: Excessive Agency"
    url: "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "LangGraph: interrupts"
    url: "https://docs.langchain.com/oss/python/langgraph/interrupts"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Human-in-the-loop (humano no circuito) é o desenho em que o sistema para antes de uma ação de risco e espera a decisão de uma pessoa: aprovar, editar ou recusar. O agente propõe, o humano decide, e só então o seu código executa.

## Por que importa para um AI Engineer

O modelo erra, e erra com confiança. Também pode ser enganado por um texto malicioso num documento (prompt injection). Se ele pode pagar, apagar ou enviar, um erro vira dano real. O OWASP chama esse risco de excessive agency (autonomia excessiva): ferramentas demais, permissões demais e nenhuma checagem humana. Aprovação humana é a defesa mais simples e das mais eficazes, porque não depende de o modelo acertar.

## Como funciona

**Quais ações pedem aprovação.** Classifique cada ferramenta: leitura (livre), escrita reversível (aprovação conforme o risco) e ação irreversível ou externa, como pagar, apagar, enviar e-mail ou abrir um chamado para outra empresa (sempre aprovação). Pedir aprovação para tudo cansa; o usuário passa a aprovar no reflexo e a proteção some.

**Onde fica o ponto de aprovação.** Entre a decisão do modelo e a execução. O fluxo pausa, guarda o estado e retoma quando a resposta chega, o que pode levar horas. Frameworks como o LangGraph têm um mecanismo de pausa e retomada para isso; no código mais simples, o seu laço de ferramentas pergunta antes de executar:

```python
from datetime import datetime, timezone

PERIGOSAS = {"apagar_ordem", "enviar_email"}

def executar(nome, args, ferramentas, auditoria, usuario):
    if nome in PERIGOSAS:
        resp = input(f"Aprovar {nome}({args})? [s/N] ").strip().lower()
        auditoria.append({"quem": usuario, "quando": datetime.now(timezone.utc).isoformat(),
                          "acao": nome, "args": args, "aprovado": resp == "s"})
        if resp != "s":
            return "Ação recusada pelo humano."
    return ferramentas[nome](**args)
```

**A tela de decisão.** Mostre o que será feito, com quais valores exatos, o motivo que o agente deu, o impacto e se dá para desfazer. Ofereça aprovar, editar e recusar. O que o humano aprova tem de ser exatamente o que é executado: guarde os argumentos aprovados e execute esses, sem recalcular.

**O registro.** Grave quem aprovou, quando, a ação, os argumentos e a decisão, em local que o agente não possa alterar. Quando algo der errado, é assim que você reconstrói o que aconteceu.

## Na prática

No P3: Servidor MCP de Manuais, a ferramenta de ação só executa depois de aprovação humana registrada, e o P3 também testa uma instrução maliciosa escondida num manual. No PF: Agente Completo, as ações de escrita passam pelo mesmo ponto de aprovação. Combine com privilégio mínimo: a aprovação é a última barreira, não a única.

## Erros comuns

- **Aprovar sem mostrar os argumentos.** "Confirmar ação?" sem detalhe não é aprovação informada.
- **Executar algo diferente do aprovado.** Recalcular os argumentos depois da aprovação abre uma brecha.
- **Aprovação para tudo.** Gera fadiga e aprovação automática; reserve-a ao que importa.
- **Sem registro.** Sem trilha de auditoria, não há como apurar um incidente.
- **Esquecer a recusa.** O fluxo precisa tratar o "não" e devolvê-lo ao modelo como resultado.

## Como estudar

1. Leia a página do OWASP sobre excessive agency (1 hora).
2. Classifique as ferramentas do seu projeto em leitura, escrita reversível e irreversível (1 hora).
3. Implemente o portão acima em linha de comando e teste aprovar, recusar e editar (1 dia).
4. Mova a aprovação para um estado pausável e retome depois (2 dias; a página do LangGraph mostra o padrão).

## Como mostrar

No README, inclua a tabela de ferramentas com o nível de aprovação de cada uma, uma captura da tela de decisão e um trecho do registro de auditoria. Na entrevista, explique como evitou a fadiga de aprovação e o que garante que o executado é o aprovado.
