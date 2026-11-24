---
titulo: "AWS: fundamentos"
nivel: 4
grupo: "Fundamentos antes de configurar"
ordem: 1
resumo: "Regiões, responsabilidade compartilhada e cobrança, e os serviços que você vai usar: IAM, EC2, S3, RDS, ECS, Lambda e Bedrock. Faça um curso antes de configurar: uma instância esquecida gera custo."
tempo: "3 a 4 semanas"
ferramentas:
  - "AWS"
  - "IAM"
  - "EC2"
  - "S3"
  - "Bedrock"
prerequisitos:
  - "docker-local"
relacionados:
  - "seguranca-e-custo-na-nuvem"
  - "ci-cd"
referencias:
  - titulo: "AWS Cloud Practitioner Essentials"
    url: "https://aws.amazon.com/pt/training/course-descriptions/cloud-practitioner-essentials/"
    tipo: "Curso"
    idioma: "pt"
    gratuito: true
  - titulo: "Modelo de responsabilidade compartilhada da AWS"
    url: "https://aws.amazon.com/compliance/shared-responsibility-model/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "O que é o Amazon Bedrock"
    url: "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

A AWS (Amazon Web Services) é uma plataforma de computação em nuvem: em vez de comprar servidores, você aluga máquinas, bancos de dados e armazenamento pela internet e paga pelo que usa. Este tópico é o mapa conceitual. A configuração prática vem depois, e só depois de um curso de fundamentos.

## Por que importa para um AI Engineer

Um projeto só vira prova de trabalho quando está no ar, com link funcionando. A AWS é uma das plataformas mais usadas pelas empresas, então saber levar a API do PF: Agente Completo para lá é um diferencial concreto. Há um motivo para estudar antes de clicar: uma configuração errada não só quebra o projeto, também pode gerar custo alto mesmo num teste, com uma máquina esquecida ligada ou um banco exposto. Um agente de programação pode sugerir uma configuração que funciona e ainda assim é cara ou insegura; você precisa saber revisar.

## Como funciona

**Conceitos de base**

- **Responsabilidade compartilhada.** A AWS cuida da segurança da nuvem (prédios, hardware, rede física). Você cuida da segurança na nuvem: permissões, dados, configuração, chaves.
- **Regiões e zonas de disponibilidade.** Região é uma área geográfica com vários data centers, como a de São Paulo. Zona de disponibilidade (AZ) é um data center isolado dentro da região. Recursos criados numa região não aparecem em outra, e preço e disponibilidade de serviços variam entre elas.
- **Cobrança.** Em geral você paga pelo uso: horas de máquina, armazenamento, tráfego de saída, chamadas. Há um nível gratuito, mas as regras mudam; leia a página oficial vigente. Consulte sempre a calculadora de preços da AWS, sem confiar em números de terceiros.

**Serviços que você vai encontrar**

- **IAM** (Identity and Access Management): quem pode fazer o quê. É a base da segurança.
- **EC2**: máquinas virtuais. Flexível, mas você mantém o sistema.
- **S3**: armazenamento de arquivos (objetos), como PDFs de manuais e backups.
- **RDS**: banco de dados gerenciado, inclusive PostgreSQL; a AWS cuida de backups e atualizações.
- **ECS e App Runner**: executam containers. O App Runner é mais simples; o ECS oferece mais controle.
- **Lambda**: executa uma função sob demanda, sem servidor para manter. Bom para tarefas curtas.
- **Bedrock**: acesso a modelos de linguagem, de vários provedores, dentro da AWS. A disponibilidade de modelos e regiões varia; consulte a documentação.

Um fluxo típico de um projeto: a imagem Docker da API roda no ECS ou App Runner, o Postgres fica no RDS, os documentos no S3 e as permissões entre eles ficam no IAM.

## Na prática

No PF: Agente Completo, você leva a API (FastAPI), o banco com pgvector e o pipeline de CI/CD para a AWS, com alerta de custo (veja seguranca-e-custo-na-nuvem e ci-cd). Para o P1: Assistente da Montadora ou o P2: RAG de Manuais Técnicos, o Bedrock é uma alternativa de acesso aos modelos quando a empresa já usa AWS e exige que os dados fiquem nela. Para decidir entre ECS, App Runner e Lambda, compare esforço de operação e custo estimado do seu caso, sem presumir.

## Erros comuns

- **Sair configurando sem curso.** O custo e os riscos aparecem antes do entendimento.
- **Usar a conta raiz no dia a dia.** Ela tem poder total; crie um usuário com permissões limitadas.
- **Esquecer de desligar recursos** ao terminar o estudo. Cobrança continua com o recurso existindo.
- **Ignorar a região.** Recursos esquecidos numa região que você não olha continuam cobrando.
- **Achar que a nuvem já vem segura por padrão.** A configuração é sua parte da responsabilidade.

## Como estudar

1. Faça o AWS Cloud Practitioner Essentials, no Skill Builder, gratuito (1 a 2 semanas).
2. Leia a página do modelo de responsabilidade compartilhada (1 hora).
3. Siga o checklist de seguranca-e-custo-na-nuvem antes de criar qualquer recurso (meio dia).
4. Suba uma imagem Docker simples no App Runner ou ECS e apague tudo ao final (2 a 3 dias).
5. Leia o que é o Bedrock e liste quais modelos estão na sua região (meio dia).

## Como mostrar

No portfólio, inclua no README do PF um diagrama com os serviços usados e o custo mensal estimado, marcado como estimativa. Na entrevista, explique responsabilidade compartilhada com um exemplo seu, por que escolheu um serviço de execução em vez de outro e o que fez para não gastar à toa.
