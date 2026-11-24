---
titulo: "Evolução dos modelos"
nivel: 1
grupo: "Fundamentos de LLM (sem matemática)"
ordem: 1
resumo: "Do modelo estatístico e da RNN ao Transformer, passando por pré-treino, ajuste por instrução, modelos de raciocínio e agentes. O foco é o que cada salto mudou para quem constrói sistemas."
tempo: "1 a 2 semanas"
ferramentas: []
prerequisitos: []
relacionados:
  - "tokens-e-janela-de-contexto"
  - "fine-tuning"
referencias:
  - titulo: "Karpathy: Intro to Large Language Models"
    url: "https://www.youtube.com/watch?v=zjkBMFhNj_g"
    tipo: "Vídeo"
    idioma: "en"
    gratuito: true
  - titulo: "3Blue1Brown: Transformers, the tech behind LLMs"
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
revisado: "2026-11-24"
rascunho: false
---

## O que é

Um LLM (large language model, modelo de linguagem de grande porte) é um programa treinado para prever o próximo pedaço de texto. Esse tópico conta, sem matemática, como se chegou até aqui: cada salto de técnica resolveu um limite do anterior e mudou o que dá para construir.

## Por que importa para um AI Engineer

Você não vai treinar um modelo do zero, mas precisa saber o que ele é e não é, para escolher bem e não esperar o que ele não entrega. Saber que o modelo foi treinado para continuar textos explica por que ele erra fatos com confiança. Saber a diferença entre modelo base e modelo ajustado por instrução explica por que um segue ordens e o outro apenas continua a frase.

Entender a linha do tempo também ajuda a ler notícias e documentação sem se perder em siglas.

## Como funciona

Pense numa escada de saltos:

1. **Modelos estatísticos.** Contavam quais palavras costumam vir depois de quais (o corretor do celular antigo). Curto alcance, sem noção de sentido.
2. **Redes neurais recorrentes (RNN).** Liam o texto palavra por palavra, guardando uma "memória". Entendiam melhor, mas esqueciam o começo de textos longos e eram lentas de treinar.
3. **Transformer e atenção.** Em 2017, a arquitetura Transformer deixou o modelo olhar o texto todo de uma vez e pesar quais partes importam para cada palavra. Isso permitiu treinar em muito mais dados e é a base de todos os LLMs atuais.
4. **Pré-treino.** O modelo lê uma enorme quantidade de texto prevendo a próxima palavra e aprende gramática, fatos e estilos. O resultado é o modelo base, que continua textos, mas não conversa.
5. **Ajuste por instrução e RLHF.** Treina-se com exemplos de pedidos e boas respostas, e depois com RLHF (reinforcement learning from human feedback, aprendizado com notas dadas por pessoas) para que o modelo seja útil e educado. É daí que vem o assistente de chat.
6. **Modelos abertos e fechados.** Fechados (como os do Claude e do GPT) são acessados por API. Abertos (como a família Llama) têm pesos publicados, e você pode rodá-los em sua máquina ou servidor, com mais controle e mais trabalho.
7. **Multimodais.** Além de texto, aceitam imagens, áudio e PDFs.
8. **Modelos de raciocínio.** Gastam mais tokens "pensando" antes de responder, o que melhora tarefas de lógica e código, com mais custo e demora.
9. **Agentes.** O modelo passa a decidir passos e chamar ferramentas num laço, em vez de só responder uma vez.

Uma analogia: o pré-treino é a faculdade inteira; o ajuste por instrução é o treinamento de atendimento ao cliente; o RLHF é o feedback dos supervisores.

O que muda para quem constrói: quanto mais acima na escada, mais você troca código por instruções, e mais precisa medir o resultado, porque o comportamento é probabilístico.

## Na prática

No P1: Assistente da Montadora, você usa um modelo ajustado por instrução por API, e a escolha entre modelo rápido e barato ou modelo de raciocínio é uma decisão de custo e qualidade. No PF: Agente Completo, o padrão de agente com ferramentas aparece de ponta a ponta. Os nomes e as versões dos modelos mudam a cada poucos meses; os conceitos acima mudam bem mais devagar, e são eles que valem a pena estudar.

## Erros comuns

- **Tratar o modelo como banco de dados de fatos.** Ele foi treinado para continuar texto, não para consultar uma fonte. Veja o tópico de alucinação.
- **Decorar nomes de modelos.** A lista vira velha rápido. Aprenda as categorias (aberto ou fechado, com ou sem raciocínio, multimodal) e consulte a documentação do provedor.
- **Usar o modelo mais caro para tudo.** Tarefas simples cabem em modelos menores.
- **Achar que o modelo "sabe o que acabou de acontecer".** O pré-treino tem data de corte, e o que veio depois ele não conhece sem ajuda de busca.
- **Confundir agente com chatbot.** Agente age e decide passos; chatbot responde.

## Como estudar

1. Veja o vídeo de Karpathy, que cobre pré-treino e ajuste (1 hora, mais anotações).
2. Veja o vídeo da 3Blue1Brown sobre Transformers e pare nos trechos de atenção (1 hora).
3. Escreva em dez linhas, com suas palavras, a escada de saltos acima (1 dia).
4. Leia a introdução e as figuras de "Attention Is All You Need", ignorando as fórmulas (2 horas).
5. Leia "Building effective agents" para ver onde agentes entram (2 horas).

## Como mostrar

No portfólio, uma seção do README do projeto explica por que você escolheu certo tipo de modelo (aberto ou fechado, com ou sem raciocínio) e o que trocaria. Na entrevista, explique em um minuto a diferença entre modelo base, ajustado por instrução e de raciocínio, usando um exemplo seu.
