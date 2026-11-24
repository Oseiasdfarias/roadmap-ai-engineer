---
titulo: "Segurança e custo na nuvem"
nivel: 4
grupo: "Fundamentos antes de configurar"
ordem: 2
resumo: "MFA na conta raiz, IAM com privilégio mínimo, alertas no AWS Budgets e segredos fora do código. Um checklist para seguir antes de criar qualquer recurso, porque erro de configuração custa dinheiro."
tempo: "3 a 5 dias"
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
  - titulo: "IAM: boas práticas de segurança"
    url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
  - titulo: "IAM: boas práticas para o usuário raiz"
    url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

É o conjunto de cuidados que você toma antes e durante o uso da nuvem para que a conta não seja invadida e a fatura não surpreenda. Aqui o foco é a AWS, mas a lógica vale para qualquer provedor. A ideia central: na nuvem, erro de configuração custa dinheiro ou expõe dados, e nada avisa antes.

## Por que importa para um AI Engineer

Projetos de IA usam chaves de API de modelos, bancos com dados de clientes e máquinas que podem ser caras. Uma chave publicada no GitHub pode ser achada e usada por terceiros, e a fatura chega na sua conta. Uma instância esquecida ligada cobra todo mês. E dados pessoais mal protegidos trazem o problema da LGPD (veja lgpd-e-dados-pessoais). Faça o curso de fundamentos (veja aws-fundamentos) antes de configurar: sem ele, você não percebe o que o agente de programação sugeriu de errado.

## Como funciona

Siga esta lista, na ordem, antes de criar qualquer recurso:

- **MFA na conta raiz.** A conta raiz é a do e-mail do cadastro e tem poder total. Ative autenticação em dois fatores (MFA) nela.
- **Não use a raiz no dia a dia e não crie chave de acesso para ela.** Crie um usuário do IAM (ou acesso por IAM Identity Center) para trabalhar, também com MFA.
- **IAM com privilégio mínimo.** Dê a cada usuário, ou a cada aplicação, só as permissões de que precisa. Evite a permissão de administrador total para tudo. Se precisar de acesso a um bucket S3, conceda só a esse bucket.
- **Funções (roles) no lugar de chaves fixas.** Para uma aplicação rodando na AWS, use uma função do IAM, que entrega credenciais temporárias, em vez de chaves de acesso de longa duração.
- **Bloqueio de acesso público no S3.** Mantenha o Block Public Access ligado e abra um bucket só com motivo claro.
- **Alerta no AWS Budgets.** Crie um orçamento com valor baixo, por exemplo US$ 5 (valor ilustrativo), com aviso por e-mail. O Budgets avisa, mas não bloqueia o gasto, e os dados têm atraso; olhe o painel de custos com frequência. O Cost Explorer mostra o gasto por serviço e o Cost Anomaly Detection avisa de gastos fora do padrão.
- **Entenda o nível gratuito.** O que está incluído e por quanto tempo mudam; leia a regra vigente na página da AWS.
- **Segredos fora do código.** Chave de API e senha ficam em variável de ambiente ou num gerenciador de segredos. O `.env` entra no `.gitignore`. Se uma chave vazar, revogue e gere outra na hora; apagar o commit não basta.
- **Desligue e apague ao terminar.** Cada estudo termina com a remoção dos recursos criados.
- **Atenção à região.** Defina uma região padrão e confira as outras. Um recurso esquecido numa região que você não abre continua cobrando.

Para conferir instâncias numa região, use a AWS CLI:

```bash
aws ec2 describe-instances --region sa-east-1 \
  --query "Reservations[].Instances[].[InstanceId,State.Name]" --output text
```

Repita para as regiões que você usou (a `sa-east-1` é a de São Paulo). Cobranças escondidas costumam vir de bancos RDS ligados, volumes EBS de máquinas já apagadas, Elastic IPs sem uso, load balancers e NAT gateways.

## Na prática

No PF: Agente Completo, os segredos (chave do modelo, senha do banco) entram como variáveis do serviço, nunca na imagem Docker nem no repositório, e o pipeline usa os segredos do GitHub (veja ci-cd). O alerta de orçamento é critério de aceite do projeto. Se usar o Bedrock ou chamadas pagas de modelo, associe o custo por pergunta ao orçamento (veja custo-e-latencia).

## Erros comuns

- **Chave no repositório.** Mesmo num repositório privado, ela acaba exposta quando você o abre ou compartilha.
- **Permissão total "para facilitar".** Se a chave vazar, o estrago é total.
- **Orçamento sem e-mail confirmado** ou valor alto demais para fazer sentido.
- **Fazer só o que o agente sugeriu**, sem entender a permissão ou o custo da configuração.

## Como estudar

1. Leia as boas práticas do usuário raiz e do IAM (2 horas).
2. Crie uma conta de estudo e aplique os itens da lista, um a um (meio dia).
3. Crie um orçamento de valor baixo e teste o aviso (1 hora).
4. Pratique uma chave vazada: revogue e gere outra num projeto de teste (1 hora).
5. Crie e apague um recurso simples e confira o custo no painel no dia seguinte (1 dia).

## Como mostrar

No portfólio, o README do PF inclui uma seção de segurança com o que foi feito (MFA, usuário com permissões mínimas, segredos fora do código, alerta de custo), sem expor nenhum valor secreto. Na entrevista, descreva o que verifica antes de criar recursos e como você reagiria a uma chave vazada.
