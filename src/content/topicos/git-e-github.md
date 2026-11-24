---
titulo: "Git e GitHub"
nivel: 1
grupo: "Programação (sem IA)"
ordem: 4
resumo: "Commit, branch, merge e pull request, além de .gitignore, README e fluxo de equipe. O histórico de commits é um dos primeiros sinais que um recrutador técnico consulta no seu perfil."
tempo: "1 a 2 semanas"
ferramentas:
  - "Git"
  - "GitHub"
prerequisitos:
  - "terminal-e-ambientes"
relacionados:
  - "terminal-e-ambientes"
  - "ci-cd"
referencias:
  - titulo: "Pro Git em português"
    url: "https://git-scm.com/book/pt-br/v2"
    tipo: "Livro"
    idioma: "pt"
    gratuito: true
  - titulo: "GitHub Skills"
    url: "https://skills.github.com/"
    tipo: "Curso"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Git é um sistema de controle de versão: ele guarda o histórico do seu projeto em "fotografias" chamadas commits, e deixa você voltar a qualquer uma delas. GitHub é o site que hospeda repositórios Git na nuvem e acrescenta colaboração: revisão de código, issues (tarefas e bugs) e pull requests (pedidos para incorporar mudanças).

## Por que importa para um AI Engineer

Todo time de software usa Git, e vagas júnior perguntam sobre ele. Também é a sua vitrine: recrutadores técnicos abrem o GitHub e olham os projetos, o README e o histórico. Commits frequentes e bem descritos mostram que você trabalha de forma organizada. Um repositório com um único commit chamado "final" diz o contrário.

No dia a dia de IA, o Git protege você de um problema comum: experimentos. Você muda um prompt, o resultado piora, e quer voltar. Com commits, voltar é um comando.

## Como funciona

O fluxo básico tem três áreas: a pasta de trabalho, a área de preparação (staging, onde você escolhe o que entra no próximo commit) e o histórico.

```bash
git init                         # começa um repositório
git add main.py README.md        # prepara arquivos
git commit -m "Adiciona leitura do CSV"
git switch -c ajusta-prompt      # cria e entra numa branch
git switch main                  # volta
git merge ajusta-prompt          # junta a branch na atual
git log --oneline                # vê o histórico
```

Uma **branch** (ramo) é uma linha paralela de trabalho: você testa uma ideia sem mexer na versão estável. O **merge** junta as linhas. Quando duas pessoas mudam a mesma linha, aparece um conflito, que você resolve escolhendo o texto final à mão.

Em equipe, o fluxo comum é: criar uma branch para cada tarefa, abrir um **pull request** no GitHub, receber revisão, ajustar e só então incorporar à branch principal. Essa branch principal costuma ser protegida, e ninguém altera nela diretamente.

O **`.gitignore`** lista o que o Git ignora: `.venv/`, `.env`, `__pycache__/`. O **README.md** é a porta de entrada: o que o projeto faz, como rodar e um exemplo de resultado.

Boas mensagens de commit dizem o que mudou e, quando importa, por quê: "Troca chunk de 500 para 300 caracteres" é útil; "ajustes" não é.

## Na prática

Cada projeto do roadmap (P1: Assistente da Montadora até PF: Agente Completo) é um repositório público no GitHub, com README, `.gitignore` correto e histórico que conta a evolução: primeiro a versão mínima, depois cada melhoria em seu commit ou pull request. Mesmo trabalhando sozinho, use branches e pull requests para as mudanças maiores; é o hábito que o mercado espera.

## Erros comuns

- **Commitar segredos.** Chaves no `.env` enviadas ao GitHub podem ser usadas por terceiros. Confira o `.gitignore` antes do primeiro commit.
- **Commits gigantes e mensagens vazias.** Um commit deve ter um propósito; fica fácil de revisar e de desfazer.
- **Trabalhar direto na branch principal.** Dificulta revisão e reversão.
- **Usar `git push --force` sem entender.** Reescreve o histórico remoto e pode apagar o trabalho dos outros.
- **Repositório sem README.** Quem chega não sabe o que é nem como rodar.

## Como estudar

1. Leia os capítulos 1 a 3 do Pro Git: fundamentos e branches (2 a 3 dias).
2. Faça os cursos introdutórios do GitHub Skills, incluindo o de pull requests (2 dias).
3. Crie um repositório de teste e provoque um conflito de merge de propósito para resolvê-lo (1 dia).
4. Publique um projeto seu com `.gitignore`, README e ao menos dez commits significativos (1 semana).
5. Peça a um colega para abrir um pull request no seu repositório e revise (1 dia).

## Como mostrar

No portfólio, fixe no perfil do GitHub os repositórios melhores, cada um com README claro e histórico limpo. Na entrevista, saiba explicar a diferença entre merge e pull request, descrever como resolveu um conflito e contar o que faria se commitasse uma chave por engano: revogar a chave, não apenas apagar o arquivo.
