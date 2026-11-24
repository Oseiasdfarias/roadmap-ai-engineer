---
titulo: "Testes e evals no projeto"
nivel: 3
grupo: "Ferramentas"
ordem: 2
resumo: "pytest para unidade e integração, dublês no lugar do LLM nos testes e evals com Promptfoo, tudo rodando no CI. Código e respostas do modelo precisam de testes diferentes, e ambos protegem o projeto."
tempo: "2 semanas"
ferramentas:
  - "pytest"
  - "Promptfoo"
  - "Python"
prerequisitos:
  - "evals"
  - "python-fundamentos"
relacionados:
  - "ci-cd"
referencias:
  - titulo: "Promptfoo"
    url: "https://www.promptfoo.dev/docs/intro/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "pytest: documentação"
    url: "https://docs.pytest.org/en/stable/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Promptfoo: integração com CI/CD"
    url: "https://www.promptfoo.dev/docs/integrations/ci-cd/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Num projeto com LLM há dois tipos de verificação, e eles respondem a perguntas diferentes. **Testes** automatizados (com pytest, a biblioteca de testes do Python) conferem o seu código: se ele lê a entrada, valida os dados e trata erros. **Evals** (avaliações) medem a qualidade das respostas do modelo num conjunto de casos, o golden set. O primeiro é exato e repetível; o segundo é estatístico, porque o modelo pode variar.

## Por que importa para um AI Engineer

Quem altera o prompt, troca o modelo ou muda o chunking sem rodar nada descobre a regressão (a piora) em produção. Testes dão segurança para refatorar o código; evals dão segurança para mexer em prompt e modelo. Juntos rodam no CI (integração contínua, a execução automática a cada mudança; veja ci-cd) e travam o que piora o resultado. Este tópico é a aplicação, dentro dos projetos, do que você viu em evals.

## Como funciona

**Unidade e integração.** Teste de unidade confere uma função isolada. Teste de integração confere várias peças juntas, como a rota da API com o banco de teste.

**Dublê no lugar do LLM.** Teste não deve chamar o modelo de verdade: é lento, custa dinheiro e a resposta varia. Você troca o cliente por um dublê (um objeto falso com resposta fixa) e testa o que é seu. Para isso, a função recebe o cliente como parâmetro:

```python
import pytest
from triagem import classificar  # P4: (texto, llm) -> ordem
class LLMFalso:
    def __init__(self, saida):
        self.saida = saida
    def gerar(self, texto):
        return self.saida
def test_urgencia():
    llm = LLMFalso('{"equipamento": "X200", "urgencia": "alta"}')
    assert classificar("Parou, erro E-21", llm=llm).urgencia == "alta"
def test_json_invalido():
    with pytest.raises(ValueError):
        classificar("texto", llm=LLMFalso("não é JSON"))
```

Rode `pytest`. O segundo teste verifica o caminho de erro, que é o que mais quebra.

**Evals com Promptfoo.** Você descreve casos e verificações num arquivo YAML e o Promptfoo chama o modelo real:

```yaml
prompts: ["Classifique a urgência do relato: {{relato}}"]
providers: ["anthropic:messages:NOME-DO-MODELO"]
tests:
  - vars: {relato: "Compressor parou com erro E-21"}
    assert:
      - type: contains
        value: "alta"
```

Troque `NOME-DO-MODELO` pelo identificador atual do provedor; o formato muda, então siga a documentação. Rode com `npx promptfoo eval`. Quando alguma verificação falha, o comando termina com erro, e é isso que faz o CI barrar a mudança.

Como a saída varia, defina um limite: por exemplo, passar se pelo menos 90% dos casos acertarem. Os 90% são ilustrativos; escolha o seu pelo risco do caso de uso. Esse limite não é automático: configure-o (o Promptfoo tem um limiar de aprovação nas opções de avaliação; veja a documentação), senão uma falha isolada pode não barrar nada, ou barrar tudo.

## Na prática

No P4: Triagem de Ordens, os testes cobrem a validação da ordem estruturada e o caminho de erro, e os evals comparam dois ou mais modelos no mesmo conjunto de casos. No P2: RAG de Manuais Técnicos, os evals medem a recuperação com perguntas e páginas corretas. No P1: Assistente da Montadora, casos de "não sei" e de pergunta fora de escopo entram no golden set.

## Erros comuns

- **Chamar o LLM de verdade nos testes de unidade.** Lento, caro e instável.
- **Eval com poucos casos ou casos fáceis demais.** Passar sempre não prova nada; inclua casos difíceis e de borda.
- **Testar só o caminho feliz.** O erro do provedor e a saída inválida precisam de teste.
- **Usar o mesmo exemplo no prompt e no eval.** O resultado fica inflado.
- **Não guardar os resultados.** Sem histórico, não há comparação antes e depois.

## Como estudar

1. Escreva três testes de unidade para uma função sua (1 dia).
2. Troque o cliente do LLM por um dublê e teste o erro (1 dia).
3. Monte 20 casos num YAML do Promptfoo e rode (2 dias).
4. Mude o prompt e compare os resultados antes e depois (1 dia).
5. Ponha pytest e Promptfoo no CI (1 dia).

## Como mostrar

No portfólio, o README mostra o comando de teste, a tabela de resultados dos evals e o selo do CI verde. Na entrevista, explique por que o teste usa dublê, o que o eval mede que o teste não mede e como uma regressão de prompt seria barrada.
