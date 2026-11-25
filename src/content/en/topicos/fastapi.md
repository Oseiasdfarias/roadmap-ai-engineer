---
titulo: "FastAPI"
nivel: 3
grupo: "Building with AI"
ordem: 2
resumo: "Turn the projects into APIs with routes, Pydantic validation, async and automatic documentation. See the project structure and how to serve LLM answers to the client with streaming."
tempo: "2 to 3 weeks"
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
  - titulo: "FastAPI tutorial"
    url: "https://fastapi.tiangolo.com/tutorial/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "FastAPI: custom responses and StreamingResponse"
    url: "https://fastapi.tiangolo.com/advanced/custom-response/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Streaming messages: Claude API"
    url: "https://platform.claude.com/docs/en/build-with-claude/streaming"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

FastAPI is a Python framework for building web APIs. An API (an interface other programs call over HTTP) receives a request, runs your code and returns a response, almost always in JSON. FastAPI uses Python's type hints (type annotations) to validate inputs and generate the documentation on its own.

## Why it matters for an AI Engineer

A notebook or script is not a product. For a web interface, another system or an agent to call your RAG, you need an API. It is the format companies expect, and it is where you apply validation, authentication, limits and logging of every call.

## How it works

Three ideas are enough to start:

- **Routes.** A decorated function, such as `@app.post("/ask")`, handles a method and a path.
- **Validation with Pydantic.** You describe the request body as a class with types. Invalid data becomes a 422 error with an explanation, with no extra code on your part.
- **Automatic documentation.** When you start the server, the `/docs` page lists the routes and lets you test them in the browser.

LLM answers take a few seconds. With streaming, the server sends the text in pieces as the model generates it, and the user sees the first words right away. Provider SDKs have a streaming mode (see the documentation of the one you use), and FastAPI passes the pieces on with `StreamingResponse`. For chat interfaces, the most common format is SSE (server-sent events, `media_type="text/event-stream"`), which the browser knows how to read; the example uses plain text to stay short:

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
app = FastAPI()
class Question(BaseModel):
    text: str
async def generate(text: str):
    for part in ["You ", "asked: ", text]:   # replace with the LLM stream
        yield part
@app.post("/ask")
async def ask(q: Question):
    return StreamingResponse(generate(q.text), media_type="text/plain")
```

Run it with `uvicorn main:app --reload` (Uvicorn is the server that runs the application) and test it at `/docs`. The way to start the server, such as the `fastapi dev` command, varies with the installed version; follow the official tutorial.

About `async`: calls to LLMs and databases wait on the network. In an `async def` route you use asynchronous clients (`await`), and the server handles other requests during the wait. If you call a blocking function (for example, the synchronous SDK) inside `async def`, it freezes the whole server; in that case use a regular `def` route, which FastAPI runs in a separate thread.

Suggested structure: `routers/` with the routes, `schemas.py` with the Pydantic models, `services/` with the logic (the LLM call, the search) and `main.py` that ties everything together. The route stays thin; the AI logic lives in functions you test without starting the server.

## In practice

In P2: Technical Manuals RAG, the RAG gets a route that receives the question and returns the answer with manual and page; in P1: Automaker Assistant, a chat route with streaming feeds the interface. In P3: Manuals MCP Server, the same search logic is reused, and in PF: Complete Agent the API is the piece that goes to the cloud.

## Common mistakes

- **AI logic inside the route.** It is hard to test and reuse. Move it into functions.
- **Blocking the server** with synchronous calls inside `async def`.
- **No limit on size or turns** for the input. A giant question becomes cost; validate the length in Pydantic.
- **The API key in the code.** Read it from an environment variable.
- **Returning the provider's raw error** to the client. Log it and answer with a simple message.

## How to study

1. Follow the official tutorial up to validation with Pydantic (2 to 3 days).
2. Create the `/ask` route from the example and test it at `/docs` (half a day).
3. Replace the generator with your provider SDK's streaming (1 day).
4. Split into `routers/`, `schemas.py` and `services/` and write a test for the logic (1 to 2 days).
5. Add a simple API key and a size limit (1 day).

## How to show it

In your portfolio, the README shows the command to start the API, an example call with `curl` and a screenshot of `/docs`. In the interview, explain the difference between `def` and `async def`, what Pydantic validates for you and why streaming improves the experience.
