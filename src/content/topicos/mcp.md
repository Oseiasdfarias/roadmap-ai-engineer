---
titulo: "MCP"
nivel: 2
grupo: "Como funciona"
ordem: 4
resumo: "O Model Context Protocol padroniza como ferramentas, recursos e prompts chegam a qualquer cliente compatível. Veja servidor e cliente, quando vale criar um servidor e como tratar autenticação e permissões."
tempo: "1 a 2 semanas"
ferramentas:
  - "Python"
  - "SDK oficial do MCP"
  - "JSON-RPC"
prerequisitos:
  - "tool-use"
relacionados:
  - "human-in-the-loop"
  - "prompt-injection"
referencias:
  - titulo: "Model Context Protocol"
    url: "https://modelcontextprotocol.io/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "MCP: arquitetura"
    url: "https://modelcontextprotocol.io/docs/learn/architecture"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "MCP: especificação"
    url: "https://modelcontextprotocol.io/specification/latest"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "MCP: autorização"
    url: "https://modelcontextprotocol.io/docs/tutorials/security/authorization"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

O MCP (Model Context Protocol) é um protocolo aberto que define como um aplicativo com LLM (modelo de linguagem) se conecta a ferramentas e dados. Você escreve um servidor MCP uma vez, e qualquer cliente compatível, como o Claude Code ou o Claude Desktop, consegue usá-lo, sem integração própria para cada aplicativo.

## Por que importa para um AI Engineer

Sem padrão, cada aplicativo reimplementa a mesma integração com o mesmo sistema. Com o MCP, a integração vira um serviço reutilizável. É também o formato em que muitas ferramentas de terceiros chegam, então você vai usar servidores dos outros e precisa saber avaliá-los.

## Como funciona

Há três papéis. O **host** é o aplicativo que o usuário usa (o Claude Code, por exemplo). Dentro dele, um **cliente** MCP mantém a conexão com um servidor. O **servidor** é o programa que expõe capacidades. A conversa entre eles usa mensagens JSON-RPC (chamadas de função em JSON).

O servidor pode expor três tipos de capacidade:

- **Ferramentas (tools):** ações que o modelo pode pedir, como `buscar_manual`. É o mesmo tool use, mas padronizado.
- **Recursos (resources):** dados que o aplicativo pode ler e oferecer como contexto, como um arquivo ou um registro.
- **Prompts:** modelos de instrução reutilizáveis, que o usuário escolhe, por exemplo "diagnosticar falha".

Na conexão, o cliente pergunta ao servidor o que ele oferece; por isso o servidor novo funciona sem mudar o cliente. Em termos de transporte (como as mensagens trafegam), o conceito é: no modo local (stdio), o cliente inicia o servidor como um processo na sua máquina; no modo remoto, o servidor roda na rede e responde por HTTP. Os detalhes mudam entre versões da especificação, então consulte-a.

Um servidor mínimo com o SDK oficial em Python (`pip install mcp`). A API do SDK muda entre versões: este exemplo foi testado com a série 2.x; nas 1.x, a classe se chama `FastMCP` e vem de `mcp.server.fastmcp`. Confira o guia de início rápido da versão que instalar:

```python
from mcp.server.mcpserver import MCPServer

mcp = MCPServer("manuais")

@mcp.tool()
def buscar_manual(pergunta: str) -> str:
    """Busca trechos nos manuais e devolve com manual e página."""
    return "[Compressor X200, p. 47] Erro E-21: sensor de pressão desconectado."

if __name__ == "__main__":
    mcp.run()   # por padrão, fala por stdio
```

A função é um exemplo fixo; num servidor real ela chamaria a busca do seu RAG.

**Autenticação e permissões.** Num servidor local por stdio, ele roda com as permissões do seu usuário, então dê só o acesso necessário (privilégio mínimo). Num servidor remoto, a especificação de autorização se apoia em OAuth (padrão em que o usuário autoriza o acesso sem entregar a senha). Em todo caso, trate as descrições e resultados de um servidor de terceiros como texto não confiável: veja prompt injection.

**Quando criar um servidor.** Vale quando mais de um aplicativo precisa do mesmo sistema ou quando você quer usar clientes prontos. Se só o seu aplicativo usa a ferramenta, uma função com tool use é mais simples.

## Na prática

No P3: Servidor MCP de Manuais, a busca do P2 vira um servidor com uma ferramenta de leitura e uma de ação, que só roda depois de aprovação humana. Você o testa conectando o Claude Code ou o Claude Desktop e pedindo uma consulta de verdade.

## Erros comuns

- **Expor ferramentas demais.** Cada ferramenta é superfície de risco; exponha só as que a tarefa exige.
- **Misturar leitura e escrita na mesma ferramenta.** Separe-as para poder pedir aprovação só na escrita.
- **Confiar em servidor de terceiros.** Leia o código, limite o acesso e desconfie das descrições das ferramentas.
- **Segredos no código do servidor.** Use variáveis de ambiente.
- **Criar servidor para tudo.** Para uso único, tool use direto basta.

## Como estudar

1. Leia a introdução e a página de arquitetura (2 horas).
2. Conecte um servidor pronto ao Claude Desktop ou ao Claude Code e observe as ferramentas que ele lista (meio dia).
3. Rode o servidor mínimo acima e chame a ferramenta (meio dia).
4. Troque a resposta fixa pela busca do seu RAG (2 dias).
5. Leia a página de autorização e liste o que mudaria num servidor remoto (meio dia).

## Como mostrar

No README do P3, inclua o diagrama host, cliente e servidor, a lista de ferramentas com o nível de permissão de cada uma e um vídeo curto do Claude Code usando o servidor. Na entrevista, explique a diferença entre ferramentas, recursos e prompts e quando você não criaria um servidor.
