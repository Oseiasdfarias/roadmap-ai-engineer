---
titulo: "API and parameters"
nivel: 1
grupo: "LLM fundamentals (no math)"
ordem: 6
resumo: "How to call an LLM through an API: system, user and assistant messages, history sent on every call, temperature, top-p, token limit and streaming. Run experiments to see each parameter change the output."
tempo: "1 to 2 weeks"
ferramentas:
  - "Anthropic SDK"
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
revisado: "2026-11-25"
rascunho: false
---

## What it is

An LLM API (an interface for one program to talk to another) receives a list of messages and parameters and returns the generated text. You send an HTTP request, directly or through an SDK (the provider's official library), and get the answer back. That is how your code uses the model, instead of the chat website.

## Why it matters for an AI Engineer

Every AI application goes through this call. Understanding messages, memory and parameters is what separates someone who "uses a chat" from someone who builds a system: you control what the model sees, how much it can write, how much it varies and how the answer reaches the user.

## How it works

**Messages.** Each call carries a list of messages with a role:

- `system`: general instructions and the assistant's role. With some providers, such as Anthropic, it is a separate field.
- `user`: what the person said.
- `assistant`: what the model answered before.

**The model has no memory.** Each call starts from scratch. The "conversation history" is you resending all previous messages, along with the new one. That is why a long conversation gets more expensive and can overflow the context window.

**Main parameters:**

- `temperature`: controls how much the choice of the next word varies. Close to 0, more predictable and repeatable answers; higher, more variety. To extract data or answer facts, use low; for ideas and creative texts, higher.
- `top_p`: limits the choices to the group of most likely words. In general, adjust temperature or top_p, not both at once.
- `max_tokens`: the token ceiling for the answer. If it is too short, the text gets cut.
- Stop sequences: texts that end generation when they appear. The field is called `stop_sequences` in the Anthropic SDK and `stop` in other providers; names vary.
- **Streaming:** instead of waiting for the whole answer, you receive pieces as they are generated, and the user sees the text "typing". It reduces the perceived wait.

Check in your model's documentation which sampling parameters it accepts: some newer models restrict or ignore temperature and top_p.

An example with the Anthropic SDK (`pip install anthropic`; the key goes in the `ANTHROPIC_API_KEY` variable; check the documentation for the current model name):

```python
import anthropic

client = anthropic.Anthropic()           # reads ANTHROPIC_API_KEY from the environment
history = [{"role": "user", "content": "Suggest a name for a maintenance robot."}]

for temp in (0.0, 1.0):
    resp = client.messages.create(
        model="MODEL-NAME",              # see the name in the documentation
        max_tokens=60,
        temperature=temp,
        system="Answer in one line.",
        messages=history,
    )
    print(temp, resp.content[0].text)
```

Run it several times: with `temperature=0.0` the names tend to repeat (temperature 0 does not guarantee identical results); with `1.0` they vary. The experiment is your learning.

## In practice

In P1: Automaker Assistant, you keep the history in a list, resend it every turn, use a `system` prompt with the assistant's rules and streaming so the answer appears gradually. Also record the input and output tokens the response reports, to estimate cost. Other providers use different names for fields and parameters, but the structure (messages, parameters, streaming) is the same.

## Common mistakes

- **Thinking the model remembers the conversation.** Without resending the history, it does not know what was said.
- **Putting the API key in the code.** Use an environment variable and a `.env` kept out of Git.
- **Using high temperature for a factual task.** It increases variation and invention.
- **A `max_tokens` that is too short.** The answer ends mid-sentence.
- **Not handling API errors.** Rate limits, temporary failures and timeouts happen; handle them and retry with a wait.

## How to study

1. Create a developer account with a provider and generate a key, storing it in `.env` (1 hour).
2. Read "Working with messages" and the Messages API reference (2 hours).
3. Write a terminal chat that keeps the history (1 day).
4. Run the same question 5 times with temperatures 0, 0.5 and 1 and note what changes (2 hours).
5. Add streaming to the chat, using the streaming page (half a day).

## How to show it

In your portfolio, include in the README a table of the experiment with the parameters and outputs. In the interview, explain why the model has no memory, what the history costs and when you would lower the temperature.
