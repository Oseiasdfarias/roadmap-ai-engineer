---
titulo: "Python: fundamentals"
nivel: 1
grupo: "Programming (without AI)"
ordem: 1
resumo: "Types, lists, dictionaries, functions, files and exceptions, plus basic algorithms. Write the code yourself at this stage: that is how you learn to reason and, later, to review what AI generates."
tempo: "6 to 10 weeks"
ferramentas:
  - "Python 3"
  - "VS Code"
prerequisitos: []
relacionados:
  - "python-poo-e-tipos"
  - "terminal-e-ambientes"
referencias:
  - titulo: "Curso em Vídeo: Python (in Portuguese)"
    url: "https://www.cursoemvideo.com/"
    tipo: "Curso"
    idioma: "pt"
    gratuito: true
  - titulo: "CS50P: Introduction to Programming with Python (Harvard)"
    url: "https://cs50.harvard.edu/python/"
    tipo: "Curso"
    idioma: "en"
    gratuito: true
  - titulo: "The Python Tutorial"
    url: "https://docs.python.org/3/tutorial/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

Python is the language in which almost all AI code is written, from SDKs (development kits that companies publish to call their models) to the examples in the documentation. In this topic you learn the core of the language: data types, collections, functions, control flow, files, exceptions and a few basic algorithms.

## Why it matters for an AI Engineer

An AI Engineer spends most of their time connecting pieces: read a file, clean the text, call an API, validate the answer, store the result. All of that is ordinary Python. Without a solid base, you cannot debug (find and fix errors) or review what a coding assistant generates.

That is why the rule of this level is to write the code yourself. An AI hands you a finished program in seconds, but someone who has never written a loop with their own hands does not notice when the generated code is wrong. AI comes in later, as a tool for people who can already read what it produces.

## How it works

Think in four blocks:

- **Values and types:** numbers (`int`, `float`), text (`str`), true or false (`bool`).
- **Collections:** `list` (an ordered sequence you can change), `dict` (key and value pairs, like a record card), `set` (items without repetition) and `tuple` (a fixed sequence). The choice depends on the question: do I need order? Lookup by name? Removing duplicates?
- **Functions and flow:** `def` groups a reusable step; `if`, `for` and `while` decide and repeat.
- **Files and errors:** reading and writing text, CSV (a spreadsheet in plain text) and JSON (the data format used by almost every API); `try/except` handles what can fail, such as a file that does not exist.

A short example that runs with the standard library only. It counts how many times each word appears in a text:

```python
def count_words(text):
    counts = {}
    for word in text.lower().split():
        word = word.strip(".,!?")
        counts[word] = counts.get(word, 0) + 1
    return counts

try:
    with open("notes.txt", encoding="utf-8") as f:
        result = count_words(f.read())
    print(sorted(result.items(), key=lambda p: p[1], reverse=True)[:5])
except FileNotFoundError:
    print("Create the notes.txt file first.")
```

Here dict, function, loop, file and exception show up together. Basic algorithms (search, sorting, recursion, which is a function calling itself) train your reasoning: practice them in small exercises, without copying the solution.

## In practice

You use this core in every roadmap project: in P1: Automaker Assistant, you read manual files and build the message history; in P2: Technical Manuals RAG, you split texts and organize metadata in dictionaries; in P4: Maintenance Work Order Triage, you read orders from CSV and handle malformed rows with exceptions.

## Common mistakes

- **Jumping straight to AI.** Asking for finished code without understanding each line creates a dependency that shows up in the technical interview, when you are asked to write code live.
- **Only watching lessons.** Programming is learned by typing and making mistakes. For each lesson, do an exercise of your own.
- **Choosing the wrong collection.** Searching for an item in a long list is slow; in a `dict` or `set` it is fast. Always ask how you will query the data.
- **Hiding errors with a bare `except:`.** Handle the specific exception and log what happened.

## How to study

1. Take CS50P (or Curso em Vídeo, in Portuguese) up to functions and files (4 to 6 weeks).
2. Solve 20 small exercises without looking at the solution (2 weeks).
3. Write a program that reads a CSV, summarizes the data and writes a JSON (1 week).
4. Implement binary search and a simple sort and compare times with `time` (3 to 4 days).
5. Read the official tutorial sections on data structures and errors (2 days).

## How to show it

In your portfolio, publish on GitHub a repository of exercises and a small useful program, with a README explaining the problem and how to run it. In the interview, be ready to write a function live and explain why you chose a `dict` or a `list`. Saying "I wrote it without AI and then compared it with the assistant's solution" shows method.
