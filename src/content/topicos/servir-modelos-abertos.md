---
titulo: "Servir modelos abertos"
nivel: 5
grupo: "Como os modelos funcionam por dentro"
ordem: 3
resumo: "Rodar um modelo de pesos abertos na sua própria infraestrutura: escolher o modelo, quantizar para caber na GPU, servir com vLLM ou llama.cpp e comparar custo, latência e qualidade com uma API comercial."
tempo: "2 a 3 semanas"
ferramentas:
  - "vLLM"
  - "llama.cpp"
  - "Ollama"
prerequisitos:
  - "kv-cache-e-inferencia"
  - "docker-local"
relacionados:
  - "custo-e-latencia"
  - "fine-tuning"
referencias:
  - titulo: "vLLM: documentação"
    url: "https://docs.vllm.ai/en/latest/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "llama.cpp"
    url: "https://github.com/ggml-org/llama.cpp"
    tipo: "Repositório"
    idioma: "en"
    gratuito: true
  - titulo: "Ollama"
    url: "https://ollama.com/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Quantization: documentação do Transformers"
    url: "https://huggingface.co/docs/transformers/quantization/overview"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale (Dettmers et al., 2022)"
    url: "https://arxiv.org/abs/2208.07339"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## O que é

Servir um modelo aberto é baixar os pesos de um modelo publicado (de famílias como Llama, Qwen, Mistral ou Gemma) e rodá-lo como um serviço seu, em vez de chamar a API de um provedor. Um servidor de inferência, como o vLLM ou o llama.cpp, carrega os pesos na GPU (ou na CPU), cuida do KV cache e do batching e expõe uma API, geralmente compatível com o formato da OpenAI.

## Por que importa para um AI Engineer

Há casos em que a API comercial não serve: dados que não podem sair da empresa, custo alto em volume grande e previsível, necessidade de um modelo ajustado (fine-tuned) ou de latência controlada. Saber servir um modelo aberto, e principalmente saber quando não vale a pena, é uma decisão de arquitetura que aparece em empresas maiores. Também é o jeito mais direto de ver na prática os conceitos de KV cache, quantização e batching.

## Como funciona

Primeiro, a conta de memória. Os pesos ocupam parâmetros vezes bytes por parâmetro: um modelo de 8 bilhões de parâmetros em 16 bits precisa de cerca de 16 GB; em 4 bits, cerca de 4 a 5 GB. Some o KV cache, que depende do contexto e do número de usuários. A quantização reduz os bits por peso (8, 4 ou menos) com alguma perda de qualidade, que você precisa medir.

Depois, o servidor. O vLLM é feito para GPU e muitos usuários ao mesmo tempo, com PagedAttention e batching contínuo. O llama.cpp roda modelos quantizados no formato GGUF em CPU, GPU de consumo ou Mac. O Ollama empacota o llama.cpp com uma experiência simples para testar local. Como os três expõem uma API compatível com a da OpenAI, o código cliente muda pouco:

```python
from openai import OpenAI

# vLLM, llama.cpp (llama-server) e Ollama expõem uma API compatível
cliente = OpenAI(base_url="http://localhost:8000/v1", api_key="local")

resposta = cliente.chat.completions.create(
    model="nome-do-modelo-servido",
    messages=[{"role": "user", "content": "Resuma o erro E-21 em uma frase."}],
    max_tokens=80,
)
print(resposta.choices[0].message.content)
```

Por fim, a comparação. Rode o mesmo conjunto de evals no modelo aberto e na API comercial e compare qualidade, tempo até o primeiro token, tokens por segundo e custo por mil requisições, incluindo o custo da GPU parada.

## Na prática

No P5: Pesquisador Multiagente, um subagente simples (classificar ou resumir trechos) roda num modelo aberto pequeno servido por você, enquanto o orquestrador usa um modelo comercial. Essa divisão por tarefa é comum em produção: o modelo caro só onde ele faz diferença.

## Erros comuns

- **Comparar só o preço por token.** A GPU custa mesmo ociosa; calcule pelo volume real.
- **Quantizar sem medir.** A perda de qualidade varia por tarefa; rode os evals antes e depois.
- **Esquecer o KV cache na conta de memória.** O modelo carrega, mas cai com o primeiro contexto longo.
- **Ignorar a licença.** Pesos abertos têm licenças diferentes; leia antes de usar em produto.
- **Escolher pelo ranking geral.** Teste no seu caso; rankings medem outras tarefas.

## Como estudar

1. Rode um modelo pequeno com o Ollama e chame pela API compatível (1 dia).
2. Rode o mesmo modelo no llama.cpp em duas quantizações e compare velocidade e respostas (2 dias).
3. Leia a página de quantização do Transformers (2 horas).
4. Suba o vLLM numa GPU alugada por algumas horas e meça tokens por segundo com 1, 8 e 32 requisições simultâneas (1 semana, com alerta de custo ligado).
5. Rode seus evals no modelo aberto e numa API comercial e monte a tabela de comparação (2 dias).

## Como mostrar

Publique a tabela de comparação (qualidade, latência, custo por mil requisições) com o método explicado e uma recomendação clara de quando usar cada opção. Na entrevista, defenda a decisão com números, não com preferência.
