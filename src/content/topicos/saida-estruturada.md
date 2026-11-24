---
titulo: "Saída estruturada"
nivel: 1
grupo: "Fundamentos de LLM (sem matemática)"
ordem: 7
resumo: "Faça o modelo responder em JSON validado por JSON Schema ou Pydantic, com nova tentativa quando a validação falha. É o que transforma uma chamada de LLM numa função com contrato previsível."
tempo: "1 semana"
ferramentas:
  - "Pydantic"
  - "JSON Schema"
prerequisitos:
  - "python-poo-e-tipos"
relacionados:
  - "api-e-parametros"
  - "tool-use"
referencias:
  - titulo: "Structured outputs: documentação da API do Claude"
    url: "https://platform.claude.com/docs/en/build-with-claude/structured-outputs"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Pydantic: Models"
    url: "https://docs.pydantic.dev/latest/concepts/models/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Aprendendo JSON Schema, passo a passo"
    url: "https://json-schema.org/learn/getting-started-step-by-step"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Instructor: saída estruturada com Pydantic"
    url: "https://python.useinstructor.com/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Saída estruturada é obrigar o LLM a responder num formato que o seu código entende, quase sempre JSON (um formato de dados com chaves e valores), em vez de texto livre. Você descreve o formato com um JSON Schema (uma descrição dos campos, seus tipos e valores permitidos) ou com um modelo Pydantic, e valida a resposta antes de usá-la.

## Por que importa para um AI Engineer

Código não sabe ler "A prioridade parece alta, eu diria". Ele precisa de `{"prioridade": "alta"}`. Quando a resposta tem formato garantido, o LLM deixa de ser um gerador de texto e vira uma função com contrato: entra um texto, sai um objeto com campos conhecidos que o resto do sistema consome. Isso também reduz alucinação, pois o espaço de respostas fica limitado a valores válidos.

## Como funciona

Há três camadas, da mais fraca à mais forte:

1. **Pedir no prompt:** "responda só com JSON neste formato". Funciona quase sempre, mas não sempre.
2. **Usar o recurso do provedor:** várias APIs (veja a documentação de structured outputs do provedor) aceitam um schema e restringem a geração para que a resposta obedeça a ele. Os recursos e nomes variam por provedor.
3. **Validar no seu código:** mesmo com as camadas anteriores, valide. Se falhar, tente de novo, mandando o erro de volta ao modelo.

O ciclo mais comum é "gerar, validar, tentar de novo". O exemplo abaixo usa Pydantic e uma função que simula o LLM (troque-a pela chamada real à API):

```python
import json
from typing import Literal
from pydantic import BaseModel, ValidationError
class Triagem(BaseModel):
    prioridade: Literal["baixa", "media", "alta"]
respostas = iter(['{"prioridade": "urgente"}', '{"prioridade": "alta"}'])
def chamar_llm(aviso):             # simulação: troque pela chamada real
    return next(respostas)
aviso = "Classifique a ordem."
for _ in range(3):
    try:
        print(Triagem(**json.loads(chamar_llm(aviso)))); break
    except (ValidationError, json.JSONDecodeError) as erro:
        aviso += f"\nFalhou: {erro}. Corrija."
```

A primeira resposta tem `"urgente"`, que não está entre os valores permitidos; o Pydantic recusa, o erro volta no prompt e a segunda tentativa passa. Limite o número de tentativas e decida o que fazer se todas falharem (registrar e encaminhar para uma pessoa).

Dica de modelagem: use `Literal` ou enumerações para campos de categoria, descreva cada campo com uma frase (o modelo lê as descrições do schema) e inclua uma opção como `"indefinido"` para casos em que ele não tem como saber.

## Na prática

No P4: Triagem de Ordens de Manutenção, cada ordem de texto livre vira um objeto com prioridade, máquina e tipo de falha, validado antes de entrar no banco. A mesma ideia sustenta o tool use (o modelo chama ferramentas passando argumentos em JSON) e as respostas de uma API FastAPI.

## Erros comuns

- **Confiar sem validar.** O formato quase sempre vem certo, e o dia em que não vem, o sistema quebra em produção.
- **Tentar de novo sem limite.** Defina um máximo e um plano B.
- **Schema complicado demais.** Campos aninhados e opções demais aumentam erros. Comece simples.
- **Não deixar uma saída para "não sei".** O modelo escolhe um valor qualquer para cumprir o schema.
- **Achar que formato correto significa conteúdo correto.** O JSON pode ser válido e a prioridade, errada; avalie o conteúdo com um conjunto de exemplos rotulados.

## Como estudar

1. Leia a introdução do JSON Schema e escreva à mão o schema de uma ordem (2 horas).
2. Faça o mesmo com um modelo Pydantic e gere o schema com `Triagem.model_json_schema()` (2 horas).
3. Rode o exemplo e acrescente um campo novo (2 horas).
4. Troque a simulação por uma chamada real e use o recurso de saída estruturada do provedor (1 dia).
5. Veja como o Instructor automatiza o ciclo de validação e nova tentativa (2 horas).

## Como mostrar

No portfólio, mostre o schema, exemplos de saída válida e a taxa de respostas que precisaram de nova tentativa, algo como "3 em 100 ordens" (número ilustrativo). Na entrevista, explique por que valida mesmo com o recurso do provedor e como trata a falha final.
