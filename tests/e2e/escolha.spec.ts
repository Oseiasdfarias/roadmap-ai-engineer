import { expect, test } from '@playwright/test';

test('home começa genérica, com a escolha visível', async ({ page }) => {
  await page.goto('./');
  const esc = page.locator('#escolha');
  await expect(esc.getByRole('heading', { name: 'Onde você está hoje?' })).toBeVisible();
  for (const r of ['Estudante', 'Dev de outra área', 'Dados/ML', 'Fora da TI']) await expect(esc.getByText(r, { exact: true })).toBeVisible();
  await expect(esc.locator('[data-perfil-resumo]')).toBeHidden();
  await expect(page.locator('.hero-ctas [data-perfil-cta]')).toHaveText('Começar pelo nível 1');
  await expect(page.locator('[data-periodo-nome]').first()).toHaveText('Começo');
});

test('escolher dev e nível 3 ajusta a home inteira; voltar ao padrão restaura', async ({ page }) => {
  await page.goto('./');
  const esc = page.locator('#escolha');
  await esc.getByText('Dev de outra área', { exact: true }).click();
  await expect(esc.locator('[data-perfil-resumo]')).toBeVisible();
  await expect(esc.locator('[data-resumo="situacao"]')).toHaveText('Dev de outra área');
  await expect(page.locator('#tempo h2')).toContainText('Sua trilha:');
  await expect(page.locator('#carreira [data-fase-item="4"] [data-perfil-aqui]')).toBeVisible();
  await expect(page.locator('[data-perfil-fase-rot]').first()).toHaveText('Transição ou vaga direta');
  await expect(page.locator('[data-nivel-painel]:visible .nv-lado [data-perfil-carreira="dev"]')).toBeVisible();
  await expect(page.locator('[data-nivel-painel]:visible .nv-lado .fase-t')).toBeHidden();

  await expect(esc.getByRole('button', { name: 'Concluir' })).toBeVisible();
  await esc.locator('.esc-nivel', { hasText: 'Construção' }).click();
  await expect(esc.locator('[data-resumo="nivel"]')).toContainText('nível 3');
  const cta = page.locator('.hero-ctas [data-perfil-cta]');
  await expect(cta).toHaveText('Continuar pelo nível 3');
  await expect(cta).toHaveAttribute('href', '/roadmap-ai-engineer/nivel/3/');
  await expect(page.locator('[data-periodo-nome="1"]')).toHaveText('Já domina');
  await expect(page.locator('[data-estacao="2"]')).toHaveClass(/atual/);
  await expect(page.locator('[data-estacao="3"]')).toHaveClass(/proxima/);
  await expect(page.locator('[data-nivel-painel="3"]')).toBeVisible();
  await expect(page.locator('[data-perfil-ja="1"]')).toBeVisible();
  await expect(page.locator('#tempo .tl-barra[data-nivel="1"]')).toBeHidden();
  await expect(page.locator('footer [data-perfil-cta-titulo]')).toContainText('nível 3');
  await esc.getByRole('button', { name: 'Concluir' }).click();
  await expect(esc.locator('[data-escolha-form]')).toBeHidden();
  await esc.getByRole('button', { name: 'Alterar' }).click();
  await expect(esc.locator('[data-escolha-form]')).toBeVisible();

  await esc.getByRole('button', { name: 'Voltar ao roteiro padrão' }).click();
  await expect(esc.getByRole('heading', { name: 'Onde você está hoje?' })).toBeVisible();
  await expect(page.locator('#tempo h2')).toHaveText('Meses, com 10 a 15 horas por semana.');
  await expect(cta).toHaveText('Começar pelo nível 1');
  await expect(cta).toHaveAttribute('href', '/roadmap-ai-engineer/nivel/1/');
  await expect(page.locator('[data-periodo-nome]').first()).toHaveText('Começo');
  await expect(page.locator('#tempo .tl-barra[data-nivel="1"]')).toBeVisible();
  await expect(page.locator('#carreira [data-perfil-aqui]:visible')).toHaveCount(0);
  await expect(page.locator('footer [data-perfil-cta-titulo]')).toHaveText('Comece hoje pelo nível 1.');
});

