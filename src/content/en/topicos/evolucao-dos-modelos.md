---
titulo: "Evolution of the models"
nivel: 1
grupo: "LLM fundamentals (no math)"
ordem: 1
resumo: "From statistical models and RNNs to the Transformer, through pre-training, instruction tuning, reasoning models and agents. The focus is on what each leap changed for the people who build systems."
tempo: "1 to 2 weeks"
ferramentas: []
prerequisitos: []
relacionados:
  - "tokens-e-janela-de-contexto"
  - "fine-tuning"
referencias:
  - titulo: "Intro to Large Language Models (video)"
    url: "https://www.youtube.com/watch?v=zjkBMFhNj_g"
    tipo: "Vídeo"
    idioma: "en"
    gratuito: true
  - titulo: "Transformers, the tech behind LLMs (video)"
    url: "https://www.youtube.com/watch?v=wjZofJX0v4M"
    tipo: "Vídeo"
    idioma: "en"
    gratuito: true
  - titulo: "Attention Is All You Need (Vaswani et al., 2017)"
    url: "https://arxiv.org/abs/1706.03762"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Building effective agents"
    url: "https://www.anthropic.com/research/building-effective-agents"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

An LLM (large language model) is a program trained to predict the next piece of text. This topic tells, without math, how we got here: each leap in technique solved a limit of the previous one and changed what can be built.

## Why it matters for an AI Engineer

You will not train a model from scratch, but you need to know what it is and is not, to choose well and not expect what it cannot deliver. Knowing the model was trained to continue texts explains why it gets facts wrong with confidence. Knowing the difference between a base model and an instruction-tuned model explains why one follows orders and the other just continues the sentence.

Understanding the timeline also helps you read news and documentation without getting lost in acronyms.

## How it works

Think of a ladder of leaps:

1. **Statistical models.** They counted which words usually follow which (the old phone autocorrect). Short range, no sense of meaning.
2. **Recurrent neural networks (RNNs).** They read text word by word, keeping a "memory". They understood better, but forgot the beginning of long texts and were slow to train.
3. **Transformer and attention.** In 2017, the Transformer architecture let the model look at the whole text at once and weigh which parts matter for each word. That made it possible to train on much more data, and it is the base of every current LLM.
4. **Pre-training.** The model reads an enormous amount of text predicting the next word and learns grammar, facts and styles. The result is the base model, which continues texts but does not hold a conversation.
5. **Instruction tuning and RLHF.** It is trained on examples of requests and good answers, and then with RLHF (reinforcement learning from human feedback, learning from ratings given by people) so it becomes helpful and polite. That is where the chat assistant comes from.
6. **Open and closed models.** Closed ones (such as Claude's and GPT's) are accessed through an API. Open ones (such as the Llama family) have published weights, and you can run them on your machine or server, with more control and more work.
7. **Multimodal models.** Besides text, they accept images, audio and PDFs.
8. **Reasoning models.** They spend more tokens "thinking" before answering, which improves logic and coding tasks, at more cost and delay.
9. **Agents.** The model starts deciding steps and calling tools in a loop, instead of answering just once.

An analogy: pre-training is the whole college degree; instruction tuning is customer service training; RLHF is feedback from supervisors.

What changes for builders: the higher up the ladder, the more you trade code for instructions, and the more you need to measure the result, because behavior is probabilistic.

## In practice

In P1: Automaker Assistant, you use an instruction-tuned model through an API, and choosing between a fast, cheap model and a reasoning model is a cost and quality decision. In PF: Complete Agent, the agent-with-tools pattern shows up end to end. Model names and versions change every few months; the concepts above change much more slowly, and those are what is worth studying.

## Common mistakes

- **Treating the model as a database of facts.** It was trained to continue text, not to look up a source. See the hallucination topic.
- **Memorizing model names.** The list gets outdated fast. Learn the categories (open or closed, with or without reasoning, multimodal) and check the provider's documentation.
- **Using the most expensive model for everything.** Simple tasks fit in smaller models.
- **Thinking the model "knows what just happened".** Pre-training has a cutoff date, and the model does not know what came after without the help of search.
- **Confusing an agent with a chatbot.** An agent acts and decides steps; a chatbot answers.

## How to study

1. Watch the intro to LLMs video, which covers pre-training and tuning (1 hour, plus notes).
2. Watch the Transformers video and pause on the attention parts (1 hour).
3. Write, in ten lines and in your own words, the ladder of leaps above (1 day).
4. Read the introduction and figures of "Attention Is All You Need", skipping the formulas (2 hours).
5. Read "Building effective agents" to see where agents come in (2 hours).

## How to show it

In your portfolio, a section of the project README explains why you chose a certain type of model (open or closed, with or without reasoning) and what you would change. In the interview, explain in one minute the difference between a base model, an instruction-tuned model and a reasoning model, using an example of your own.
