---
titulo: "Prompt engineering"
nivel: 1
grupo: "Fundamentos de LLM (sem matemática)"
ordem: 8
resumo: "O prompt é a especificação da tarefa: papel, contexto, instruções, exemplos e formato de saída. Aprenda a estruturar com tags, usar few-shot e iterar medindo, em vez de mexer por tentativa e erro."
tempo: "2 semanas"
ferramentas:
  - "Python"
  - "SDK do provedor"
prerequisitos:
  - "api-e-parametros"
relacionados:
  - "api-e-parametros"
  - "evals"
  - "fine-tuning"
referencias:
  - titulo: "Guia de prompt engineering"
    url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Anthropic Courses"
    url: "https://github.com/anthropics/courses"
    tipo: "Repositório"
    idioma: "en"
    gratuito: true
  - titulo: "Tutorial interativo de prompt engineering"
    url: "https://github.com/anthropics/prompt-eng-interactive-tutorial"
    tipo: "Repositório"
    idioma: "en"
    gratuito: true
  - titulo: "Prompt Engineering Guide (em português)"
    url: "https://www.promptingguide.ai/pt"
    tipo: "Artigo"
    idioma: "pt"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Prompt engineering é escrever as instruções que você envia ao LLM (modelo de linguagem de grande porte) de forma que ele cumpra a tarefa de modo consistente. O prompt (o texto enviado ao modelo) funciona como uma especificação: quanto mais claro o que você quer, menos o modelo precisa adivinhar.

## Por que importa para um AI Engineer

O prompt é a parte do sistema que mais muda o resultado e a mais barata de mudar. Boa parte do trabalho de um AI Engineer é transformar um pedido vago de um usuário numa instrução precisa e testável. Antes de pensar em RAG ou ajuste fino, um prompt bem estruturado resolve muita coisa.

## Como funciona

Um bom prompt tem partes. Pense em como explicaria a tarefa a um colega novo e inteligente, mas sem contexto:

1. **Papel:** quem o modelo é nesta tarefa ("você é um técnico de manutenção sênior").
2. **Contexto:** o que ele precisa saber: documentos, dados, público.
3. **Instruções:** o que fazer, em passos claros, e o que não fazer.
4. **Exemplos:** casos de entrada e saída desejada. Mostrar vale mais do que descrever. Com poucos exemplos, a técnica se chama few-shot (poucos exemplos); sem exemplos, zero-shot.
5. **Formato de saída:** como a resposta deve vir (lista, JSON, uma palavra).

**Tags** (marcações como `<documento>...</documento>`) separam as partes e evitam que o modelo misture dados com instruções. Para tarefas de raciocínio, pedir que ele pense passo a passo antes de responder costuma melhorar o resultado; modelos de raciocínio já fazem isso sozinhos.

```python
documento = "Erro E-21: sensor de pressão desconectado."
exemplos = """<exemplo>
Entrada: Erro E-05: bateria baixa.
Saída: {"causa": "bateria baixa", "urgencia": "baixa"}
</exemplo>"""
prompt = f"""Você é um técnico de manutenção sênior.
Extraia a causa e a urgência (baixa, media ou alta) do aviso.
Responda só com JSON, como nos exemplos.

{exemplos}

<aviso>{documento}</aviso>"""
print(prompt)
```

O prompt tem papel, instruções, exemplo, tags e formato. Troque o `print` pela chamada à API para testar.

O ponto mais importante é **iterar medindo**. Mudar uma palavra e olhar uma resposta engana: o modelo varia de uma chamada para outra. Monte 20 a 30 entradas com a resposta esperada, rode o prompt em todas, anote o acerto e só então compare versões. Mude uma coisa por vez e guarde cada versão no Git.

## Na prática

No P1: Assistente da Montadora, o prompt de sistema define o papel, o tom e o que fazer quando faltam informações. No P4: Triagem de Ordens de Manutenção, exemplos (few-shot) e o formato JSON fazem a classificação ficar estável, e o conjunto de teste diz se uma nova versão do prompt melhorou ou piorou. Os provedores publicam guias de boas práticas para os seus modelos; as dicas mudam com cada geração, então leia o guia atual.

## Erros comuns

- **Prompt vago.** "Resuma" gera resumos diferentes a cada vez. Diga tamanho, público e formato.
- **Mudar tudo de uma vez.** Sem isolar a alteração, você não sabe o que ajudou.
- **Julgar pela primeira resposta.** Teste em dezenas de casos, incluindo os difíceis.
- **Misturar dados e instruções.** Texto de usuário dentro do prompt sem separação pode ser tomado como ordem; use tags.
- **Exemplos todos iguais.** O modelo copia o padrão; varie os casos e inclua um difícil.
- **Prompt gigante por medo.** Instruções demais e contraditórias pioram o resultado; releia e corte.

## Como estudar

1. Faça o tutorial interativo de prompt engineering (2 a 3 dias).
2. Leia o guia oficial do provedor que você usa (3 horas).
3. Escolha uma tarefa (extrair dados de avisos) e escreva 25 casos com a resposta esperada (1 dia).
4. Teste três versões do prompt e registre o acerto de cada uma (2 dias).
5. Explore os cursos do repositório Anthropic Courses, e o Prompt Engineering Guide para técnicas como raciocínio passo a passo (1 semana, em paralelo).

## Como mostrar

No portfólio, publique a pasta de prompts versionados e uma tabela com o acerto de cada versão no mesmo conjunto de teste, algo como "v1: 18 de 25; v3: 23 de 25" (números ilustrativos). Na entrevista, conte uma mudança de prompt que você testou com número e uma que não funcionou.
