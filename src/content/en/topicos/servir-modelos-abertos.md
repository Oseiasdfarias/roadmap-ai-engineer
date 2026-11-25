---
titulo: "Serving open models"
nivel: 5
grupo: "How models work inside"
ordem: 3
resumo: "Run an open-weights model on your own infrastructure: choose the model, quantize it to fit the GPU, serve it with vLLM or llama.cpp and compare cost, latency and quality with a commercial API."
tempo: "2 to 3 weeks"
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
  - titulo: "vLLM: documentation"
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
  - titulo: "Quantization: Transformers documentation"
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

## What it is

Serving an open model means downloading the weights of a published model (from families such as Llama, Qwen, Mistral or Gemma) and running it as your own service, instead of calling a provider's API. An inference server, such as vLLM or llama.cpp, loads the weights onto the GPU (or CPU), handles the KV cache and batching and exposes an API, usually compatible with OpenAI's format.

## Why it matters for an AI Engineer

There are cases where a commercial API does not fit: data that cannot leave the company, high cost at large and predictable volume, the need for a fine-tuned model or for controlled latency. Knowing how to serve an open model, and above all knowing when it is not worth it, is an architecture decision that shows up in larger companies. It is also the most direct way to see the concepts of KV cache, quantization and batching in practice.

## How it works

First, the memory math. The weights take parameters times bytes per parameter: an 8-billion-parameter model in 16 bits needs about 16 GB; in 4 bits, about 4 to 5 GB. Add the KV cache, which depends on context and number of users. Quantization reduces the bits per weight (8, 4 or fewer) with some quality loss, which you need to measure.

Then, the server. vLLM is built for GPUs and many simultaneous users, with PagedAttention and continuous batching. llama.cpp runs quantized models in the GGUF format on CPUs, consumer GPUs or Macs. Ollama packages llama.cpp with a simple experience for local testing. Since all three expose an OpenAI-compatible API, the client code changes little:

```python
from openai import OpenAI

# vLLM, llama.cpp (llama-server) and Ollama expose a compatible API
client = OpenAI(base_url="http://localhost:8000/v1", api_key="local")

answer = client.chat.completions.create(
    model="served-model-name",
    messages=[{"role": "user", "content": "Summarize error E-21 in one sentence."}],
    max_tokens=80,
)
print(answer.choices[0].message.content)
```

Finally, the comparison. Run the same set of evals on the open model and on the commercial API and compare quality, time to first token, tokens per second and cost per thousand requests, including the cost of an idle GPU.

## In practice

In P5: Multi-Agent Researcher, a simple subagent (classifying or summarizing passages) runs on a small open model you serve, while the orchestrator uses a commercial model. This split by task is common in production: the expensive model only where it makes a difference.

## Common mistakes

- **Comparing only the price per token.** The GPU costs money even when idle; calculate based on real volume.
- **Quantizing without measuring.** Quality loss varies by task; run the evals before and after.
- **Forgetting the KV cache in the memory math.** The model loads, but falls over with the first long context.
- **Ignoring the license.** Open weights have different licenses; read them before using in a product.
- **Choosing by the general leaderboard.** Test on your case; leaderboards measure other tasks.

## How to study

1. Run a small model with Ollama and call it through the compatible API (1 day).
2. Run the same model in llama.cpp with two quantizations and compare speed and answers (2 days).
3. Read the Transformers quantization page (2 hours).
4. Start vLLM on a GPU rented for a few hours and measure tokens per second with 1, 8 and 32 simultaneous requests (1 week, with a cost alert on).
5. Run your evals on the open model and on a commercial API and build the comparison table (2 days).

## How to show it

Publish the comparison table (quality, latency, cost per thousand requests) with the method explained and a clear recommendation of when to use each option. In the interview, defend the decision with numbers, not preference.
