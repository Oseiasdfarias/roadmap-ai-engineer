---
titulo: "Puxar tarefas de IA"
fase: 4
grupo: "Transição para IA"
ordem: 1
resumo: "Na empresa onde você já trabalha, proponha e assuma as features com LLM. A experiência interna conta como experiência de IA, e é o caminho mais comum para sair de desenvolvedor e virar AI Engineer."
relacionados:
  - "projeto-em-producao"
  - "contar-a-historia"
  - "base-larga-foco-em-um"
referencias:
  - titulo: "Anthropic: Building effective agents"
    url: "https://www.anthropic.com/research/building-effective-agents"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Hamel Husain: Your AI product needs evals"
    url: "https://hamel.dev/blog/posts/evals/"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

Puxar tarefas de IA é propor e assumir, na empresa onde você já trabalha como desenvolvedor, as funcionalidades que usam LLM: busca em documentos, classificação de tickets, resumos, extração de dados. Em vez de esperar uma vaga de AI Engineer, você constrói a experiência dentro do emprego atual, com problema real e usuários reais.

## Por que importa

Vagas de AI Engineer júnior são raras, e muita gente chega ao cargo vindo de desenvolvimento de software ou de dados. A experiência interna conta como experiência de IA: você tem um problema de negócio, restrições, custo e um resultado para mostrar. Isso pesa mais que um projeto pessoal.

Depende do contexto da empresa e do apoio da liderança. Não há garantia de que a proposta seja aceita, mas há um jeito de propor que aumenta a chance.

## Passo a passo

1. **Procure dores que se parecem com os seus projetos.** Equipes de suporte que respondem as mesmas perguntas, documentos longos que ninguém acha, formulários digitados à mão. Converse com quem sofre com o problema.
2. **Meça o ponto de partida.** Quanto tempo a tarefa leva hoje? Quantos erros acontecem? Sem o antes, você não prova o depois.
3. **Proponha um piloto pequeno.** Uma página: problema, solução em duas linhas, como medir, custo estimado e risco. Prefira o mais simples que resolve, e comece por um workflow antes de pensar num agente (veja o artigo da Anthropic).
4. **Cuide de dados e segurança antes de tudo.** Defina quais dados podem ir para o modelo, mascare dados pessoais e fale com quem responde por segurança e LGPD na empresa.
5. **Construa com avaliação.** Monte um conjunto de exemplos reais, com respostas esperadas, e meça antes de liberar (veja Hamel Husain sobre evals).
6. **Libere para poucas pessoas**, colete feedback e meça de novo.
7. **Registre os resultados** em linhas de currículo e em histórias de entrevista, sem expor dados da empresa.

## Exemplo

Proposta, antes:

> Podemos usar IA no suporte?

Depois (números ilustrativos):

> **Problema:** a equipe de suporte gasta cerca de 30 minutos por ticket procurando a resposta na base de conhecimento. **Proposta:** um assistente que sugere a resposta com link para o artigo de origem, revisada pelo atendente antes do envio. **Medida:** tempo médio por ticket e taxa de sugestões aceitas, em 100 tickets antigos e depois em duas semanas de uso real. **Custo estimado:** a calcular com o volume mensal de tickets. **Riscos:** dados pessoais nos tickets, que serão mascarados antes de ir ao modelo.

A segunda proposta dá a quem decide uma pergunta concreta: aprovar ou não um piloto de duas semanas.

## Erros comuns

- **Propor "IA" sem problema definido.**
- **Começar por um agente complexo.** Prefira um fluxo simples e previsível.
- **Não medir antes e depois.** Sem números, o piloto vira opinião.
- **Enviar dados sensíveis ao modelo sem aprovação.** Pode causar problema jurídico e de confiança.
- **Assumir sozinho sem avisar a liderança.** Alinhe antes, e peça um padrinho na equipe.
- **Prometer o que o modelo não garante.** Diga onde ele erra e quem revisa.

## Checklist

- Um problema real identificado, com pessoas afetadas ouvidas.
- Medida do ponto de partida.
- Proposta de uma página aprovada por quem decide.
- Dados pessoais tratados e segurança consultada.
- Conjunto de exemplos para avaliar.
- Piloto pequeno com feedback registrado.
- Resultado documentado para currículo e entrevista.
