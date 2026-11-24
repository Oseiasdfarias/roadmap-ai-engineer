import { expect, test } from '@playwright/test';

test('a tecla / abre a busca e "reranking" leva ao tópico de busca híbrida', async ({ page }) => {
  await page.goto('./');
  await page.keyboard.press('/');
  const dialogo = page.getByRole('dialog', { name: 'Buscar' });
  await expect(dialogo).toBeVisible();
  await dialogo.getByRole('searchbox').fill('reranking');
  const resultado = dialogo.locator('a[href*="/topico/busca-hibrida-e-reranking/"]').first();
  await expect(resultado).toBeVisible({ timeout: 15_000 });
  await resultado.click();
  await expect(page).toHaveURL(/\/roadmap-ai-engineer\/topico\/busca-hibrida-e-reranking\/$/);
});

test('Ctrl+K abre e Esc fecha a busca', async ({ page }) => {
  await page.goto('./');
  await page.keyboard.press('Control+k');
  const dialogo = page.getByRole('dialog', { name: 'Buscar' });
  await expect(dialogo).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialogo).toBeHidden();
});

test('a página Sobre traz autor, canais, uso, licenças e link para as issues', async ({ page }) => {
  await page.goto('./sobre/');
  const main = page.locator('main');
  await expect(main.getByText('Oséias Farias').first()).toBeVisible();
  for (const canal of ['Portfólio', 'LinkedIn', 'GitHub', 'Medium', 'YouTube']) {
    await expect(main.getByRole('link', { name: canal, exact: true })).toBeVisible();
  }
  await expect(main.getByRole('heading', { name: 'Como usar este roadmap' })).toBeVisible();
  await expect(main).toContainText('10 a 15 horas');
  await expect(main.getByText('MIT').first()).toBeVisible();
  await expect(main.getByText('CC BY 4.0').first()).toBeVisible();
  await expect(main.getByRole('link', { name: 'Sugerir correção' })).toHaveAttribute('href', /\/issues\/new\/choose$/);
});

test('uma rota inexistente mostra a 404 com link para o mapa', async ({ page }) => {
  await page.goto('./nao-existe/');
  await expect(page.getByRole('heading', { name: /não encontrada/i })).toBeVisible();
  await expect(page.locator('main').getByRole('link', { name: /mapa/i })).toHaveAttribute('href', '/roadmap-ai-engineer/');
});

test('a prévia social existe e o tópico aponta para ela', async ({ page, request }) => {
  const resposta = await request.get('/roadmap-ai-engineer/og/topico/rag.png');
  expect(resposta.status()).toBe(200);
  expect(resposta.headers()['content-type']).toMatch(/^image\//);
  await page.goto('./topico/rag/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://oseiasdfarias.github.io/roadmap-ai-engineer/og/topico/rag.png',
  );
});
