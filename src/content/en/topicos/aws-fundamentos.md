---
titulo: "AWS: fundamentals"
nivel: 4
grupo: "Fundamentals before configuring"
ordem: 1
resumo: "Regions, shared responsibility and billing, and the services you will use: IAM, EC2, S3, RDS, ECS, Lambda and Bedrock. Take a course before configuring anything: a forgotten instance generates cost."
tempo: "3 to 4 weeks"
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
    url: "https://aws.amazon.com/training/course-descriptions/cloud-practitioner-essentials/"
    tipo: "Curso"
    idioma: "en"
    gratuito: true
  - titulo: "AWS shared responsibility model"
    url: "https://aws.amazon.com/compliance/shared-responsibility-model/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "What is Amazon Bedrock"
    url: "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "AWS App Runner: availability change"
    url: "https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

AWS (Amazon Web Services) is a cloud computing platform: instead of buying servers, you rent machines, databases and storage over the internet and pay for what you use. This topic is the conceptual map. Hands-on configuration comes later, and only after a fundamentals course.

## Why it matters for an AI Engineer

A project only becomes proof of work when it is live, with a working link. AWS is one of the platforms companies use the most, so knowing how to take the PF: Complete Agent API there is a concrete differentiator. There is a reason to study before clicking: a wrong configuration does not just break the project, it can also generate high costs even in a test, with a forgotten machine left running or an exposed database. A coding agent may suggest a configuration that works and is still expensive or insecure; you need to know how to review it.

## How it works

**Base concepts**

- **Shared responsibility.** AWS takes care of the security of the cloud (buildings, hardware, physical network). You take care of security in the cloud: permissions, data, configuration, keys.
- **Regions and availability zones.** A region is a geographic area with several data centers, such as São Paulo. An availability zone (AZ) is an isolated data center within the region. Resources created in one region do not appear in another, and service prices and availability vary between them.
- **Billing.** In general you pay for usage: machine hours, storage, outbound traffic, calls. There is a free tier, but the rules change; read the current official page. Always check the AWS pricing calculator, without trusting third-party numbers.

**Services you will run into**

- **IAM** (Identity and Access Management): who can do what. It is the base of security.
- **EC2**: virtual machines. Flexible, but you maintain the system.
- **S3**: file (object) storage, such as manual PDFs and backups.
- **RDS**: a managed database, including PostgreSQL; AWS takes care of backups and updates.
- **ECS (with Fargate)**: runs containers without you managing servers. There is also ECS Express Mode, which simplifies publishing an API. App Runner, previously the simplest option, stopped accepting new customers; AWS recommends ECS Express Mode (see the reference).
- **Lambda**: runs a function on demand, with no server to maintain. Good for short tasks.
- **Bedrock**: access to language models, from several providers, inside AWS. Model and region availability varies; check the documentation.

A typical project flow: the API's Docker image runs on ECS (Fargate), Postgres lives in RDS, documents in S3 and the permissions between them in IAM.

## In practice

In PF: Complete Agent, you take the API (FastAPI), the database with pgvector and the CI/CD pipeline to AWS, with a cost alert (see the cloud security and cost and CI/CD topics). For P1: Automaker Assistant or P2: Technical Manuals RAG, Bedrock is an alternative way to access models when the company already uses AWS and requires data to stay there. To decide between ECS and Lambda, compare operational effort and estimated cost for your case, without assuming.

## Common mistakes

- **Configuring without a course.** Cost and risks show up before understanding does.
- **Using the root account day to day.** It has full power; create a user with limited permissions.
- **Forgetting to shut down resources** when you finish studying. Billing continues while the resource exists.
- **Ignoring the region.** Resources forgotten in a region you do not look at keep charging.
- **Thinking the cloud is secure by default.** Configuration is your part of the responsibility.

## How to study

1. Take AWS Cloud Practitioner Essentials, on Skill Builder, for free (1 to 2 weeks).
2. Read the shared responsibility model page (1 hour).
3. Follow the cloud security and cost checklist before creating any resource (half a day).
4. Deploy a simple Docker image on ECS (Fargate or Express Mode) and delete everything at the end (2 to 3 days).
5. Read what Bedrock is and list which models are available in your region (half a day).

## How to show it

In your portfolio, include in the PF README a diagram of the services used and the estimated monthly cost, marked as an estimate. In the interview, explain shared responsibility with an example of your own, why you chose one compute service over another and what you did to avoid wasting money.
