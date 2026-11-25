---
titulo: "Computer use e agentes de navegador"
nivel: 5
grupo: "Agentes em ação"
ordem: 1
resumo: "Agentes que operam interfaces como uma pessoa: veem a tela, clicam e digitam. Quando usar em vez de uma API, como isolar o ambiente, como lidar com lentidão e erros e por que o risco de segurança é maior."
tempo: "1 a 2 semanas"
ferramentas:
  - "Python"
  - "Playwright"
  - "Docker"
prerequisitos:
  - "tool-use"
  - "docker-local"
relacionados:
  - "seguranca-de-agentes"
  - "avaliacao-de-agentes"
referencias:
  - titulo: "Computer use tool: documentação da API do Claude"
    url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Computer use: guia da OpenAI"
    url: "https://platform.openai.com/docs/guides/tools-computer-use"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Playwright para Python"
    url: "https://playwright.dev/python/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "browser-use"
    url: "https://github.com/browser-use/browser-use"
    tipo: "Repositório"
    idioma: "en"
    gratuito: true
  - titulo: "OSWorld: benchmark de agentes em computadores reais"
    url: "https://os-world.github.io/"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## O que é

Computer use é quando um agente controla um computador pela interface gráfica: recebe uma captura de tela, decide onde clicar ou o que digitar e repete até cumprir a tarefa. Agentes de navegador são o caso mais comum, e podem trabalhar com capturas de tela, com a árvore de acessibilidade da página ou com as duas. Os grandes provedores oferecem ferramentas próprias para isso, e há bibliotecas abertas que conectam um modelo a um navegador controlado pelo Playwright.

## Por que importa para um AI Engineer

Muito sistema importante não tem API: portais de fornecedores, sistemas internos antigos, sites de governo. Um agente que opera a interface resolve casos que antes exigiam automação frágil feita à mão. Por outro lado, ele é lento, mais caro por tarefa e mais sujeito a erro do que uma chamada de API, e cada página que ele lê pode conter instruções maliciosas. Saber quando vale a pena, e como isolar o agente, é o que separa uma demonstração de algo usável.

## Como funciona

O ciclo é o mesmo de qualquer agente, com ações de interface no lugar de ferramentas comuns: observar (captura de tela ou árvore da página), decidir a próxima ação, executar e observar de novo. Prefira dar ao modelo seletores e texto da página quando possível; capturas de tela custam mais tokens e erram mais em detalhes pequenos.

```python
from playwright.sync_api import sync_playwright

def observar(pagina):
    """Texto visível e elementos clicáveis: entrada mais barata que uma captura."""
    links = pagina.get_by_role("link").all()[:20]
    return {"titulo": pagina.title(),
            "links": [l.inner_text().strip() for l in links if l.inner_text().strip()]}

with sync_playwright() as p:
    navegador = p.chromium.launch()            # sem interface, isolado
    pagina = navegador.new_page()
    pagina.goto("https://playwright.dev/python/")
    print(observar(pagina))                    # o modelo decidiria o próximo clique
    navegador.close()
```

Para rodar com segurança:

- **Ambiente isolado:** um contêiner ou máquina virtual sem acesso às suas credenciais pessoais e com rede limitada.
- **Lista de domínios permitidos:** o agente só navega onde a tarefa exige.
- **Confirmação humana para ações sensíveis:** comprar, enviar, apagar, aceitar termos.
- **Limite de passos e de tempo:** agentes de interface podem entrar em ciclos.

## Na prática

Os usos que funcionam hoje são tarefas repetitivas e bem definidas em sistemas sem API: preencher um formulário com dados conhecidos, extrair informação de um portal, testar um fluxo de interface. Benchmarks como o OSWorld mostram que tarefas abertas em computadores reais ainda são difíceis para os agentes. No P5: Pesquisador Multiagente, uma camada opcional adiciona um subagente que consulta um portal de boletins técnicos sem API, em contêiner isolado.

## Erros comuns

- **Usar interface quando existe API.** A API é mais rápida, barata e estável.
- **Rodar no seu navegador pessoal.** O agente herda seus logins e pode agir em seu nome.
- **Confiar no texto da página.** Uma página pode conter instruções para o agente; trate como dado.
- **Não registrar as ações.** Sem capturas e logs de cada passo, não dá para depurar.

## Como estudar

1. Leia a documentação de computer use de um provedor, incluindo as recomendações de segurança (2 horas).
2. Rode o exemplo com Playwright e evolua para um ciclo com o modelo escolhendo o próximo link (2 dias).
3. Rode o mesmo agente num contêiner Docker com lista de domínios permitidos (2 dias).
4. Crie 10 tarefas de teste e meça taxa de sucesso, passos e custo (2 dias).
5. Coloque uma instrução escondida numa página de teste e verifique se o agente obedece (1 dia).

## Como mostrar

Mostre um vídeo do agente cumprindo uma tarefa, a taxa de sucesso nas tarefas de teste e a configuração de isolamento. Na entrevista, explique quando você escolheria computer use e quais controles colocaria antes de liberar para usuários.
