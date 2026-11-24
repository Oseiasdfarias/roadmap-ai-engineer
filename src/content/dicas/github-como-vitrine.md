---
titulo: "GitHub como vitrine"
fase: 1
grupo: "Fundamentos"
ordem: 1
resumo: "Transforme o GitHub no seu portfólio: README de perfil, projetos fixados, READMEs claros e commits frequentes. É o primeiro lugar onde um recrutador técnico confere o que você sabe fazer."
relacionados:
  - "linkedin-desde-ja"
  - "curriculo"
referencias:
  - titulo: "GitHub Docs: README do perfil"
    url: "https://docs.github.com/pt/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
  - titulo: "GitHub Docs: Pinning items to your profile"
    url: "https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/pinning-items-to-your-profile"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "GitHub Docs: About READMEs"
    url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

O GitHub é a plataforma onde você guarda código com histórico de versões (Git). Para quem busca vaga em tecnologia, ele funciona como portfólio: mostra o que você construiu, como escreve e com que frequência trabalha. Uma vitrine boa tem três peças: o perfil, os projetos fixados e o README (arquivo de apresentação) de cada repositório.

## Por que importa

Quem recruta para vagas técnicas pode abrir o GitHub depois do currículo, e a leitura tende a ser rápida. Um perfil vazio ou cheio de repositórios sem explicação não ajuda. Um perfil com poucos projetos bem apresentados responde sozinho a perguntas que o currículo não cobre: o código roda? Há testes? A pessoa explica as decisões?

O GitHub não substitui a entrevista, e ninguém vai ler todo o seu código. O que você controla é a primeira impressão.

## Passo a passo

1. **Crie o repositório de perfil.** Crie um repositório público com o seu nome de usuário. O README dele aparece no topo do seu perfil. Escreva quem você é, o que estuda e links para LinkedIn e e-mail, em dez linhas.
2. **Fixe de dois a quatro projetos.** Fixe os que mostram mais trabalho e deixe de fora exercícios de curso soltos.
3. **Escreva um README em cada projeto fixado.** Inclua o problema que ele resolve, como rodar (comandos que funcionem de verdade), uma captura de tela ou exemplo de uso e as decisões principais.
4. **Faça commits pequenos e frequentes**, com mensagem que diga o que mudou. Uma sequência de dezenas de commits "update" não ensina nada a quem lê.
5. **Use branches (linhas paralelas de trabalho) e pull requests (pedidos para juntar uma branch ao código principal) mesmo trabalhando sozinho.** Mostra que você conhece o fluxo de equipe.
6. **Nunca suba segredos.** Chaves de API e arquivos `.env` ficam fora do Git. Se subiu por engano, revogue a chave, porque apagar o commit não basta.
7. **Revise a cada mês.** Arquive o que ficou velho e atualize o que você fixou.

## Exemplo

README de projeto, antes:

> # chatbot
> Projeto de IA com Python.

Depois (exemplo ilustrativo):

> # Busca em manuais técnicos
> Responde perguntas sobre manuais públicos de equipamentos industriais e cita o manual e a página.
>
> **Como rodar:** `docker compose up`, depois abra `localhost:8000`.
> **Decisão:** usei busca por palavra-chave junto com a busca por significado, porque códigos de falha como "E014" não aparecem na busca por significado.
> **Resultado:** em 20 perguntas de teste, o trecho certo apareceu entre os cinco primeiros em 85% dos casos (números ilustrativos, use os seus).

A versão nova diz o problema, o comando de execução e uma decisão com resultado medido. Quem lê em 30 segundos já sabe se vale abrir o código.

## Erros comuns

- **Fixar repositórios sem README.** O recrutador não vai adivinhar o que o projeto faz.
- **Copiar projeto de tutorial sem mudar nada.** Deixe claro o que é seu: acrescente uma função, um teste ou uma decisão documentada.
- **Fazer commit de segredos e dados pessoais.** Isso expõe você e terceiros e é difícil de desfazer.
- **Esperar o projeto ficar perfeito para publicar.** Publique cedo e melhore por commits.
- **Contar só com a barra de contribuições.** Atividade ajuda, mas o que convence é o README e o código legível.

## Checklist

- Repositório de perfil criado, com README curto.
- De dois a quatro projetos fixados.
- Cada projeto fixado tem README com problema, como rodar e decisões.
- Os comandos do README foram testados numa pasta limpa.
- Nenhum segredo ou dado pessoal no histórico.
- Mensagens de commit descrevem a mudança.
- Link do GitHub no currículo e no LinkedIn.
