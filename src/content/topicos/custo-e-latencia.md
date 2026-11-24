---
titulo: "Custo e latência"
nivel: 2
grupo: "Qualidade e proteção"
ordem: 5
resumo: "Escolha o modelo por etapa, use prompt caching, streaming e batch, e meça o custo por requisição e a latência p95. Otimizar sem medir antes e depois com os mesmos evals é adivinhação."
tempo: "1 semana"
ferramentas:
  - "Python"
  - "Prompt caching"
  - "Batch API"
prerequisitos:
  - "tokens-e-janela-de-contexto"
relacionados:
  - "engenharia-de-contexto"
  - "observabilidade"
  - "evals"
referencias:
  - titulo: "Prompt caching: documentação da API do Claude"
    url: "https://platform.claude.com/docs/en/build-with-claude/prompt-caching"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Batch processing: documentação da API do Claude"
    url: "https://platform.claude.com/docs/en/build-with-claude/batch-processing"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Reducing latency: documentação da API do Claude"
    url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Custo é quanto cada chamada ao LLM (modelo de linguagem) custa, em geral cobrada por token (a unidade de texto) de entrada e de saída. Latência é o tempo até a resposta chegar. Os dois crescem com o tamanho do contexto, o tamanho do modelo e o número de chamadas, e precisam ser medidos, não supostos.

## Por que importa para um AI Engineer

Um protótipo barato com poucos usuários pode se tornar inviável em produção, e uma resposta de 15 segundos derruba o uso. Escolhas de arquitetura, como workflow em vez de agente ou um modelo menor para classificar, mudam o custo por ordens de grandeza. Preços e limites variam por provedor e mudam com o tempo, então consulte sempre a tabela oficial atual.

## Como funciona

**Meça primeiro.** Registre, por requisição, tokens de entrada e saída (a resposta da API informa), custo calculado, tempo total e tempo até o primeiro token. Em média, a latência engana: use percentis. O p95 é o tempo abaixo do qual ficam 95% das requisições, e mostra a experiência dos casos lentos.

```python
import statistics

def custo(tok_in, tok_out, preco_in=3.0, preco_out=15.0):   # preços ilustrativos, US$ por 1 milhão de tokens
    return (tok_in * preco_in + tok_out * preco_out) / 1_000_000

lat = [0.8, 1.1, 0.9, 4.2, 1.0, 1.2, 0.9, 1.1, 1.0, 0.8,
       1.3, 1.0, 0.9, 1.1, 1.2, 1.0, 0.9, 1.0, 1.1, 5.0]    # segundos, dados ilustrativos
print(round(custo(2000, 500), 4))                           # 0.0135 (US$, com os preços de exemplo)
print(statistics.median(lat), statistics.quantiles(lat, n=20)[18])   # mediana 1.0, p95 4.96
```

Com poucas amostras, o p95 fica perto do maior valor; num sistema real use centenas de requisições. Note como a mediana (1,0 s) esconde as chamadas de 4 a 5 segundos.

**As alavancas:**

- **Modelo por etapa.** Modelos menores classificam e extraem; o maior fica para o raciocínio difícil.
- **Prompt caching.** Provedores permitem reaproveitar um começo de prompt repetido (instruções, documentos fixos) cobrando menos por essa parte e reduzindo o tempo. Exige que o trecho repetido venha no início e tem regras de tamanho mínimo e validade; leia a documentação.
- **Streaming.** Envia a resposta aos poucos. Não reduz o tempo total, mas o usuário vê texto cedo, o que melhora a espera percebida.
- **Batch.** Processamento em lote, assíncrono, para trabalho que não precisa de resposta imediata; costuma custar menos, com a resposta chegando depois.
- **Menos tokens.** Contexto enxuto (veja engenharia de contexto), saída curta com `max_tokens` e menos chamadas em sequência.

**Otimizar sem medir é adivinhação.** Antes de trocar o modelo ou cortar o contexto, rode o golden set (veja evals): se o custo caiu e a qualidade se manteve, a mudança vale; se a qualidade caiu, você sabe quanto pagou.

## Na prática

No P4: Triagem de Ordens de Manutenção, você compara um modelo pequeno e um grande por custo e qualidade nas mesmas ordens e mostra o antes e o depois no README. No PF: Agente Completo, o custo por requisição e o p95 aparecem no painel de observabilidade, e o alerta de custo avisa se algo sair do esperado. No P1: Assistente da Montadora, o streaming é o que faz a conversa parecer rápida.

## Erros comuns

- **Olhar só a média.** Ela esconde a cauda lenta.
- **Otimizar sem eval.** Um modelo menor pode economizar e piorar a resposta sem que você perceba.
- **Esquecer a saída.** Tokens de saída costumam custar mais e demoram mais que os de entrada.
- **Prompt caching mal posicionado.** Um dado variável no começo do prompt impede o reaproveitamento.
- **Copiar preços de um artigo.** Eles mudam; leia a página do provedor.

## Como estudar

1. Leia as páginas de caching, batch e latência da documentação (2 horas).
2. Registre tokens, custo e tempo de 50 chamadas do seu projeto (1 dia).
3. Calcule mediana e p95 e compare (meio dia).
4. Teste o caching com um prompt de sistema longo e veja o efeito nos tokens informados (1 dia).
5. Compare dois modelos no mesmo golden set por custo e qualidade (1 dia).

## Como mostrar

No README, traga uma tabela de custo por requisição, mediana e p95, antes e depois de cada otimização, com a qualidade medida nos mesmos evals. Na entrevista, explique por que usa p95 em vez de média e uma otimização que você descartou por piorar a qualidade.
