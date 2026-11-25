---
titulo: "KV cache e inferência"
nivel: 5
grupo: "Como os modelos funcionam por dentro"
ordem: 2
resumo: "Por que gerar texto é mais lento que ler: as fases de prefill e decode, o KV cache que evita refazer contas, quanto de memória ele ocupa e as técnicas que aceleram a inferência em produção."
tempo: "1 a 2 semanas"
ferramentas:
  - "Python"
  - "Transformers (Hugging Face)"
prerequisitos:
  - "transformer-por-dentro"
relacionados:
  - "servir-modelos-abertos"
  - "custo-e-latencia"
referencias:
  - titulo: "KV cache explained (Hugging Face)"
    url: "https://huggingface.co/blog/kv-cache"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Caching: documentação do Transformers"
    url: "https://huggingface.co/docs/transformers/kv_cache"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Efficient Memory Management for LLM Serving with PagedAttention (Kwon et al., 2023)"
    url: "https://arxiv.org/abs/2309.06180"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Fast Inference from Transformers via Speculative Decoding (Leviathan et al., 2022)"
    url: "https://arxiv.org/abs/2211.17192"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "FlashAttention (Dao et al., 2022)"
    url: "https://arxiv.org/abs/2205.14135"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## O que é

Inferência é rodar o modelo para gerar texto. Ela tem duas fases. No prefill, o modelo lê o prompt inteiro de uma vez, em paralelo. No decode, gera um token por vez, e cada token novo depende de todos os anteriores. O KV cache guarda as chaves (K) e os valores (V) da atenção de cada token já processado, para que o modelo não precise recalculá-los a cada passo do decode.

```mermaid
flowchart TB
  accTitle: Prefill, decode e KV cache
  accDescr: No prefill, o prompt inteiro é processado em paralelo e o KV cache é preenchido. No decode, cada passo lê o cache, gera um token e acrescenta as chaves e valores dele.
  subgraph PF["Prefill · define o tempo até o primeiro token"]
    direction LR
    P([Prompt inteiro]) --> F[Processa todos os tokens em paralelo] --> C0[(KV cache)]:::dado
  end
  subgraph DC["Decode · define os tokens por segundo"]
    direction LR
    L[Lê o cache] --> G{{Gera 1 token}}:::modelo --> A[Acrescenta K e V do token]
    A -- próximo passo --> L
  end
  PF --> DC --> FIM([Resposta completa]):::destaque
```

## Por que importa para um AI Engineer

Quase toda conversa sobre custo e latência de LLM passa por aqui. O tempo até o primeiro token depende do prefill, ou seja, do tamanho do prompt. A velocidade de geração depende do decode, limitada pela leitura de memória da GPU. O prompt caching dos provedores é, na prática, reaproveitar o KV cache de um início de prompt igual. E o KV cache ocupa memória que cresce com o contexto e com o número de usuários simultâneos: é ele, muitas vezes, e não os pesos, que limita quantas requisições uma GPU atende.

## Como funciona

O tamanho do cache por token é: 2 (K e V) vezes o número de camadas, vezes o número de cabeças de K/V, vezes a dimensão de cada cabeça, vezes os bytes por número. A conta abaixo usa uma configuração típica de um modelo de 8 bilhões de parâmetros com GQA (grouped-query attention, em que várias cabeças de consulta dividem as mesmas chaves e valores).

```python
camadas, cabecas_kv, dim_cabeca, bytes_fp16 = 32, 8, 128, 2
por_token = 2 * camadas * cabecas_kv * dim_cabeca * bytes_fp16
print(por_token / 1024, "KiB por token")                 # 128.0 KiB

contexto, usuarios = 32_000, 10
total = por_token * contexto * usuarios
print(round(total / 1024**3, 1), "GiB só de KV cache")   # 39.1 GiB
```

Sem GQA (32 cabeças de K/V em vez de 8), seriam quatro vezes mais. Por isso as técnicas de inferência atacam essa memória e o decode:

- **PagedAttention:** guarda o cache em blocos, como a memória virtual de um sistema operacional, e quase elimina o desperdício. É a base do vLLM.
- **Batching contínuo:** junta requisições de usuários diferentes no mesmo passo de decode.
- **Speculative decoding:** um modelo pequeno propõe vários tokens e o grande confere todos de uma vez, mantendo a mesma distribuição de saída.
- **FlashAttention:** reorganiza o cálculo da atenção para ler e escrever menos na memória da GPU.
- **Quantizar o cache:** guardar K e V em 8 bits em vez de 16.

## Na prática

Prompts com início fixo (instruções, ferramentas) ficam mais baratos com prompt caching. Contextos muito longos aumentam o tempo até o primeiro token e o custo de memória. No P5: Pesquisador Multiagente, você mede tempo até o primeiro token e tokens por segundo do subagente servido localmente e explica os números com essa conta.

## Erros comuns

- **Medir só o tempo total.** Separe tempo até o primeiro token e tokens por segundo; as causas são diferentes.
- **Calcular memória só pelos pesos.** Com contexto longo e vários usuários, o cache passa os pesos.
- **Variar o início do prompt.** Um timestamp no começo invalida o cache a cada chamada.
- **Esperar que speculative decoding sempre ajude.** Se o modelo pequeno erra muito, o ganho some.

## Como estudar

1. Leia o artigo sobre KV cache da Hugging Face (2 horas).
2. Refaça a conta acima para dois modelos abertos, lendo o arquivo de configuração de cada um (1 dia).
3. Gere texto com o Transformers com e sem cache e compare o tempo (1 dia).
4. Leia o resumo e as figuras dos artigos do PagedAttention e do speculative decoding (2 dias).
5. Meça o tempo até o primeiro token de uma API com e sem prompt caching (1 dia).

## Como mostrar

No README do P5, inclua a tabela de memória do KV cache por contexto e por número de usuários e os tempos medidos. Na entrevista, explique a diferença entre prefill e decode e por que o decode é limitado por memória, não por cálculo.
