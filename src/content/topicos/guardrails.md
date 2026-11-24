---
titulo: "Guardrails"
nivel: 2
grupo: "Qualidade e proteção"
ordem: 2
resumo: "Verificações antes e depois do modelo: escopo e política na entrada, formato e conteúdo na saída. Veja o que as ferramentas existentes cobrem e por que guardrails reduzem risco sem eliminá-lo."
tempo: "1 a 2 semanas"
ferramentas:
  - "Python"
  - "Pydantic"
  - "NeMo Guardrails"
prerequisitos:
  - "saida-estruturada"
relacionados:
  - "prompt-injection"
  - "human-in-the-loop"
  - "evals"
referencias:
  - titulo: "NVIDIA NeMo Guardrails"
    url: "https://github.com/NVIDIA/NeMo-Guardrails"
    tipo: "Repositório"
    idioma: "en"
    gratuito: true
  - titulo: "Llama Guard: LLM-based Input-Output Safeguard for Human-AI Conversations (Inan et al., 2023)"
    url: "https://arxiv.org/abs/2312.06674"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Mitigate jailbreaks and prompt injections: documentação da API do Claude"
    url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Guardrails (em português, "barreiras de proteção") são verificações que você coloca antes e depois da chamada ao modelo para manter o sistema dentro do que ele deve fazer. Na entrada, checam escopo e política. Na saída, checam formato, conteúdo e se a resposta pode seguir adiante.

## Por que importa para um AI Engineer

Um prompt bem escrito não garante comportamento: o modelo pode sair do assunto, vazar dados, responder com formato quebrado ou dizer algo que a empresa não pode dizer. Guardrails transformam regras em código que você testa e mede, em vez de pedir ao modelo "por favor, não faça isso".

## Como funciona

Pense em duas camadas em volta do modelo:

- **Entrada:** a pergunta está no escopo do assistente? Tem dado pessoal que deveria ser mascarado? Há tentativa de manipular as instruções? Tamanho e formato estão dentro do limite?
- **Saída:** o JSON é válido e tem os campos exigidos? A resposta cita a fonte? Contém algo proibido (dado pessoal, conselho fora da política)? Se falhar, você bloqueia, pede nova tentativa ou envia a um humano.

Os métodos vão do simples ao sofisticado: regras e expressões regulares, validação de esquema (com Pydantic, como em saída estruturada), um classificador (como o Llama Guard, um modelo treinado para classificar entradas e saídas como seguras ou não) e uma chamada extra a um LLM como verificador.

```python
import json

def guarda_entrada(texto, temas=("compressor", "ordem", "peça", "erro")):  # escopo ilustrativo
    return len(texto) <= 2000 and any(t in texto.lower() for t in temas)

def guarda_saida(texto):
    try:
        dados = json.loads(texto)
    except ValueError:
        return False
    return isinstance(dados, dict) and {"resposta", "fonte"} <= dados.keys()
```

A checagem de escopo por palavras é grosseira: serve para entender o desenho, não para produção, onde um classificador ou um LLM verificador faz melhor. Ferramentas existentes cobrem partes do problema: o NeMo Guardrails (da NVIDIA) define regras de conversa programáveis, e a documentação da API do Claude descreve técnicas de mitigação. Avalie cada ferramenta no seu caso, medindo o que ela deixa passar e o que bloqueia sem necessidade.

**O limite.** Guardrails reduzem o risco e não o eliminam. Um verificador baseado em modelo também erra, e quem ataca testa variações até passar. Contra prompt injection, a defesa principal é limitar o que o sistema pode fazer, não só filtrar texto. Cada verificação soma latência e, se usar um LLM, custo.

## Na prática

No P1: Assistente da Montadora, a camada de guardrails barra perguntas fora do escopo da montadora e valida o formato da resposta antes de entregá-la. Posicione as verificações também em volta das ferramentas: antes de executar uma, cheque os argumentos; depois, cheque o resultado. Para as ações de risco, some o human-in-the-loop.

## Erros comuns

- **Achar que o guardrail resolve o problema.** Ele é uma camada, não a defesa inteira.
- **Bloquear demais.** Falsos positivos irritam o usuário; meça-os no golden set.
- **Não testar o guardrail.** Monte casos de ataque e de uso legítimo e rode a cada mudança (veja evals).
- **Só checar a entrada.** O modelo pode produzir algo indevido de uma entrada legítima.
- **Regra frágil.** Lista de palavras proibidas é fácil de contornar.

## Como estudar

1. Leia a página de mitigação de jailbreaks da documentação do Claude (1 hora).
2. Implemente as duas funções acima para o seu assistente (meio dia).
3. Crie 20 entradas fora do escopo e 20 legítimas e meça erros dos dois tipos (1 dia).
4. Teste o NeMo Guardrails num exemplo pequeno (2 dias).
5. Leia o resumo do Llama Guard e compare com a sua regra (2 horas).

## Como mostrar

No README, descreva as camadas de entrada e saída, os casos de teste e o que cada guardrail pega e deixa passar, com números. Na entrevista, explique por que guardrails não bastam e o que você colocaria além deles.
