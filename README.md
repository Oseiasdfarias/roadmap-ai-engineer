# Roadmap AI Engineer

Um roadmap em português para virar AI Engineer, com **estudo e carreira lado a lado**. São quatro níveis de estudo, do primeiro script em Python a um agente em produção, e cinco fases de carreira, de GitHub e LinkedIn até candidaturas com foco. Cada tópico traz explicação, prática, erros comuns e referências escolhidas a dedo. O progresso é marcado no navegador, sem conta.

Site: https://oseiasdfarias.github.io/roadmap-ai-engineer/

## Como rodar

Requer Node.js 22 ou mais novo.

```bash
npm ci
npm run dev        # servidor local em http://localhost:4321/roadmap-ai-engineer/
npm run build      # gera dist/ e o índice de busca (Pagefind)
npm run preview    # serve o dist/ gerado
```

Verificações:

```bash
npm run check          # tipos (astro check)
npm test               # testes unitários (Vitest)
npm run lint:conteudo  # modelos de texto, tamanhos, slugs e emoji
npm run test:e2e       # testes de ponta a ponta (Playwright, usa o Google Chrome instalado)
npm run verificar:links  # confere as URLs externas do conteúdo
```

## Estrutura

```
src/content/    textos em Markdown: topicos, dicas (carreira), projetos, niveis, fases
src/pages/      rotas do site (mapa, nivel, fase, topico, carreira, projeto, sobre, og)
src/components/ componentes Astro
src/layouts/    layouts base e de item
src/scripts/    JavaScript do navegador (tema, progresso, painel, busca)
src/lib/        funções de conteúdo, URLs e prévias sociais
src/styles/     tokens de tema e estilos
scripts/        lint de conteúdo, verificação de links e geração de ilustrações
tests/          testes unitários e e2e
.github/        publicação no GitHub Pages e modelos de issue
```

## Como contribuir

A contribuição, por enquanto, é por issues: correções de conteúdo, links quebrados e sugestões de referências. Veja o [CONTRIBUTING.md](CONTRIBUTING.md) e abra uma issue em https://github.com/Oseiasdfarias/roadmap-ai-engineer/issues/new/choose.

## Licenças

- Código: [MIT](LICENSE).
- Conteúdo (textos e ilustrações): [CC BY 4.0](LICENSE-CONTEUDO.md), com crédito a Oséias Farias.

## Autor

Oséias Farias, Machine Learning & AI Engineer · MLOps. [Portfólio](https://oseiasdfarias.github.io/) · [LinkedIn](https://www.linkedin.com/in/oseiasfarias/) · [GitHub](https://github.com/Oseiasdfarias) · [Medium](https://medium.com/@oseiasfarias) · [YouTube](https://www.youtube.com/@otensor)
