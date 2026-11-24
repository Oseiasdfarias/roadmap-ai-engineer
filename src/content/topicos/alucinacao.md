---
titulo: "Alucinação"
nivel: 1
grupo: "Fundamentos de LLM (sem matemática)"
ordem: 3
resumo: "O modelo gera o texto mais provável, não o verificado. Entenda por que ele inventa e como reduzir o problema com contexto confiável, citações, permissão para dizer \"não sei\", saída estruturada e evals."
tempo: "1 semana"
ferramentas:
  - "Python"
prerequisitos:
  - "evolucao-dos-modelos"
relacionados:
  - "rag"
  - "evals"
  - "saida-estruturada"
referencias:
  - titulo: "Reduce hallucinations"
    url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "A Survey on Hallucination in Large Language Models (Huang et al., 2023)"
    url: "https://arxiv.org/abs/2311.05232"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Citations: documentação da API do Claude"
    url: "https://platform.claude.com/docs/en/build-with-claude/citations"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Alucinação é quando o LLM (modelo de linguagem de grande porte) produz uma resposta que parece correta e confiante, mas é inventada ou errada: um artigo científico que não existe, uma função que a biblioteca não tem, uma cláusula que o contrato não contém.

## Por que importa para um AI Engineer

Num chat casual, uma invenção é só um incômodo. Num sistema real, vira problema: um técnico segue um procedimento que não existe no manual, ou um cliente recebe uma informação falsa em nome da empresa. Seu trabalho não é eliminar a alucinação, o que não é possível hoje, e sim reduzi-la, detectá-la e desenhar o sistema para que o erro custe pouco.

## Como funciona

O modelo foi treinado para gerar o texto mais provável, não o verificado. Ele não consulta um banco de fatos: continua a frase de um jeito plausível. Se o fato não está bem representado no treino, a continuação plausível é uma invenção com a mesma firmeza de uma resposta certa. Uma analogia: um aluno que, na prova, em vez de deixar em branco, escreve uma resposta que soa bem.

Tipos comuns:

- **Fato inventado:** nomes, datas, números, referências.
- **Contradição com o contexto:** você entrega um documento e a resposta diz outra coisa.
- **Excesso de confiança:** nenhuma sinalização de dúvida.
- **Citação falsa:** link ou artigo com formato perfeito e conteúdo inexistente.

Formas de reduzir, em ordem sugerida de aplicação:

1. **Grounding** (ancorar a resposta em fontes): entregue ao modelo o texto confiável (por exemplo, com RAG) e mande responder só com base nele.
2. **Citações:** peça o trecho que sustenta cada afirmação, para que você (ou um programa) confira.
3. **Permitir "não sei":** sem essa saída, o modelo tende a responder qualquer coisa.
4. **Saída estruturada:** campos fixos e valores permitidos reduzem o espaço de invenção, e o código valida o que voltou.
5. **Evals:** não reduzem a alucinação por si, mas medem se as outras medidas funcionam: um conjunto de perguntas com resposta conhecida mede a taxa de erro antes e depois de cada mudança.

Um exemplo de prompt que aplica as três primeiras:

```python
trecho = "Erro E-21: sensor de pressão desconectado. Reconecte o cabo B7."
pergunta = "O que fazer no erro E-30?"
prompt = f"""Responda usando SOMENTE o texto entre <fonte> e </fonte>.
Cite a frase usada entre aspas. Se a fonte não responder, escreva exatamente: Não sei.

<fonte>{trecho}</fonte>
Pergunta: {pergunta}"""
print(prompt)
```

Com a fonte falando só do E-21, o comportamento desejado é "Não sei". Teste justamente com perguntas que a fonte não cobre.

## Na prática

No P2: RAG de Manuais Técnicos, toda resposta traz manual e página, e há perguntas de teste sem resposta na base para verificar se o sistema diz "não sei". No P4: Triagem de Ordens de Manutenção, a classificação sai em campos com valores permitidos, e um conjunto de ordens já rotuladas por pessoas mede os erros. Em aplicações de maior risco, a resposta passa por revisão humana antes de agir.

## Erros comuns

- **Confiar na "confiança" do modelo.** Tom seguro não prova que a resposta é correta.
- **Pedir "não invente nada" e achar que resolveu.** A instrução ajuda, mas não substitui fonte e conferência.
- **Nunca testar perguntas sem resposta.** Só testar casos felizes esconde o problema.
- **Esquecer de conferir citações.** Uma citação precisa ser verificada contra o trecho de origem.
- **Usar temperatura alta em tarefas factuais.** Mais aleatoriedade aumenta a chance de invenção (veja o tópico de API e parâmetros).

## Como estudar

1. Peça a um chat 10 referências sobre um assunto de nicho e confira cada uma (2 horas).
2. Leia a página "Reduce hallucinations" da documentação (1 hora).
3. Leia a introdução e a taxonomia do survey de Huang et al. (2 horas).
4. Monte 15 perguntas, 5 sem resposta na fonte, e rode o prompt do exemplo com um LLM (1 dia).
5. Leia a documentação de Citations e veja como ela aponta o trecho de cada frase (2 horas).

## Como mostrar

No portfólio, exiba no README os casos em que o sistema errou, o que você mudou e a taxa de erro antes e depois, algo como "de 6 respostas inventadas em 30 para 1 em 30" (números ilustrativos). Na entrevista, saiba explicar por que o modelo alucina e citar ao menos três mitigações com o que cada uma custa.
