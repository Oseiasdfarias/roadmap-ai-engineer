---
titulo: "CI/CD"
nivel: 4
grupo: "Fundamentos antes de configurar"
ordem: 3
resumo: "GitHub Actions rodando testes e evals a cada pull request, construindo a imagem e fazendo deploy por ambiente. Uma mudança de prompt que piora o resultado deve falhar no pipeline, não em produção."
tempo: "1 a 2 semanas"
ferramentas:
  - "GitHub Actions"
  - "pytest"
  - "Docker"
prerequisitos:
  - "git-e-github"
  - "testes-e-evals-no-projeto"
relacionados:
  - "docker-local"
  - "seguranca-e-custo-na-nuvem"
referencias:
  - titulo: "GitHub Actions"
    url: "https://docs.github.com/pt/actions"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
  - titulo: "Promptfoo: integração com CI/CD"
    url: "https://www.promptfoo.dev/docs/integrations/ci-cd/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "GitHub: segredos no Actions"
    url: "https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

CI/CD significa integração contínua (continuous integration) e entrega contínua (continuous delivery ou deployment). Na CI, cada mudança no código dispara, de forma automática, a construção e os testes. Na CD, o que passou nos testes é publicado num ambiente (staging, para testar, ou produção). O GitHub Actions é o serviço do GitHub que executa esses fluxos, escritos em arquivos YAML dentro do repositório.

## Por que importa para um AI Engineer

Num sistema com LLM, o código não é a única coisa que muda: o prompt, o modelo e o chunking também. Qualquer um pode piorar as respostas sem que um teste comum perceba. Se os evals rodam no pipeline, uma mudança que derruba a qualidade falha antes de chegar ao usuário. Isso transforma "acho que melhorou" em "o resultado ficou em X, contra Y antes".

## Como funciona

Um workflow tem **gatilhos** (evento que o dispara, como abrir um pull request), **jobs** (blocos de trabalho) e **steps** (os passos de cada job). O exemplo roda testes e evals a cada pull request:

```yaml
on: pull_request
permissions:
  contents: read
jobs:
  testes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: "3.12"}
      - run: pip install -r requirements.txt
      - run: pytest
      - run: npx promptfoo@0.126.0 eval
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

O arquivo fica em `.github/workflows/`. As versões das actions (`@v4`, `@v5`) mudam; confira as atuais no repositório de cada uma. O `eval` termina com erro quando uma verificação falha, e o pull request fica marcado como reprovado.

**Segredos.** A chave do modelo vem de `secrets`, cadastrados nas configurações do repositório, nunca escritos no YAML. Pull requests de forks não recebem segredos, por segurança, então os evals que precisam da chave falham ou são pulados nelas; trate isso no workflow. O `permissions: contents: read` limita o token do workflow ao mínimo, e a versão fixa do Promptfoo evita que uma atualização mude o resultado sem aviso (confira a versão atual com `npm view promptfoo version`).

**Custo dos evals.** Evals chamam o modelo e custam. Rode os casos principais a cada pull request e o conjunto grande em horários programados, ou ao fundir na branch principal.

**Build e deploy.** Um segundo workflow, disparado ao fundir na `main`, constrói a imagem Docker, a publica num registro de imagens e atualiza o serviço na nuvem. As credenciais da nuvem também ficam em segredos, com permissão mínima (veja seguranca-e-custo-na-nuvem).

**Ambientes.** O GitHub permite ambientes (staging e production), cada um com seus segredos e, se quiser, uma aprovação manual antes do deploy em produção (revisores obrigatórios dependem da visibilidade do repositório e do plano). Uma sequência comum: pull request roda testes e evals; fusão na `main` faz deploy no staging; aprovação leva à produção.

## Na prática

No PF: Agente Completo, o pipeline roda os testes e os evals a cada pull request, constrói a imagem e faz o deploy na AWS. Você pode reaproveitar os evals do P2: RAG de Manuais Técnicos e do P4: Triagem de Ordens como parte do pipeline, e o mesmo `Dockerfile` do docker-local é o que o pipeline constrói.

## Erros comuns

- **Segredo no YAML ou no log.** Use `secrets` e nunca imprima o valor.
- **Evals de custo alto a cada commit.** Estabeleça um orçamento e um subconjunto para pull requests.
- **Pipeline lento demais.** Desenvolvedores passam a ignorá-lo; use cache de dependências e divida em jobs.
- **Deploy direto em produção** sem ambiente de teste e sem como voltar atrás.
- **Eval que nunca falha.** Se o limite é frouxo, o pipeline vira enfeite.

## Como estudar

1. Siga a introdução do GitHub Actions e crie um workflow que roda `pytest` (1 dia).
2. Cadastre um segredo e use-o num passo (meio dia).
3. Adicione o Promptfoo ao workflow e provoque uma falha com um prompt pior (1 dia).
4. Construa a imagem Docker no pipeline (1 dia).
5. Crie os ambientes staging e production com aprovação manual (1 dia).

## Como mostrar

No portfólio, o selo de status do workflow no topo do README e um pull request que foi reprovado por um eval mostram que o pipeline funciona. Na entrevista, conte como o pipeline barrou uma mudança de prompt, com os números antes e depois.
