---
titulo: "Frontend with AI"
nivel: 3
grupo: "Building with AI"
ordem: 4
resumo: "Streamlit or Gradio for prototyping, then a web interface built with the agent's help. Learn the minimum to review what it generates and the details of chat UX: streaming, citations and errors."
tempo: "2 to 3 weeks"
ferramentas:
  - "Streamlit"
  - "Gradio"
  - "HTML and CSS"
  - "JavaScript"
prerequisitos:
  - "agentes-de-programacao"
relacionados:
  - "fastapi"
referencias:
  - titulo: "Streamlit"
    url: "https://docs.streamlit.io/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Gradio: creating a chatbot fast"
    url: "https://www.gradio.app/guides/creating-a-chatbot-fast"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Streamlit: st.write_stream"
    url: "https://docs.streamlit.io/develop/api-reference/write-magic/st.write_stream"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

The frontend is the part of the system the user sees and uses. For AI, that is almost always a chat: a text box, the conversation and the model's answer. You have two paths. Streamlit and Gradio are Python libraries that build an interface in a few lines, great for prototypes. A "real" web interface (HTML, CSS and JavaScript, or a framework like React) gives full control and talks to your API.

## Why it matters for an AI Engineer

A RAG or an agent only convinces people when someone can use it. A simple interface turns the project into a demo: the recruiter opens it, asks something and sees the result. It also exposes failures the terminal hides, such as waiting with no visual feedback. You do not need to become a frontend expert, but you need to understand enough to review what the coding agent generated.

## How it works

**Prototype.** In Streamlit, the whole script runs again on every interaction, and `st.session_state` keeps the history between runs:

```python
import streamlit as st
st.title("Manuals assistant")
if "msgs" not in st.session_state:
    st.session_state.msgs = []
for m in st.session_state.msgs:
    st.chat_message(m["role"]).write(m["content"])
if question := st.chat_input("Ask the manual"):
    st.session_state.msgs.append({"role": "user", "content": question})
    st.chat_message("user").write(question)
    answer = f"Example answer for: {question}"   # replace with the LLM call
    st.chat_message("assistant").write(answer)
    st.session_state.msgs.append({"role": "assistant", "content": answer})
```

Run it with `streamlit run app.py`. Gradio offers something similar with `gr.ChatInterface`. Function names change between versions; check the documentation.

**Web interface.** When the prototype is not enough, ask the agent for a page that calls your API (see the FastAPI topic). The minimum you need to know to review it:

- **HTML** defines the structure (text box, button, list of messages).
- **CSS** defines the look.
- **JavaScript** sends the question with `fetch`, reads the answer in pieces and updates the screen.

**Chat UX.** Four details separate a good chat from a bad one:

1. **Streaming.** Showing the text gradually reduces the feeling of waiting. `st.write_stream` does this in Streamlit.
2. **Citations.** Show where the answer came from (manual and page) and let the user open the source.
3. **Error states.** API failure, exceeded limits and "I don't know" need a clear message, not a frozen screen.
4. **Loading state.** Show that the answer is on its way and allow canceling.

## In practice

In P1: Automaker Assistant, the chat interface is the project's showcase. In P2: Technical Manuals RAG, the technician needs to see the answer with clickable manual and page. Start with Streamlit to validate the idea in an afternoon and, once the flow is right, ask the agent for a web interface that consumes the project's API.

## Common mistakes

- **Accepting the agent's code without opening it in the browser.** Actually test it: small screen, long answer, network error.
- **Hiding the source.** An answer without a citation loses RAG's main advantage.
- **Putting an API key in the JavaScript.** Anyone can see the code in the browser; call only your API, and the key stays on the server.
- **Rendering the model's answer as HTML without sanitizing it.** It opens room for code injection; use plain text or a safe Markdown renderer.
- **Spending weeks on the visuals.** The goal is to show the project, not to win a design award.

## How to study

1. Get the Streamlit chat example running (half a day).
2. Replace the fixed answer with a call to your LLM, with streaming (1 day).
3. Study basic HTML, CSS and `fetch`, enough to read a simple page (3 to 4 days).
4. Ask the agent for a page that consumes your API and review every file (2 to 3 days).
5. Add a clickable citation and an error message (1 day).

## How to show it

In your portfolio, record a short GIF of the chat with streaming, a citation and an "I don't know", and put it at the top of the README. In the interview, say what you reviewed in the generated frontend code and how you handled errors and waiting.
