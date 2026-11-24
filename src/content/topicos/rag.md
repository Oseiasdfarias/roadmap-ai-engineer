---
titulo: "RAG"
nivel: 2
grupo: "Como funciona"
ordem: 1
resumo: "Geração aumentada por recuperação: buscar nos seus documentos só os trechos relevantes e entregá-los ao modelo, com citação da fonte. Veja chunking, metadados, avaliação e quando contexto longo basta."
tempo: "2 a 3 semanas"
ferramentas:
  - "Python"
  - "sentence-transformers"
  - "PostgreSQL com pgvector"
prerequisitos:
  - "embeddings"
  - "alucinacao"
  - "tokens-e-janela-de-contexto"
relacionados:
  - "busca-hibrida-e-reranking"
  - "evals"
referencias:
  - titulo: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)"
    url: "https://arxiv.org/abs/2005.11401"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Contextual Retrieval"
    url: "https://www.anthropic.com/research/contextual-retrieval"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Lost in the Middle: How Language Models Use Long Contexts (Liu et al., 2023)"
    url: "https://arxiv.org/abs/2307.03172"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Citations: documentação da API do Claude"
    url: "https://platform.claude.com/docs/en/build-with-claude/citations"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "pgvector: busca vetorial no PostgreSQL"
    url: "https://github.com/pgvector/pgvector"
    tipo: "Repositório"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

RAG (retrieval-augmented generation, ou geração aumentada por recuperação) é uma forma de responder perguntas sobre documentos que o modelo nunca viu no treino. Antes de chamar o LLM (large language model, o modelo de linguagem), o sistema busca nos seus documentos os trechos relevantes e os coloca no prompt, o texto enviado ao modelo. O modelo responde com base neles e cita a fonte.

## Por que importa para um AI Engineer

Sistemas de LLM em empresas quase sempre respondem sobre dados internos: manuais, contratos, tickets. Esses dados mudam, são privados e não estão no treino. RAG resolve isso sem fine-tuning (retreinar o modelo com seus dados): para atualizar o conhecimento, você reindexa o documento.

Também reduz a alucinação (resposta inventada com aparência de verdade). Com a fonte citada, o usuário confere a resposta e você mede onde o sistema erra.

## Como funciona

1. **Indexação**, feita uma vez por documento. Você divide o texto em pedaços, os chunks (daí o nome chunking), gera um embedding (vetor numérico que representa o sentido do texto) para cada um e guarda vetor, texto e metadados: documento, seção, página.
2. **Recuperação**, a cada pergunta. O embedding da pergunta busca os chunks mais próximos.
3. **Geração**. Você monta o prompt com chunks, pergunta e a instrução de citar a fonte ou dizer "não sei".

```python
from sentence_transformers import SentenceTransformer

modelo = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
chunks = [  # (texto, manual, página)
    ("Erro E-21: sensor de pressão desconectado.", "Compressor X200", 47),
    ("Troque o filtro de óleo a cada 500 horas.", "Compressor X200", 63),
]
indice = modelo.encode([c[0] for c in chunks], normalize_embeddings=True)

pergunta = "O que significa o erro E-21?"
q = modelo.encode(pergunta, normalize_embeddings=True)
top = (indice @ q).argsort()[::-1][:3]
trechos = "\n".join(f"[{chunks[i][1]}, p. {chunks[i][2]}] {chunks[i][0]}" for i in top)
prompt = ("Use só os trechos e cite [manual, p.]. Se não houver resposta, diga que não sabe.\n"
          f"{trechos}\n\nPergunta: {pergunta}")
```

Na geração, esse `prompt` vai para o LLM. Num sistema real, os vetores ficam no PostgreSQL com pgvector, não numa lista. A API do Claude tem citação nativa: aponta o trecho usado em cada frase, e você confere esse trecho no chunk.

O tamanho do chunk é uma troca. Chunk pequeno acha a frase exata, mas perde contexto. Chunk grande carrega contexto, mas mistura assuntos e piora a busca. Corte pela estrutura do documento (seção, parágrafo, passo) e ajuste medindo.

Os metadados filtram a busca (só o manual escolhido, por exemplo) e montam a citação.

RAG nem sempre é necessário. Se o material cabe na janela de contexto (algumas centenas de páginas nos modelos atuais) e muda pouco, colocar tudo no prompt é mais simples. RAG vale quando a base é grande, muda muito ou quando custo e latência importam.

## Na prática

No P2: RAG de Manuais Técnicos, técnicos de manutenção perguntam por falha, procedimento ou peça e recebem resposta com manual e página. Ali você soma busca híbrida (vetorial mais palavra-chave, que acha códigos como "E-21") e reranking (um segundo modelo reordena os trechos encontrados). No P3: Servidor MCP de Manuais, a mesma busca vira ferramenta MCP (Model Context Protocol), que qualquer aplicativo compatível, como o Claude Code, chama.

## Erros comuns

- **Cortar o texto em tamanho fixo sem olhar a estrutura.** Tabela partida ao meio ou passo separado do aviso de segurança gera resposta errada.
- **Não avaliar a recuperação.** Se o chunk certo não chega ao prompt, nenhum ajuste de prompt resolve. Meça recall@k (o trecho certo está entre os k primeiros?) antes de mexer na geração.
- **Colocar trechos demais no prompt.** Mais chunks aumentam custo e latência, e os modelos usam pior a informação no meio de contextos longos.
- **Não ter caminho para "não sei".** Sem essa instrução e sem testes com perguntas fora da base, o modelo responde com o trecho mais parecido, mesmo irrelevante.

## Como estudar

1. Leia o método do artigo de Lewis et al. (2 horas).
2. Rode o exemplo com dois ou três PDFs públicos, extraindo o texto por página (1 dia).
3. Troque a lista por PostgreSQL com pgvector e adicione filtro por documento (2 a 3 dias).
4. Escreva 30 perguntas com a página correta e calcule recall@5 (2 dias).
5. Teste dois tamanhos de chunk e registre a diferença (1 dia).
6. Leia Contextual Retrieval e teste uma melhoria medida (2 a 3 dias).

## Como mostrar

No portfólio, o README do P2 traz o diagrama das três etapas, recall@k por configuração e respostas com citação, incluindo um "não sei". Na entrevista, explique uma decisão com número, algo como: "chunks por seção subiram o recall@5 de 0,62 para 0,81 nas minhas 30 perguntas". Saiba dizer quando não usaria RAG.
