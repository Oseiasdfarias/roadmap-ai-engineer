---
titulo: "Python: fundamentos"
nivel: 1
grupo: "Programação (sem IA)"
ordem: 1
resumo: "Tipos, listas, dicionários, funções, arquivos e exceções, mais algoritmos básicos. Escreva o código você mesmo nesta fase: é assim que se aprende a raciocinar e, depois, a revisar o que a IA gera."
tempo: "6 a 10 semanas"
ferramentas:
  - "Python 3"
  - "VS Code"
prerequisitos: []
relacionados:
  - "python-poo-e-tipos"
  - "terminal-e-ambientes"
referencias:
  - titulo: "Curso em Vídeo: Python"
    url: "https://www.cursoemvideo.com/"
    tipo: "Curso"
    idioma: "pt"
    gratuito: true
  - titulo: "CS50P: Introduction to Programming with Python (Harvard)"
    url: "https://cs50.harvard.edu/python/"
    tipo: "Curso"
    idioma: "en"
    gratuito: true
  - titulo: "O tutorial oficial de Python"
    url: "https://docs.python.org/pt-br/3/tutorial/"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Python é a linguagem em que quase todo código de IA é escrito, dos SDKs (kits de desenvolvimento que as empresas publicam para chamar seus modelos) aos exemplos das documentações. Neste tópico você aprende o núcleo da linguagem: tipos de dados, coleções, funções, controle de fluxo, arquivos, exceções e alguns algoritmos básicos.

## Por que importa para um AI Engineer

Um AI Engineer passa a maior parte do tempo ligando peças: lê um arquivo, limpa o texto, chama uma API, valida a resposta, grava o resultado. Tudo isso é Python comum. Sem o básico firme, você não consegue depurar (achar e corrigir erros) nem revisar o que um assistente de código gera.

Por isso a regra deste nível é escrever o código você mesmo. Uma IA entrega um programa pronto em segundos, mas quem nunca escreveu um laço (loop) com as próprias mãos não percebe quando o código gerado está errado. A IA entra mais tarde, como ferramenta de quem já sabe ler o que ela produz.

## Como funciona

Pense em quatro blocos:

- **Valores e tipos:** números (`int`, `float`), texto (`str`), verdadeiro ou falso (`bool`).
- **Coleções:** `list` (sequência ordenada, que você altera), `dict` (pares chave e valor, como uma ficha de cadastro), `set` (itens sem repetição) e `tuple` (sequência fixa). A escolha depende da pergunta: preciso de ordem? De busca por nome? De eliminar duplicatas?
- **Funções e fluxo:** `def` reúne um passo reutilizável; `if`, `for` e `while` decidem e repetem.
- **Arquivos e erros:** ler e gravar texto, CSV (planilha em texto puro) e JSON (formato de dados usado em quase toda API); `try/except` trata o que pode falhar, como um arquivo que não existe.

Exemplo curto, que roda só com a biblioteca padrão. Ele conta quantas vezes cada palavra aparece num texto:

```python
def contar_palavras(texto):
    contagem = {}
    for palavra in texto.lower().split():
        palavra = palavra.strip(".,!?")
        contagem[palavra] = contagem.get(palavra, 0) + 1
    return contagem

try:
    with open("notas.txt", encoding="utf-8") as f:
        resultado = contar_palavras(f.read())
    print(sorted(resultado.items(), key=lambda p: p[1], reverse=True)[:5])
except FileNotFoundError:
    print("Crie o arquivo notas.txt primeiro.")
```

Aqui aparecem dict, função, laço, arquivo e exceção juntos. Os algoritmos básicos (busca, ordenação, recursão, que é uma função chamando a si mesma) treinam o raciocínio: pratique-os em exercícios pequenos, sem copiar a solução.

## Na prática

Em todos os projetos do roadmap você usa esse núcleo: no P1: Assistente da Montadora, lê arquivos de manual e monta o histórico de mensagens; no P2: RAG de Manuais Técnicos, divide textos e organiza metadados em dicionários; no P4: Triagem de Ordens de Manutenção, lê ordens em CSV e trata linhas malformadas com exceções.

## Erros comuns

- **Pular direto para a IA.** Pedir o código pronto sem entender cada linha cria uma dependência que aparece na entrevista técnica, quando pedem para escrever ao vivo.
- **Só assistir aulas.** Programar se aprende digitando e errando. Para cada aula, faça um exercício seu.
- **Escolher a coleção errada.** Procurar um item numa lista longa é lento; num `dict` ou `set` é rápido. Pergunte sempre como você vai consultar os dados.
- **Esconder erros com `except:` vazio.** Trate a exceção específica e registre o que aconteceu.

## Como estudar

1. Faça o Curso em Vídeo ou o CS50P até funções e arquivos (4 a 6 semanas).
2. Resolva 20 exercícios pequenos sem consultar a solução (2 semanas).
3. Escreva um programa que lê um CSV, resume os dados e grava um JSON (1 semana).
4. Implemente busca binária e ordenação simples e compare tempos com `time` (3 a 4 dias).
5. Leia o tutorial oficial nas seções de estruturas de dados e erros (2 dias).

## Como mostrar

No portfólio, publique no GitHub um repositório de exercícios e um pequeno programa útil, com README que explica o problema e como rodar. Na entrevista, esteja pronto para escrever uma função ao vivo e explicar por que escolheu `dict` ou `list`. Dizer "escrevi sem IA e depois comparei com a solução do assistente" mostra método.
