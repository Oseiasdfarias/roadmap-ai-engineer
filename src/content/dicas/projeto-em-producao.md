---
titulo: "Projeto em produção"
fase: 4
grupo: "Transição para IA"
ordem: 2
resumo: "O projeto final no ar é a sua prova: link funcionando, custo conhecido, evals e arquitetura documentada. Mostra que você vai além da demonstração local, que é o que a maioria dos candidatos tem."
relacionados:
  - "puxar-tarefas-de-ia"
  - "contar-a-historia"
referencias:
  - titulo: "AWS Budgets: gerenciar custos"
    url: "https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Langfuse: documentação"
    url: "https://langfuse.com/docs"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "GitHub Actions: documentação"
    url: "https://docs.github.com/pt/actions"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

É colocar o projeto final do roadmap (PF: Agente Completo) no ar, em um endereço público, com o que se espera de um sistema real: custo medido, avaliação automática, rastreamento das respostas e arquitetura documentada. Produção aqui significa que outra pessoa abre o link e usa, sem você rodar nada.

## Por que importa

Um projeto que só roda no seu computador mostra que você sabe construir. Um projeto no ar mostra que você sabe operar: lidar com custo, falha, segredos e diagnóstico. Poucos candidatos mostram isso, e é o que aproxima o seu portfólio de trabalho profissional.

Um link no ar também cria obrigações, como custo e segurança. Tenha controles antes de publicar.

## Passo a passo

1. **Defina o escopo mínimo público.** Uma interface simples, uso limitado e dados sintéticos ou públicos.
2. **Proteja a conta antes de criar recursos.** Ative MFA (verificação em duas etapas), use permissões mínimas e configure um alerta de custo no AWS Budgets antes de qualquer outro recurso.
3. **Guarde segredos fora do código**, em variáveis de ambiente ou em um serviço de segredos.
4. **Automatize testes e evals com GitHub Actions.** Cada mudança deve rodar testes e avaliar a qualidade antes de ir ao ar.
5. **Publique com contêiner.** Empacote a aplicação em Docker e rode em um serviço gerenciado. O roadmap usa ECS na AWS.
6. **Ative rastreamento.** Use o Langfuse (ou similar) para ver entrada, saída, tokens, custo e latência de cada resposta.
7. **Limite o uso** com rate limit e um fallback de modelo, para uma onda de requisições não gerar uma conta alta.
8. **Documente a arquitetura** com diagrama, custo mensal medido e o que acontece quando algo falha.
9. **Grave uma demonstração curta** e coloque o link no README.

## Exemplo

README, antes:

> Projeto de agente de IA. Rode localmente com `python main.py`.

Depois (números ilustrativos):

> **Demo:** https://exemplo.dev (usuário de teste no README)
> **Arquitetura:** diagrama em `docs/arquitetura.png`
> **Custo medido:** cerca de US$ 12 por mês com 200 conversas de teste, com alerta em US$ 20.
> **Qualidade:** 42 de 50 casos do golden set aprovados (84%), rodando a cada pull request.
> **Diagnóstico:** cada resposta tem um rastro no Langfuse; veja `docs/diagnostico.md`.

A segunda versão responde as perguntas de quem avalia antes de elas serem feitas: está no ar? quanto custa? como sabe que funciona?

## Erros comuns

- **Publicar sem alerta de custo.** Um recurso esquecido ou um abuso pode gerar cobrança inesperada.
- **Deixar a chave de API num repositório público.**
- **Não ter limite de uso.** Qualquer pessoa pode esgotar a sua cota.
- **Link fora do ar na hora da entrevista.** Teste antes e tenha um vídeo de apoio.
- **Subir dados reais ou pessoais.**
- **Esquecer de desligar** o que não está em uso e continuar pagando.

## Checklist

- MFA e permissões mínimas na conta.
- Alerta de custo configurado antes de criar recursos.
- Segredos fora do código e do Git.
- CI com testes e evals a cada mudança.
- Rastreamento de respostas ativo.
- Rate limit e fallback implementados.
- README com link, arquitetura, custo e resultados dos evals.
- Link testado no dia da entrevista.
