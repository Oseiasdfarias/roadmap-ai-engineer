---
titulo: "LGPD e dados pessoais"
nivel: 2
grupo: "Qualidade e proteção"
ordem: 4
resumo: "Minimize e anonimize dados pessoais antes de enviá-los ao LLM e antes de gravar logs. Veja dado sensível, pseudonimização, reconhecedores de CPF e placa com Presidio, retenção e o papel da ANPD."
tempo: "1 a 2 semanas"
ferramentas:
  - "Python"
  - "Microsoft Presidio"
prerequisitos:
  - "tokens-e-janela-de-contexto"
relacionados:
  - "guardrails"
  - "observabilidade"
  - "rag"
referencias:
  - titulo: "Lei nº 13.709/2018 (LGPD): texto da lei"
    url: "https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-norma-pl.html"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
  - titulo: "ANPD: Autoridade Nacional de Proteção de Dados"
    url: "https://www.gov.br/anpd/pt-br"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
  - titulo: "ANPD: agenda regulatória"
    url: "https://www.gov.br/anpd/pt-br/assuntos/regulacao/agenda-regulatoria-1"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
  - titulo: "Microsoft Presidio"
    url: "https://data-privacy-stack.github.io/presidio/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Presidio: adicionando reconhecedores personalizados"
    url: "https://data-privacy-stack.github.io/presidio/analyzer/adding_recognizers/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

A LGPD (Lei Geral de Proteção de Dados, Lei nº 13.709/2018) regula o uso de dados pessoais no Brasil. Para quem constrói sistemas com LLM (modelo de linguagem), a consequência prática é simples: texto enviado ao modelo ou gravado em log pode conter dado pessoal, e você precisa saber o que entra, para onde vai e por quanto tempo fica. Este texto é material de estudo técnico, não aconselhamento jurídico; para um caso real, consulte quem cuida de proteção de dados na sua organização.

## Por que importa para um AI Engineer

Prompts, documentos recuperados e respostas costumam carregar nome, CPF, telefone, placa e endereço. Um LLM de provedor externo recebe esses dados, e os logs de observabilidade os guardam. Usar menos dado, mascará-lo cedo e controlar a retenção são decisões de engenharia, mais baratas no começo do projeto.

## Como funciona

**Definições da lei (art. 5º).** Dado pessoal é a informação relacionada a pessoa natural identificada ou identificável: um CPF, um e-mail, às vezes uma placa associada a um dono. Dado pessoal sensível inclui origem racial ou étnica, convicção religiosa, opinião política, saúde, vida sexual, dado genético ou biométrico, entre outros; pede mais cuidado.

**Minimização.** Entre os princípios da lei está a necessidade: usar o mínimo para a finalidade. Em LLM, isso é enviar ao modelo só o que a tarefa exige. Para classificar uma ordem de manutenção, o nome do cliente não faz falta.

**Anonimização e pseudonimização** são coisas diferentes. Anonimizado é o dado que não permite identificar a pessoa por meios técnicos razoáveis; em regra deixa de ser dado pessoal, mas se o processo puder ser revertido, volta a ser. Pseudonimizar é trocar o identificador por um código (`<CPF_1>`), com a tabela de correspondência guardada à parte. Como dá para reidentificar com essa tabela, a pessoa continua identificável, e o dado segue tratado como pessoal.

**Presidio.** O Microsoft Presidio é uma biblioteca de código aberto que detecta e mascara dados pessoais em texto. Ele traz reconhecedores prontos para entidades comuns, mas não cobre os formatos brasileiros: CPF, CNPJ e placa exigem reconhecedores personalizados, em geral uma expressão regular, melhor se validar também os dígitos verificadores.

```python
from presidio_analyzer import AnalyzerEngine, Pattern, PatternRecognizer
from presidio_anonymizer import AnonymizerEngine

cpf = PatternRecognizer(
    supported_entity="CPF",
    patterns=[Pattern("cpf", r"\b\d{3}\.\d{3}\.\d{3}-\d{2}\b", 0.6)],
)
analisador = AnalyzerEngine()
analisador.registry.add_recognizer(cpf)
texto = "O cliente de CPF 123.456.789-09 ligou."   # número fictício
achados = analisador.analyze(text=texto, language="en", entities=["CPF"])
print(AnonymizerEngine().anonymize(text=texto, analyzer_results=achados).text)
# O cliente de CPF <CPF> ligou.
```

Instale `presidio-analyzer` e `presidio-anonymizer`; na primeira execução, ele baixa um modelo do spaCy de algumas centenas de MB. A configuração padrão é em inglês (daí o `language="en"`); para nomes em português, configure um modelo de PLN (processamento de linguagem natural) em português. A placa segue o mesmo padrão, com outra expressão regular.

**Logs e retenção.** Mascare antes de gravar. Defina por quanto tempo cada log fica, quem acessa e como apagar. Guardar tudo "para depois" cria um passivo.

**ANPD.** A Autoridade Nacional de Proteção de Dados é o órgão que fiscaliza e regulamenta a LGPD. Ela publica uma agenda regulatória, que trata de temas como anonimização e inteligência artificial, e as regras ainda evoluem; consulte a versão atual. O envio de dados a provedores no exterior também tem regras próprias (transferência internacional, a partir do art. 33).

## Na prática

No P1: Assistente da Montadora, uma camada de LGPD mascara CPF, telefone e placa antes da chamada ao LLM e antes de gravar o log, e o README documenta o que é guardado e por quanto tempo.

## Erros comuns

- **Mascarar só no prompt e gravar o original no log.** O dado vaza por outro caminho.
- **Achar que regex pega tudo.** Nomes e endereços em texto livre pedem modelo de NLP, e ainda assim falham; teste com exemplos reais, sem dados reais de pessoas.
- **Confundir pseudonimização com anonimização.** A tabela de correspondência mantém o dado como pessoal.
- **Usar dados reais em testes e em portfólio.** Use dados fictícios.

## Como estudar

1. Leia os artigos 5º, 6º e 12 a 13 da lei (2 horas).
2. Veja a página da ANPD e a agenda regulatória (1 hora).
3. Rode o Presidio no exemplo acima (meio dia).
4. Escreva reconhecedores para CNPJ e placa, com validação dos dígitos do CPF (1 dia).
5. Monte 30 frases fictícias com dados pessoais e meça o que o mascaramento perde (1 dia).

## Como mostrar

No README, descreva o fluxo do dado (o que é mascarado, onde, o que fica em log e por quanto tempo) e os resultados dos testes com dados fictícios. Na entrevista, diferencie dado pessoal e sensível, anonimização e pseudonimização, e explique por que o Presidio precisa de reconhecedores brasileiros.
