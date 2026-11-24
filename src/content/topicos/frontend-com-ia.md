---
titulo: "Frontend com IA"
nivel: 3
grupo: "Construir com IA"
ordem: 4
resumo: "Streamlit ou Gradio para prototipar, depois uma interface web feita com ajuda do agente. Aprenda o mínimo para revisar o que ele gera e os detalhes de UX de chat: streaming, citações e erros."
tempo: "2 a 3 semanas"
ferramentas:
  - "Streamlit"
  - "Gradio"
  - "HTML e CSS"
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
  - titulo: "Gradio: criando um chatbot rápido"
    url: "https://www.gradio.app/guides/creating-a-chatbot-fast"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Streamlit: st.write_stream"
    url: "https://docs.streamlit.io/develop/api-reference/write-magic/st.write_stream"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Frontend é a parte do sistema que o usuário vê e usa. Para IA, isso quase sempre é um chat: uma caixa de texto, a conversa e a resposta do modelo. Você tem dois caminhos. Streamlit e Gradio são bibliotecas Python que montam uma interface com poucas linhas, ótimas para protótipo. A interface web "de verdade" (HTML, CSS e JavaScript, ou um framework como React) dá controle total e conversa com a sua API.

## Por que importa para um AI Engineer

Um RAG ou um agente só convence quando alguém consegue usá-lo. Uma interface simples transforma o projeto em demonstração: o recrutador abre, pergunta e vê. Ela também expõe falhas que o terminal esconde, como a espera sem retorno visual. Você não precisa virar especialista em frontend, mas precisa entender o suficiente para revisar o que o agente de programação gerou.

## Como funciona

**Protótipo.** No Streamlit, o script inteiro roda de novo a cada interação, e o `st.session_state` guarda o histórico entre as execuções:

```python
import streamlit as st
st.title("Assistente de manuais")
if "msgs" not in st.session_state:
    st.session_state.msgs = []
for m in st.session_state.msgs:
    st.chat_message(m["role"]).write(m["content"])
if pergunta := st.chat_input("Pergunte ao manual"):
    st.session_state.msgs.append({"role": "user", "content": pergunta})
    st.chat_message("user").write(pergunta)
    resposta = f"Resposta de exemplo para: {pergunta}"  # troque pela chamada ao LLM
    st.chat_message("assistant").write(resposta)
    st.session_state.msgs.append({"role": "assistant", "content": resposta})
```

Rode com `streamlit run app.py`. O Gradio oferece algo parecido com `gr.ChatInterface`. Os nomes das funções mudam entre versões; confira a documentação.

**Interface web.** Quando o protótipo não basta, peça ao agente uma página que chame a sua API (veja fastapi). O mínimo que você precisa saber para revisar:

- **HTML** define a estrutura (caixa de texto, botão, lista de mensagens).
- **CSS** define a aparência.
- **JavaScript** envia a pergunta com `fetch`, lê a resposta em pedaços e atualiza a tela.

**UX de chat.** Quatro detalhes separam um chat bom de um ruim:

1. **Streaming.** Mostrar o texto aos poucos reduz a sensação de espera. O `st.write_stream` faz isso no Streamlit.
2. **Citações.** Mostre de onde veio a resposta (manual e página) e deixe o usuário abrir a fonte.
3. **Estados de erro.** Falha da API, limite excedido e "não sei" precisam de mensagem clara, não de tela travada.
4. **Estado de carregamento.** Indique que a resposta está a caminho e permita cancelar.

## Na prática

No P1: Assistente da Montadora, a interface de chat é a vitrine do projeto. No P2: RAG de Manuais Técnicos, o técnico precisa ver a resposta com manual e página clicáveis. Comece pelo Streamlit para validar a ideia em uma tarde e, quando o fluxo estiver certo, peça ao agente uma interface web que consuma a API do projeto.

## Erros comuns

- **Aceitar o código do agente sem abrir no navegador.** Teste de fato: tela pequena, resposta longa, erro de rede.
- **Esconder a fonte.** Resposta sem citação perde a principal vantagem do RAG.
- **Colocar chave de API no JavaScript.** Qualquer pessoa vê o código no navegador; chame só a sua API, e a chave fica no servidor.
- **Renderizar a resposta do modelo como HTML sem tratar.** Abre espaço para injeção de código; use texto ou um renderizador de Markdown seguro.
- **Gastar semanas no visual.** O objetivo é mostrar o projeto, não ganhar prêmio de design.

## Como estudar

1. Faça o exemplo de chat do Streamlit rodar (meio dia).
2. Troque a resposta fixa pela chamada ao seu LLM, com streaming (1 dia).
3. Estude o básico de HTML, CSS e `fetch`, o suficiente para ler uma página simples (3 a 4 dias).
4. Peça ao agente uma página que consuma a sua API e revise cada arquivo (2 a 3 dias).
5. Adicione citação clicável e uma mensagem de erro (1 dia).

## Como mostrar

No portfólio, grave um GIF curto do chat com streaming, citação e um "não sei", e ponha no topo do README. Na entrevista, diga o que você revisou no código de frontend gerado e como tratou erros e espera.
