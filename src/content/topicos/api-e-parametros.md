---
titulo: "API e parâmetros"
nivel: 1
grupo: "Fundamentos de LLM (sem matemática)"
ordem: 6
resumo: "Como chamar um LLM por API: mensagens system, user e assistant, histórico enviado a cada chamada, temperatura, top-p, limite de tokens e streaming. Faça experimentos para ver cada parâmetro mudar a saída."
tempo: "1 a 2 semanas"
ferramentas:
  - "SDK da Anthropic"
  - "Python"
prerequisitos:
  - "python-fundamentos"
  - "terminal-e-ambientes"
relacionados:
  - "saida-estruturada"
  - "prompt-engineering"
referencias:
  - titulo: "Messages API"
    url: "https://platform.claude.com/docs/en/api/messages"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Working with messages"
    url: "https://platform.claude.com/docs/en/build-with-claude/working-with-messages"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Streaming Messages"
    url: "https://platform.claude.com/docs/en/build-with-claude/streaming"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Uma API (interface para um programa falar com outro) de LLM recebe uma lista de mensagens e parâmetros e devolve o texto gerado. Você manda um pedido HTTP, direto ou por um SDK (biblioteca oficial do provedor), e recebe a resposta. É assim que seu código usa o modelo, em vez do site de chat.

## Por que importa para um AI Engineer

Toda aplicação de IA passa por essa chamada. Entender mensagens, memória e parâmetros é o que separa quem "usa um chat" de quem constrói um sistema: você controla o que o modelo vê, quanto ele pode escrever, o quanto varia e como a resposta chega ao usuário.

## Como funciona

**Mensagens.** Cada chamada leva uma lista de mensagens com um papel (role):

- `system`: instruções gerais e o papel do assistente. Em alguns provedores, como o da Anthropic, é um campo à parte.
- `user`: o que a pessoa disse.
- `assistant`: o que o modelo respondeu antes.

**O modelo não tem memória.** Cada chamada começa do zero. O "histórico da conversa" é você reenviando todas as mensagens anteriores, junto com a nova. Por isso a conversa longa fica mais cara e pode estourar a janela de contexto.

**Parâmetros principais:**

- `temperature` (temperatura): controla o quanto a escolha da próxima palavra varia. Perto de 0, respostas mais previsíveis e repetíveis; mais alta, mais variedade. Para extrair dados ou responder fatos, use baixa; para ideias e textos criativos, mais alta.
- `top_p`: limita as escolhas ao grupo das palavras mais prováveis. Em geral, ajuste a temperatura ou o top_p, não os dois ao mesmo tempo.
- `max_tokens`: teto de tokens da resposta. Se for curto demais, o texto é cortado.
- Sequências de parada: textos que, se aparecerem, encerram a geração. O campo se chama `stop_sequences` no SDK da Anthropic e `stop` em outros provedores; os nomes variam.

Confira na documentação do modelo que você usa quais parâmetros de amostragem ele aceita: alguns modelos mais novos restringem ou ignoram temperatura e top_p.
- **Streaming:** em vez de esperar a resposta toda, você recebe pedaços à medida que são gerados, e o usuário vê o texto "digitando". Reduz a espera percebida.

Um exemplo com o SDK da Anthropic (`pip install anthropic`; a chave vai na variável `ANTHROPIC_API_KEY`; consulte na documentação o nome atual do modelo):

```python
import anthropic

cliente = anthropic.Anthropic()          # lê ANTHROPIC_API_KEY do ambiente
historico = [{"role": "user", "content": "Dê um nome para um robô de manutenção."}]

for temp in (0.0, 1.0):
    resp = cliente.messages.create(
        model="NOME-DO-MODELO",          # veja o nome na documentação
        max_tokens=60,
        temperature=temp,
        system="Responda em uma linha.",
        messages=historico,
    )
    print(temp, resp.content[0].text)
```

Rode várias vezes: com `temperature=0.0` os nomes tendem a se repetir (temperatura 0 não garante resultado idêntico); com `1.0` variam. O experimento é o seu aprendizado.

## Na prática

No P1: Assistente da Montadora, você guarda o histórico numa lista, reenvia a cada turno, usa um `system` com as regras do assistente e streaming para a resposta aparecer aos poucos. Registre também os tokens de entrada e saída que a resposta informa, para estimar custo. Outros provedores usam nomes diferentes para campos e parâmetros, mas a estrutura (mensagens, parâmetros, streaming) é a mesma.

## Erros comuns

- **Achar que o modelo lembra da conversa.** Sem reenviar o histórico, ele não sabe o que foi dito.
- **Colocar a chave de API no código.** Use variável de ambiente e `.env` fora do Git.
- **Usar temperatura alta em tarefa factual.** Aumenta variação e invenção.
- **`max_tokens` curto demais.** A resposta termina no meio da frase.
- **Não tratar erros da API.** Limites de uso, falhas temporárias e prazos esgotados acontecem; trate e tente de novo com espera.

## Como estudar

1. Crie uma conta de desenvolvedor num provedor e gere uma chave, guardando-a em `.env` (1 hora).
2. Leia "Working with messages" e a referência da Messages API (2 horas).
3. Escreva um chat de terminal que mantém o histórico (1 dia).
4. Rode a mesma pergunta 5 vezes com temperaturas 0, 0.5 e 1 e anote o que muda (2 horas).
5. Adicione streaming ao chat, usando a página de streaming (meio dia).

## Como mostrar

No portfólio, inclua no README uma tabela do experimento com os parâmetros e as saídas. Na entrevista, explique por que o modelo não tem memória, o que o histórico custa e quando você reduziria a temperatura.
