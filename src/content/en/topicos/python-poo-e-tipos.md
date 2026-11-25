---
titulo: "OOP and typing"
nivel: 1
grupo: "Programming (without AI)"
ordem: 2
resumo: "Classes, composition, dataclasses, type hints and Pydantic. Almost every AI SDK is object-oriented, and Pydantic validation is the base of structured output and of APIs built with FastAPI."
tempo: "2 to 3 weeks"
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
  - titulo: "Official tutorial: Classes"
    url: "https://docs.python.org/3/tutorial/classes.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "dataclasses: Python documentation"
    url: "https://docs.python.org/3/library/dataclasses.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "typing: support for type hints"
    url: "https://docs.python.org/3/library/typing.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Pydantic: Models"
    url: "https://docs.pydantic.dev/latest/concepts/models/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

OOP (object-oriented programming) organizes code into classes: templates that bring together data and the functions that operate on it. Typing is annotating what each variable or function expects and returns. Python does not require it, but the annotations (type hints) document the code and let tools find errors before running. Pydantic is a library that uses these annotations to actually validate data, at runtime.

## Why it matters for an AI Engineer

AI SDKs are made of classes: you create a client, call methods and receive response objects. Reading that code without understanding classes is like using a manual in another language.

There is also a practical reason. An LLM's (large language model's) answer is text, and text can come back malformed. Pydantic turns "some JSON" into an object with guaranteed fields and types, or raises a clear error. It is the base of structured output and of FastAPI, the framework (a set of ready-made tools) for building APIs that you use in the projects.

## How it works

A **class** describes a kind of thing. An **object** is a concrete instance of it. A **dataclass** is the short way to write a class that only holds data: Python generates the constructor (`__init__`) and the printing for you.

When reusing code, prefer **composition** over **inheritance**. Inheritance says "is a" (a `Cat` is an `Animal`); composition says "has a" (an `Order` has a list of `Items`). Composition couples less and is easier to change.

The example shows a dataclass and a Pydantic model side by side (install with `pip install pydantic`):

```python
from dataclasses import dataclass
from pydantic import BaseModel, ValidationError
@dataclass
class Part:
    code: str
    stock: int
class Order(BaseModel):
    part: str
    quantity: int

print(Part("A-10", "lots"))           # accepted: dataclass does not validate
try:
    Order(part="A-10", quantity="three")
except ValidationError as error:
    print(error.error_count(), "validation error")
```

The dataclass accepted `"lots"` in an `int` field, because type hints alone check nothing at runtime. Pydantic rejected `"three"` and said which field failed. It also converts when it makes sense: `"3"` becomes `3`.

## In practice

In P1: Automaker Assistant, you describe with classes what a message, a tool and an answer are. In structured output, the Pydantic model becomes the contract for what the LLM must return. In P2: Technical Manuals RAG and the others, FastAPI endpoints receive and return Pydantic models, and validation happens for free on input and output.

## Common mistakes

- **Inheritance for everything.** Chains of classes get hard to follow. If the relationship is "has a", use composition.
- **Thinking type hints validate.** Without Pydantic (or another check), an `int` annotation does not stop you from passing text.
- **A class for what is a function.** If there is no data to hold, a function is enough.
- **Annotating everything as `Any`.** It cancels the benefit. Be specific: `list[str]`, `dict[str, int]`, `str | None`.
- **Mutating a shared dataclass without noticing.** When the data should not change, use `@dataclass(frozen=True)`.

## How to study

1. Read the official classes tutorial and rewrite the examples (2 days).
2. Convert a program of yours from loose functions to small classes (2 days).
3. Annotate an old project with type hints and run `mypy` (a type checker) on it (2 days).
4. Do the Pydantic Models examples: optional fields, default values, validators (3 days).
5. Open an SDK's code on GitHub and find where the response classes live (1 day).

## How to show it

In your portfolio, use classes and Pydantic models in the projects and show in the README an example of invalid input being rejected. In the interview, explain the difference between a type hint and validation, and why you prefer composition over inheritance, with an example from your code.
