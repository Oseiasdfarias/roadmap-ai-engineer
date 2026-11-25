---
titulo: "LGPD and personal data"
nivel: 2
grupo: "Quality and protection"
ordem: 4
resumo: "Minimize and anonymize personal data before sending it to the LLM and before writing logs. See sensitive data, pseudonymization, CPF and license plate recognizers with Presidio, retention and Brazil's ANPD."
tempo: "1 to 2 weeks"
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
  - titulo: "Law No. 13,709/2018 (LGPD): text of the law (in Portuguese)"
    url: "https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-norma-pl.html"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
  - titulo: "ANPD: Brazilian National Data Protection Authority (in Portuguese)"
    url: "https://www.gov.br/anpd/pt-br"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
  - titulo: "ANPD: regulatory agenda (in Portuguese)"
    url: "https://www.gov.br/anpd/pt-br/assuntos/regulacao/agenda-regulatoria-1"
    tipo: "Docs"
    idioma: "pt"
    gratuito: true
  - titulo: "Microsoft Presidio"
    url: "https://data-privacy-stack.github.io/presidio/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "Presidio: adding custom recognizers"
    url: "https://data-privacy-stack.github.io/presidio/analyzer/adding_recognizers/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

The LGPD (General Data Protection Law, Law No. 13,709/2018) regulates the use of personal data in Brazil, in a way similar to Europe's GDPR. For people building LLM (language model) systems, the practical consequence is simple: text sent to the model or written to a log may contain personal data, and you need to know what goes in, where it goes and how long it stays. Elsewhere, apply the same engineering to your local law. This text is technical study material, not legal advice; for a real case, talk to whoever handles data protection in your organization.

## Why it matters for an AI Engineer

Prompts, retrieved documents and answers often carry names, CPF (the Brazilian taxpayer ID), phone numbers, license plates and addresses. An external provider's LLM receives that data, and observability logs store it. Using less data, masking it early and controlling retention are engineering decisions, cheaper at the start of a project.

## How it works

**The law's definitions (art. 5).** Personal data is information related to an identified or identifiable natural person: a CPF, an email, sometimes a license plate associated with an owner. Sensitive personal data includes racial or ethnic origin, religious belief, political opinion, health, sex life, genetic or biometric data, among others; it requires more care.

**Minimization.** Among the law's principles is necessity: use the minimum for the purpose. In LLMs, that means sending the model only what the task requires. To classify a maintenance work order, the customer's name is not needed.

**Anonymization and pseudonymization** are different things. Anonymized data does not allow the person to be identified by reasonable technical means; as a rule it stops being personal data, but if the process can be reversed, it becomes personal data again. Pseudonymizing means replacing the identifier with a code (`<CPF_1>`), with the mapping table stored separately. Since the table allows re-identification, the person remains identifiable, and the data is still treated as personal.

**Presidio.** Microsoft Presidio is an open source library that detects and masks personal data in text. It comes with ready-made recognizers for common entities, but it does not cover Brazilian formats: CPF, CNPJ (company ID) and license plates require custom recognizers, usually a regular expression, ideally one that also validates the check digits.

```python
from presidio_analyzer import AnalyzerEngine, Pattern, PatternRecognizer
from presidio_anonymizer import AnonymizerEngine

cpf = PatternRecognizer(
    supported_entity="CPF",
    patterns=[Pattern("cpf", r"\b\d{3}\.\d{3}\.\d{3}-\d{2}\b", 0.6)],
)
analyzer = AnalyzerEngine()
analyzer.registry.add_recognizer(cpf)
text = "The customer with CPF 123.456.789-09 called."   # fictional number
findings = analyzer.analyze(text=text, language="en", entities=["CPF"])
print(AnonymizerEngine().anonymize(text=text, analyzer_results=findings).text)
# The customer with CPF <CPF> called.
```

Install `presidio-analyzer` and `presidio-anonymizer`; on first run, it downloads a spaCy model of a few hundred MB. The default configuration is English (hence `language="en"`); for names in other languages, configure an NLP (natural language processing) model for that language. License plates follow the same pattern, with another regular expression.

**Logs and retention.** Mask before writing. Define how long each log is kept, who can access it and how to delete it.

**ANPD.** The National Data Protection Authority is the Brazilian body that enforces and regulates the LGPD. Its regulatory agenda covers anonymization and AI, and the rules are still evolving. Sending data to providers abroad also has its own rules (international transfer, from art. 33).

## In practice

In P1: Automaker Assistant, a personal data layer masks CPF, phone and license plate before the LLM call and before writing the log, and the README documents what is stored and for how long.

## Common mistakes

- **Masking only in the prompt and writing the original to the log.** The data leaks through another path.
- **Thinking regex catches everything.** Names and addresses in free text require an NLP model, and even then they fail; test with realistic examples, without real people's data.
- **Confusing pseudonymization with anonymization.** The mapping table keeps the data personal.
- **Using real data in tests and in your portfolio.** Use fictional data.

## How to study

1. Read articles 5, 6 and 12 to 13 of the law (2 hours).
2. Look at the ANPD page and the regulatory agenda (1 hour).
3. Run Presidio on the example above (half a day).
4. Write recognizers for CNPJ and license plates, with CPF check-digit validation (1 day).
5. Put together 30 fictional sentences with personal data and measure what the masking misses (1 day).

## How to show it

In the README, describe the data flow (what is masked, where, what stays in logs and for how long) and the test results with fictional data. In the interview, distinguish personal and sensitive data, anonymization and pseudonymization, and explain why Presidio needs recognizers for local formats.
