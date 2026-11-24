---
titulo: "Teste prático"
fase: 3
grupo: "Desenvolvedor júnior"
ordem: 3
resumo: "O teste prático é o seu projeto de portfólio em miniatura: escopo bem lido, README claro, testes e decisões explicadas dentro do prazo. Saiba o que costuma ser avaliado e onde as pessoas tropeçam."
relacionados:
  - "entrevista-tecnica"
  - "github-como-vitrine"
referencias:
  - titulo: "pytest: Get Started"
    url: "https://docs.pytest.org/en/stable/getting-started.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "GitHub Docs: About READMEs"
    url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "FastAPI: Tutorial"
    url: "https://fastapi.tiangolo.com/pt/tutorial/"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

O teste prático (também chamado de desafio técnico ou take-home) é uma tarefa que a empresa envia para você resolver em casa, em um prazo de alguns dias. Costuma pedir uma pequena API (a documentação do FastAPI nas referências ajuda a montar uma), um script de dados ou uma funcionalidade com LLM, e a entrega vai num repositório com instruções para rodar.

## Por que importa

Pode ser uma etapa de peso, porque mostra como você trabalha sozinho: lê o escopo, organiza o código, testa e comunica. Em geral quem avalia começa pelo README, tenta rodar o projeto e só depois olha o código. Um projeto que não roda ou não explica o que fez tende a perder pontos logo no início.

Os critérios variam por empresa, e uma boa entrega não garante avanço. Mas as falhas mais comuns são evitáveis.

## Passo a passo

1. **Leia o enunciado duas vezes e liste os requisitos**, marcando o que é obrigatório e o que é opcional. Se algo estiver ambíguo, pergunte e registre a resposta. Pergunte também se o uso de assistentes de IA é permitido e como declarar esse uso; siga a regra da empresa.
2. **Combine o prazo e planeje o tempo.** Reserve a primeira parte para o essencial funcionando e o fim para README e testes.
3. **Faça o mínimo que atende ao escopo, bem feito.** Evite acrescentar funcionalidades que ninguém pediu.
4. **Organize o código**: nomes claros, funções pequenas e uma estrutura de pastas simples.
5. **Escreva testes** para as partes principais, com pytest. Em projetos com LLM, use um dublê (versão falsa) da chamada ao modelo para o teste não depender da internet nem de chave.
6. **Escreva o README**: o que o projeto faz, como instalar e rodar, como rodar os testes, decisões e o que você faria com mais tempo.
7. **Teste numa pasta limpa.** Clone o repositório do zero, siga o README e confirme que funciona.
8. **Use Git direito**: commits pequenos, com mensagens claras, e nenhum segredo no repositório.
9. **Entregue no prazo**, ou avise antes se precisar de mais tempo.

## Exemplo

Trecho de README, antes:

> Para rodar, instale as dependências e execute o projeto.

Depois:

> ## Como rodar
> 1. `python -m venv .venv`, e ative com `source .venv/bin/activate` (Linux e macOS) ou `.venv\Scripts\activate` (Windows)
> 2. `pip install -r requirements.txt`
> 3. `uvicorn app.main:app --reload`
> 4. Testes: `pytest`
>
> ## Decisões
> - Usei SQLite para simplificar a instalação. Em produção, trocaria por PostgreSQL.
> - Autenticação ficou fora do escopo do enunciado. Seria o próximo passo.

A segunda versão tem comandos exatos, mostra que você conhece os limites da entrega e diz o que faria depois, em vez de esconder.

## Erros comuns

- **Não rodar a entrega do zero.** O erro clássico é "na minha máquina funciona".
- **Entregar sem README ou com README genérico.**
- **Fazer demais.** Acrescentar frameworks e extras que o escopo não pede aumenta o risco e o volume de código a explicar.
- **Não testar.** Sem testes, a pessoa que avalia não sabe se funciona.
- **Subir chaves de API.** Use variáveis de ambiente e um `.env.example`.
- **Copiar código sem entender.** Haverá perguntas sobre cada trecho na entrevista seguinte.
- **Ignorar o prazo.** Entregar tarde sem avisar passa má impressão.

## Checklist

- Requisitos listados e dúvidas esclarecidas.
- Projeto roda a partir de um clone limpo seguindo o README.
- README com como rodar, como testar, decisões e próximos passos.
- Testes dos fluxos principais passando.
- Nenhum segredo no repositório, com `.env.example` incluído.
- Commits pequenos e com mensagens claras.
- Entrega dentro do prazo.
