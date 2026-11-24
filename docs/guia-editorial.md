# Guia editorial

Vale para todo o conteúdo do roadmap (tópicos, dicas, projetos, níveis e fases). O comando `npm run lint:conteudo` verifica o que dá para automatizar: seções do modelo, faixa de palavras, tamanho do resumo, slugs existentes e ausência de emoji.

## Voz e estilo

- Português do Brasil, segunda pessoa ("você"), frases curtas, voz ativa.
- Termo técnico em inglês quando é o termo de mercado (RAG, embeddings, prompt injection), explicado na primeira ocorrência.
- Sem emoji, sem exclamação de marketing, sem "incrível", "poderoso", "revolucionário".
- Nada de promessa de emprego, salário ou prazo garantido; prazos sempre indicativos.

## Fontes e links

- Todo link verificado (HTTP 200 ou redirecionamento válido) e com fonte primária quando existir (documentação oficial, autor original).
- Afirmação factual sobre mercado ou regulação com fonte nas referências; regulação (LGPD) sem tom de aconselhamento jurídico.

## Código de exemplo

- Curto (até cerca de 15 linhas), em Python, funcionando, sem chave de API real.

## Consistência

- Os projetos P1 a PF e os níveis são citados pelos nomes definidos no inventário (P1: Assistente da Montadora, P2: RAG de Manuais Técnicos, P3: Servidor MCP de Manuais, P4: Triagem de Ordens de Manutenção, PF: Agente Completo).
- Nenhuma referência a pessoa específica além do autor.

## Modelos de texto

### Tópico de estudo (400 a 800 palavras)

Seções H2, nesta ordem:

1. `O que é`
2. `Por que importa para um AI Engineer`
3. `Como funciona` (com um exemplo concreto: trecho de código curto, diagrama em texto ou cenário)
4. `Na prática` (onde aparece num sistema real e nos projetos deste roadmap)
5. `Erros comuns`
6. `Como estudar` (passo a passo com tempo estimado)
7. `Como mostrar` (no portfólio e na entrevista)

Referências e relacionados vêm do frontmatter; a página monta os cards.

### Dica de carreira (350 a 700 palavras)

1. `O que é`
2. `Por que importa`
3. `Passo a passo`
4. `Exemplo` (antes e depois: um título de LinkedIn, uma linha de currículo, uma resposta STAR)
5. `Erros comuns`
6. `Checklist`

### Projeto (500 a 900 palavras)

`O problema`, `Arquitetura`, `Versões em camadas` (quando houver), `Stack sugerida`, `Critérios de aceite`, `O que colocar no README`, `Como apresentar na entrevista`.

## Frontmatter

- `resumo`: 140 a 240 caracteres, em português simples; aparece no painel, na prévia social e na meta description.
- `referencias`: cada item com `titulo`, `url` (https), `tipo` (Vídeo, Curso, Docs, Artigo, Repositório, Vagas ou Livro), `idioma` (`pt` ou `en`) e `gratuito`.
- `prerequisitos` e `relacionados`: só slugs que existem.
- `revisado`: data da última revisão.
- `rascunho: true` marca itens ainda não escritos; o lint estrito os recusa, e o modo `--rascunho` os aceita.
