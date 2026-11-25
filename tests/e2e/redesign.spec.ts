import { expect, test } from '@playwright/test';

const CANAIS: Record<string, string> = {
  Portfólio: 'https://oseiasdfarias.github.io/',
  LinkedIn: 'https://www.linkedin.com/in/oseiasfarias/',
  GitHub: 'https://github.com/Oseiasdfarias',
  Medium: 'https://medium.com/@oseiasfarias',
  YouTube: 'https://www.youtube.com/@otensor',
};

test.describe('nova página inicial', () => {
  test('mostra as seções 01 a 04 na ordem', async ({ page }) => {
    await page.goto('./');
    const kickers = await page.locator('main section:not(#escolha) .kicker').allTextContents();
    expect(kickers).toEqual(['01 — Linha do tempo', '02 — Níveis', '03 — Portfólio', '04 — Carreira']);
    const ids = await page.locator('main > section[id]').evaluateAll((els) => els.map((e) => e.id));
    expect(ids).toEqual(['escolha', 'tempo', 'niveis', 'portfolio', 'carreira']);
  });

  test('a linha do tempo tem quatro barras de nível com os links certos', async ({ page }) => {
    await page.goto('./');
    const barras = page.locator('#tempo a.tl-barra');
    await expect(barras).toHaveCount(4);
    for (let n = 1; n <= 4; n++) {
      await expect(barras.nth(n - 1)).toHaveAttribute('href', `/roadmap-ai-engineer/nivel/${n}/`);
    }
    await expect(page.locator('#tempo a.tl-fase[data-fase]')).toHaveCount(3);
  });

  test('o rodapé tem a chamada e os cinco canais com as URLs exatas', async ({ page }) => {
    await page.goto('./');
    const rodape = page.locator('footer');
    await expect(rodape.getByRole('link', { name: 'Abrir o nível 1' })).toHaveAttribute('href', '/roadmap-ai-engineer/nivel/1/');
    for (const [nome, href] of Object.entries(CANAIS)) {
      await expect(rodape.getByRole('link', { name: nome, exact: true })).toHaveAttribute('href', href);
    }
    await expect(rodape.getByRole('link', { name: 'Como contribuir' })).toHaveAttribute('href', /CONTRIBUTING\.md$/);
  });

  test('o tema alterna nos dois sentidos, muda as cores e persiste', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('./');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    const fundo = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(await fundo()).toBe('rgb(11, 13, 16)');
    await page.getByRole('button', { name: 'Alternar tema' }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    expect(await fundo()).toBe('rgb(247, 248, 250)');
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await page.getByRole('button', { name: 'Alternar tema' }).click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('marcar um tópico no painel do nível atualiza o contador do cabeçalho', async ({ page }) => {
    await page.goto('./');
    const contador = page.locator('[data-progresso-global] [data-progresso-texto]');
    await expect(contador).toHaveText('0 / 55');
    await page.getByRole('button', { name: 'Marcar como estudado: Python: fundamentos' }).click();
    await expect(contador).toHaveText('1 / 55');
    await expect(page.locator('[data-nivel-painel="1"] [data-progresso-texto]').first()).toHaveText(/^1 \/ 13$/);
    await page.reload();
    await expect(contador).toHaveText('1 / 55');
  });

  test('o painel grande passa para o primeiro nível incompleto', async ({ page }) => {
    await page.addInitScript(() => {
      const ids = ['python-fundamentos', 'python-poo-e-tipos', 'terminal-e-ambientes', 'git-e-github', 'sql-essencial', 'evolucao-dos-modelos', 'tokens-e-janela-de-contexto', 'alucinacao', 'embeddings', 'fine-tuning', 'api-e-parametros', 'saida-estruturada', 'prompt-engineering'];
      localStorage.setItem('rm-progresso-v1', JSON.stringify(Object.fromEntries(ids.map((i) => ['topico:' + i, true]))));
    });
    await page.goto('./');
    await expect(page.locator('[data-nivel-painel="2"]')).toBeVisible();
    await expect(page.locator('[data-nivel-painel="1"]')).toBeHidden();
    await expect(page.locator('[data-nivel-card="1"]')).toBeVisible();
  });

  test('navegação do cabeçalho: âncoras na home e links absolutos fora dela', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Níveis' })).toHaveAttribute('href', '#niveis');
    await page.goto('sobre/');
    await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Níveis' })).toHaveAttribute('href', '/roadmap-ai-engineer/#niveis');
  });

  test('sem rolagem horizontal da página em 390 px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('./');
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(sobra).toBeLessThanOrEqual(0);
  });

  test('o cabeçalho fica em uma linha em 960 px', async ({ page }) => {
    await page.setViewportSize({ width: 960, height: 800 });
    await page.goto('./');
    const alt = await page.locator('header.bar').evaluate((e) => e.getBoundingClientRect().height);
    expect(alt).toBeLessThanOrEqual(84);
    const a = await page.locator('.nav a').first().evaluate((e) => e.getBoundingClientRect().height);
    expect(a).toBeLessThan(44);
  });
});
