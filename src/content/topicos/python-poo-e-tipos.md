---
titulo: "POO e tipagem"
nivel: 1
grupo: "Programação (sem IA)"
ordem: 2
resumo: "Classes, composição, dataclasses, type hints e Pydantic. Quase todo SDK de IA é orientado a objetos, e a validação do Pydantic é a base de saída estruturada e de APIs com FastAPI."
tempo: "2 a 3 semanas"
ferramentas:
  - "Python"
  - "dataclasses"
  - "Pydantic"
prerequisitos:
  - "python-fundamentos"
relacionados:
  - "saida-estruturada"
  - "fastapi"
referencias:
  - titulo: "Tutorial oficial: Classes"
    url: "https://docs.python.org/pt-br/3/tutorial/classes.html"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
  - titulo: "dataclasses: documentação do Python"
    url: "https://docs.python.org/pt-br/3/library/dataclasses.html"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
  - titulo: "typing: suporte a type hints"
    url: "https://docs.python.org/pt-br/3/library/typing.html"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
  - titulo: "Pydantic: Models"
    url: "https://docs.pydantic.dev/latest/concepts/models/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

POO (programação orientada a objetos) organiza o código em classes: moldes que juntam dados e as funções que operam sobre eles. Tipagem é anotar o que cada variável ou função espera e devolve. O Python não obriga, mas as anotações (type hints, "dicas de tipo") documentam o código e permitem que ferramentas achem erros antes de rodar. O Pydantic é uma biblioteca que usa essas anotações para validar dados de verdade, em tempo de execução.

## Por que importa para um AI Engineer

Os SDKs de IA são feitos de classes: você cria um cliente, chama métodos e recebe objetos de resposta. Ler esse código sem entender classes é como usar um manual em outro idioma.

Há ainda um motivo prático. A resposta de um LLM (modelo de linguagem de grande porte) é texto, e texto pode vir malformado. O Pydantic transforma "um JSON qualquer" em um objeto com campos e tipos garantidos, ou levanta um erro claro. É a base da saída estruturada e do FastAPI, o framework (conjunto de ferramentas prontas) para criar APIs que você usa nos projetos.

## Como funciona

Uma **classe** descreve um tipo de coisa. Um **objeto** é uma instância concreta dela. Um **dataclass** é a forma curta de escrever uma classe que só guarda dados: o Python gera o construtor (`__init__`) e a impressão sozinho.

Sobre reaproveitar código, prefira **composição** a **herança**. Herança diz "é um" (um `Gato` é um `Animal`); composição diz "tem um" (um `Pedido` tem uma lista de `Itens`). Composição acopla menos e é mais fácil de mudar.

O exemplo mostra um dataclass e um modelo Pydantic lado a lado (instale com `pip install pydantic`):

```python
from dataclasses import dataclass
from pydantic import BaseModel, ValidationError
@dataclass
class Peca:
    codigo: str
    estoque: int
class Ordem(BaseModel):
    peca: str
    quantidade: int

print(Peca("A-10", "muitos"))        # aceita: dataclass não valida
try:
    Ordem(peca="A-10", quantidade="três")
except ValidationError as erro:
    print(erro.error_count(), "erro de validação")
```

O dataclass aceitou `"muitos"` num campo `int`, porque type hints sozinhos não verificam nada na execução. O Pydantic recusou `"três"` e disse qual campo falhou. Ele também converte quando faz sentido: `"3"` vira `3`.

## Na prática

No P1: Assistente da Montadora, você descreve com classes o que é uma mensagem, uma ferramenta e uma resposta. Na saída estruturada, o modelo Pydantic vira o contrato do que o LLM deve devolver. Em P2: RAG de Manuais Técnicos e nos demais, os endpoints do FastAPI recebem e devolvem modelos Pydantic, e a validação acontece de graça na entrada e na saída.

## Erros comuns

- **Herança para tudo.** Cadeias de classes ficam difíceis de seguir. Se a relação é "tem um", use composição.
- **Achar que type hints validam.** Sem Pydantic (ou outra checagem), uma anotação `int` não impede de passar texto.
- **Classe para o que é uma função.** Se não há dados para guardar, uma função basta.
- **Anotar tudo como `Any`.** Anula o benefício. Seja específico: `list[str]`, `dict[str, int]`, `str | None`.
- **Mutar um dataclass compartilhado sem perceber.** Quando os dados não devem mudar, use `@dataclass(frozen=True)`.

## Como estudar

1. Leia o tutorial oficial de classes e reescreva os exemplos (2 dias).
2. Converta um programa seu de funções soltas para classes pequenas (2 dias).
3. Anote um projeto antigo com type hints e rode o `mypy` (verificador de tipos) nele (2 dias).
4. Faça os exemplos de Models do Pydantic: campos opcionais, valores padrão, validadores (3 dias).
5. Abra o código de um SDK no GitHub e localize onde ficam as classes de resposta (1 dia).

## Como mostrar

No portfólio, use classes e modelos Pydantic nos projetos e mostre no README um exemplo de entrada inválida sendo recusada. Na entrevista, explique a diferença entre type hint e validação, e por que prefere composição à herança, com um exemplo do seu código.
