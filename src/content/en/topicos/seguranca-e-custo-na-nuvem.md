---
titulo: "Cloud security and cost"
nivel: 4
grupo: "Fundamentals before configuring"
ordem: 2
resumo: "MFA on the root account, least-privilege IAM, AWS Budgets alerts and secrets out of the code. A checklist to follow before creating any resource, because configuration mistakes cost real money."
tempo: "3 to 5 days"
ferramentas:
  - "AWS IAM"
  - "AWS Budgets"
  - "AWS CLI"
prerequisitos:
  - "aws-fundamentos"
relacionados:
  - "custo-e-latencia"
  - "lgpd-e-dados-pessoais"
referencias:
  - titulo: "AWS Budgets"
    url: "https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "IAM: security best practices"
    url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "IAM: root user best practices"
    url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

It is the set of precautions you take before and while using the cloud so that the account is not compromised and the bill does not surprise you. The focus here is AWS, but the logic applies to any provider. The central idea: in the cloud, a configuration mistake costs money or exposes data, and nothing warns you beforehand.

## Why it matters for an AI Engineer

AI projects use model API keys, databases with customer data and machines that can be expensive. A key published on GitHub can be found and used by others, and the bill arrives on your account. A forgotten running instance charges every month. And poorly protected personal data brings data protection problems (see the LGPD and personal data topic). Take the fundamentals course (see AWS fundamentals) before configuring: without it, you do not notice what the coding agent suggested wrong.

## How it works

Follow this list, in order, before creating any resource:

- **MFA on the root account.** The root account is the one tied to the sign-up email and has full power. Turn on multi-factor authentication (MFA) for it.
- **Do not use root day to day and do not create an access key for it.** Create an IAM user (or access through IAM Identity Center) to work with, also with MFA.
- **Least-privilege IAM.** Give each user, or each application, only the permissions it needs. Avoid full administrator permission for everything. If you need access to one S3 bucket, grant access only to that bucket.
- **Roles instead of fixed keys.** For an application running on AWS, use an IAM role, which provides temporary credentials, instead of long-lived access keys.
- **Block public access on S3.** Keep Block Public Access on and open a bucket only with a clear reason.
- **An AWS Budgets alert.** Create a budget with a low amount, for example US$ 5 (an illustrative value), with an email warning. By default AWS Budgets only alerts and does not block spending (Budget Actions can apply restrictions, but it requires configuration), and the data is delayed; check the cost dashboard often. Cost Explorer shows spending per service and Cost Anomaly Detection warns about unusual spending.
- **Understand the free tier.** What is included and for how long changes; read the current rule on the AWS page.
- **Secrets out of the code.** API keys and passwords live in environment variables or a secrets manager. `.env` goes into `.gitignore`. If a key leaks, revoke it and generate a new one right away; deleting the commit is not enough.
- **Shut down and delete when you finish.** Every study session ends with removing the resources you created.
- **Watch the region.** Set a default region and check the others. A resource forgotten in a region you never open keeps charging.

To check instances in a region, use the AWS CLI:

```bash
aws ec2 describe-instances --region sa-east-1 \
  --query "Reservations[].Instances[].[InstanceId,State.Name]" --output text
```

Repeat for the regions you used (`sa-east-1` is São Paulo). Hidden charges usually come from running RDS databases, EBS volumes of machines already deleted, unused Elastic IPs, load balancers and NAT gateways.

## In practice

In PF: Complete Agent, secrets (the model key, the database password) go in as service variables, never in the Docker image or the repository, and the pipeline uses GitHub secrets (see the CI/CD topic). The budget alert is an acceptance criterion of the project. If you use Bedrock or paid model calls, tie the cost per question to the budget (see cost and latency).

## Common mistakes

- **A key in the repository.** Even in a private repository, it ends up exposed when you open or share it.
- **Full permission "to make things easier".** If the key leaks, the damage is total.
- **A budget without a confirmed email** or with an amount too high to make sense.
- **Doing only what the agent suggested**, without understanding the permission or the cost of the configuration.

## How to study

1. Read the root user and IAM best practices (2 hours).
2. Create a study account and apply the list's items one by one (half a day).
3. Create a low-amount budget and test the warning (1 hour).
4. Practice a leaked key: revoke it and generate a new one in a test project (1 hour).
5. Create and delete a simple resource and check the cost on the dashboard the next day (1 day).

## How to show it

In your portfolio, the PF README includes a security section with what was done (MFA, a user with minimal permissions, secrets out of the code, a cost alert), without exposing any secret value. In the interview, describe what you check before creating resources and how you would react to a leaked key.
