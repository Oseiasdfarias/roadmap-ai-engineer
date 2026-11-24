---
titulo: "FastAPI"
nivel: 3
grupo: "Construir com IA"
ordem: 2
resumo: "Transforme os projetos em APIs com rotas, validação Pydantic, async e documentação automática. Veja a estrutura de projeto e como servir respostas de LLM com streaming para o cliente."
tempo: "2 a 3 semanas"
ferramentas:
  - "Python"
  - "FastAPI"
  - "Pydantic"
  - "Uvicorn"
prerequisitos:
  - "python-poo-e-tipos"
relacionados:
  - "frontend-com-ia"
  - "docker-local"
referencias:
  - titulo: "Tutorial do FastAPI"
    url: "https://fastapi.tiangolo.com/pt/tutorial/"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
  - titulo: "FastAPI: respostas customizadas e StreamingResponse"
    url: "https://fastapi.tiangolo.com/advanced/custom-response/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Streaming de mensagens da API do Claude"
    url: "https://platform.claude.com/docs/en/build-with-claude/streaming"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

FastAPI é um framework Python para criar APIs web. Uma API (interface que outros programas chamam por HTTP) recebe uma requisição, executa código seu e devolve uma resposta, quase sempre em JSON. O FastAPI usa os type hints (as anotações de tipo) do Python para validar entradas e gerar a documentação sozinho.

## Por que importa para um AI Engineer

Um notebook ou script não é um produto. Para uma interface web, outro sistema ou um agente chamar o seu RAG, é preciso uma API. É o formato que as empresas esperam, e é nela que você aplica validação, autenticação, limites e registro de cada chamada.

## Como funciona

Três ideias bastam para começar:

- **Rotas.** Uma função decorada, como `@app.post("/perguntar")`, atende um método e um caminho.
- **Validação com Pydantic.** Você descreve o corpo da requisição como uma classe com tipos. Dados inválidos viram erro 422 com a explicação, sem código extra seu.
- **Documentação automática.** Ao subir o servidor, a página `/docs` lista as rotas e permite testá-las no navegador.

Respostas de LLM demoram alguns segundos. Com streaming, o servidor envia o texto em pedaços conforme o modelo gera, e o usuário vê as primeiras palavras logo. Os SDKs dos provedores têm modo de streaming (veja a documentação do que você usa), e o FastAPI repassa os pedaços com `StreamingResponse`. Para interfaces de chat, o formato mais usual é o SSE (server-sent events, `media_type="text/event-stream"`), que o navegador sabe ler; o exemplo usa texto simples para ficar curto:

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
app = FastAPI()
class Pergunta(BaseModel):
    texto: str
async def gerar(texto: str):
    for parte in ["Você ", "perguntou: ", texto]:  # troque pelo stream do LLM
        yield parte
@app.post("/perguntar")
async def perguntar(p: Pergunta):
    return StreamingResponse(gerar(p.texto), media_type="text/plain")
```

Rode com `uvicorn main:app --reload` (o Uvicorn é o servidor que executa a aplicação) e teste em `/docs`. A forma de subir o servidor, como o comando `fastapi dev`, varia conforme a versão instalada; siga o tutorial oficial.

Sobre `async`: chamadas a LLMs e bancos esperam a rede. Numa rota `async def` você usa clientes assíncronos (`await`), e o servidor atende outras requisições durante a espera. Se chamar uma função bloqueante (por exemplo, o SDK síncrono) dentro de `async def`, trava o servidor inteiro; nesse caso use uma rota `def` comum, que o FastAPI roda numa thread separada.

Estrutura sugerida: `routers/` com as rotas, `schemas.py` com os modelos Pydantic, `services/` com a lógica (a chamada ao LLM, a busca) e `main.py` que junta tudo. A rota fica fina; a lógica de IA fica em funções que você testa sem subir o servidor.

## Na prática

No P2: RAG de Manuais Técnicos, o RAG ganha uma rota que recebe a pergunta e devolve a resposta com manual e página; no P1: Assistente da Montadora, uma rota de chat com streaming alimenta a interface. No P3: Servidor MCP de Manuais, a mesma lógica de busca é reaproveitada, e no PF: Agente Completo a API é a peça que vai para a nuvem.

## Erros comuns

- **Lógica de IA dentro da rota.** Fica difícil de testar e de reutilizar. Mova para funções.
- **Bloquear o servidor** com chamadas síncronas dentro de `async def`.
- **Sem limite de tamanho nem de voltas** na entrada. Uma pergunta gigante vira custo; valide o comprimento no Pydantic.
- **Chave de API no código.** Leia de variável de ambiente.
- **Devolver o erro bruto do provedor** ao cliente. Registre no log e responda com uma mensagem simples.

## Como estudar

1. Siga o tutorial oficial até validação com Pydantic (2 a 3 dias).
2. Crie a rota `/perguntar` do exemplo e teste em `/docs` (meio dia).
3. Troque o gerador pelo streaming do SDK do seu provedor (1 dia).
4. Separe em `routers/`, `schemas.py` e `services/` e escreva um teste da lógica (1 a 2 dias).
5. Adicione uma chave de API simples e um limite de tamanho (1 dia).

## Como mostrar

No portfólio, o README mostra o comando para subir a API, um exemplo de chamada com `curl` e um print do `/docs`. Na entrevista, explique a diferença entre `def` e `async def`, o que o Pydantic valida por você e por que o streaming melhora a experiência.