test('a escolha vale nas outras páginas e na calculadora', async ({ page }) => {
  await page.goto('./');
  await page.locator('#escolha').getByText('Dados/ML', { exact: true }).click();
  await page.goto('./nivel/1/');
  await expect(page.locator('.pg-meta [data-perfil-duracao="1"]')).not.toHaveText('4 a 6 meses');
  await page.goto('./calculadora/');
  await expect(page.getByRole('radio', { name: 'Dados/ML' })).toBeChecked();
});

test('calculadora: nível 3 pula os tópicos dos níveis 1 e 2', async ({ page }) => {
  await page.goto('./calculadora/');
  await page.getByRole('radio', { name: 'Nível 3 · Construção' }).check();
  await expect(page.locator('[data-calc-marca="python-fundamentos"]')).toHaveText('Pular');
  await expect(page.locator('[data-calc-marca="rag"]')).toHaveText('Pular');
  await expect(page.locator('[data-calc-marca="fastapi"]')).toHaveText('Estudar');
  await expect(page.locator('[data-calc-meses="1"]')).toHaveText('já domina');
});

test('perfil avançado: nada de estágio ou júnior visível na home', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('rm-perfil-v1', 's=dev&h=12&b=python-basico,git&n=3'));
  await page.goto('./');
  const visiveis = await page.evaluate(() => {
    const out: string[] = [];
    const w = document.createTreeWalker(document.querySelector('main')!, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = w.nextNode())) {
      const t = n.textContent!.trim();
      if (t && n.parentElement!.checkVisibility() && /est[aá]gi|j[uú]nior|gradua|faculdade/i.test(t)) out.push(t);
    }
    return out;
  });
  // O quadro de carreira do perfil pode citar "sem passar por estágio"; o resto não.
  expect(visiveis.filter((t) => !/sem passar por estágio/.test(t))).toEqual([]);
  await expect(page.locator('#carreira h2')).toHaveText('Seu caminho até IA, a partir de onde você está.');
  await expect(page.locator('#carreira [data-fase-item="2"]')).toBeHidden();
  await page.getByRole('button', { name: 'Mostrar todas as fases' }).click();
  await expect(page.locator('#carreira [data-fase-item="2"]')).toBeVisible();
});

test('estudante continua vendo estágio na home', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('rm-perfil-v1', 's=estudante&h=12&b=&n=1'));
  await page.goto('./');
  await expect(page.locator('#carreira [data-fase-item="2"]')).toBeVisible();
  await expect(page.locator('#carreira h2')).toHaveText('O caminho até a vaga, fase por fase.');
  await expect(page.getByRole('button', { name: 'Mostrar todas as fases' })).toBeHidden();
});

test('painel do nível esconde o que o perfil manda pular', async ({ page }) => {
  await page.goto('./');
  const painel = page.locator('[data-nivel-painel="1"]');
  await expect(painel.locator('[data-painel-topico="python-fundamentos"]')).toBeVisible();
  await page.locator('#escolha').getByText('Dev de outra área', { exact: true }).click();
  await expect(painel.locator('[data-painel-topico="python-fundamentos"]')).toBeHidden();
  await expect(painel.locator('[data-painel-topico="git-e-github"]')).toBeHidden();
  await expect(painel.locator('[data-painel-topico="python-poo-e-tipos"]')).toBeVisible();
  await expect(painel.locator('[data-painel-ocultos]')).toContainText('4 tópicos que você já domina estão ocultos');
  await expect(painel.locator('[data-painel-ntopicos]')).toHaveText('9 de 13 tópicos para você');
  await page.locator('#escolha').getByRole('button', { name: 'Voltar ao roteiro padrão' }).click();
  await expect(painel.locator('[data-painel-topico="python-fundamentos"]')).toBeVisible();
  await expect(painel.locator('[data-painel-ocultos]')).toBeHidden();
  await expect(painel.locator('[data-painel-ntopicos]')).toHaveText('13 tópicos');
});

test('ajuste de nível em destaque: primeiro botão da abertura e no menu', async ({ page }) => {
  await page.goto('./');
  const primeiro = page.locator('.hero-ctas a').first();
  await expect(primeiro).toHaveText('Ajustar ao meu nível');
  await primeiro.click();
  await expect(page.locator('#escolha')).toBeInViewport();
  await expect(page.locator('.nav a.nav-destaque')).toHaveAttribute('href', '/roadmap-ai-engineer/calculadora/');
});
