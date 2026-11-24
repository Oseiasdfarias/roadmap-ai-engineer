---
titulo: "Terminal e ambientes"
nivel: 1
grupo: "Programação (sem IA)"
ordem: 3
resumo: "Comandos essenciais de shell, variáveis de ambiente, venv e uv, pyproject.toml e estrutura de projeto. Inclui manter chaves e segredos em arquivos .env fora do Git desde o primeiro script."
tempo: "1 a 2 semanas"
ferramentas:
  - "Bash"
  - "venv"
  - "uv"
  - "pyproject.toml"
prerequisitos:
  - "python-fundamentos"
relacionados:
  - "git-e-github"
  - "docker-local"
referencias:
  - titulo: "The Missing Semester of Your CS Education (MIT)"
    url: "https://missing.csail.mit.edu/"
    tipo: "Curso"
    idioma: "en"
    gratuito: true
  - titulo: "Ambientes virtuais e pacotes: tutorial oficial do Python"
    url: "https://docs.python.org/pt-br/3/tutorial/venv.html"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
  - titulo: "uv: documentação"
    url: "https://docs.astral.sh/uv/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "The Twelve-Factor App: Config"
    url: "https://12factor.net/config"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

O terminal (ou shell) é a interface de texto do computador: você digita comandos em vez de clicar. Um ambiente virtual é uma pasta isolada com o Python e as bibliotecas de um projeto, para que projetos diferentes não briguem por versões. As variáveis de ambiente são valores nomeados que o sistema entrega aos programas, o lugar certo para chaves de API (a senha que identifica você num serviço).

## Por que importa para um AI Engineer

Quase tudo no seu trabalho acontece fora de janelas: instalar bibliotecas, rodar servidores, ver logs (registros do que o programa fez), conectar-se a máquinas remotas. Os tutoriais e a documentação assumem que você usa o terminal sem sustos.

O segundo motivo é segurança e reprodutibilidade. Uma chave de API enviada ao GitHub por engano pode ser achada e usada por terceiros em minutos, e você paga a conta. E um projeto que só roda na sua máquina não serve a um colega nem a um recrutador.

## Como funciona

**Comandos essenciais:** `pwd` (onde estou), `ls` (listar), `cd` (entrar numa pasta), `mkdir` (criar pasta), `cp` e `mv` (copiar e mover), `cat` (mostrar arquivo), `grep` (buscar texto), `|` (passar a saída de um comando a outro). No Windows, use o WSL (Linux dentro do Windows) para ter os mesmos comandos.

**Ambiente virtual:** cada projeto tem o seu.

```bash
mkdir meu-projeto && cd meu-projeto
python3 -m venv .venv            # cria o ambiente
source .venv/bin/activate        # ativa (no Windows: .venv\Scripts\activate)
pip install requests
pip freeze > requirements.txt    # registra as versões
```

O **uv** é uma ferramenta mais nova que faz o mesmo mais rápido: `uv init`, `uv add requests` e `uv run main.py` criam o ambiente, instalam e registram as dependências no `pyproject.toml`, o arquivo padrão que descreve o projeto (nome, versão do Python, bibliotecas).

**Segredos:** guarde chaves num arquivo `.env`, que fica na lista do `.gitignore` (arquivo que diz ao Git o que não versionar). O código lê o valor do ambiente:

```python
import os
chave = os.environ.get("MINHA_CHAVE")
if chave is None:
    raise SystemExit("Defina MINHA_CHAVE no ambiente ou no .env")
```

Para carregar o `.env` automaticamente, use a biblioteca `python-dotenv`. Para publicar, deixe um `.env.example` com os nomes das variáveis e valores falsos.

**Estrutura de projeto:** uma pasta `src/` ou o nome do pacote, `tests/`, `README.md`, `pyproject.toml` e `.gitignore`.

## Na prática

Todo projeto do roadmap começa com `uv init` (ou `venv`), um `.gitignore` com `.venv` e `.env`, e um README com os comandos para rodar. No P1: Assistente da Montadora, a chave do provedor de LLM vive em `.env`. No P3: Servidor MCP de Manuais e nos demais, a mesma estrutura permite que outra pessoa clone o repositório e rode em minutos.

## Erros comuns

- **Instalar pacotes no Python global.** Gera conflitos de versão. Sempre ative o ambiente primeiro.
- **Colocar a chave de API direto no código.** Vai parar no histórico do Git, e apagar depois não a remove do histórico. Se vazar, revogue a chave.
- **Esquecer de listar as dependências.** Sem `requirements.txt` ou `pyproject.toml`, ninguém reproduz seu projeto.
- **Versionar a pasta `.venv`.** Ela é grande e específica da sua máquina.
- **Rodar comando copiado sem ler.** Principalmente com `rm -rf` ou `sudo`.

## Como estudar

1. Faça as aulas de shell do Missing Semester (1 dia).
2. Crie um projeto com `venv`, instale uma biblioteca e registre as versões (1 dia).
3. Refaça o mesmo com `uv` e compare (1 dia).
4. Monte o `.env`, o `.env.example` e o `.gitignore`; confira com `git status` que o `.env` não aparece (meio dia).
5. Leia o princípio "Config" do Twelve-Factor App (1 hora).

## Como mostrar

No portfólio, todo repositório traz `pyproject.toml` ou `requirements.txt`, `.env.example` e um README com "como rodar" em poucos comandos. Na entrevista, explique como mantém segredos fora do Git e o que faria se uma chave vazasse: revogar, gerar outra e limpar o uso indevido.
