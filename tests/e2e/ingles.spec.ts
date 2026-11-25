import { expect, test } from '@playwright/test';

test.describe('versão em inglês', () => {
  test('a home em inglês tem lang, abas e textos em inglês', async ({ page }) => {
    await page.goto('en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1, name: 'Roadmap AI Engineer' })).toBeVisible();
    const abas = page.getByRole('navigation', { name: 'Sections' });
    await expect(abas.getByRole('link', { name: 'Levels' })).toHaveAttribute('href', '#niveis');
    await expect(abas.getByRole('link', { name: 'Calculator' })).toHaveAttribute('href', '/roadmap-ai-engineer/en/calculator/');
    await expect(page.locator('#autor .kicker')).toHaveText('05 — Who made it');
  });

  test('o seletor de idioma leva à página equivalente nos dois sentidos', async ({ page }) => {
    await page.goto('topico/rag/');
    const paraIngles = page.locator('[data-idioma-link]');
    await expect(paraIngles).toHaveText('EN');
    await paraIngles.click();
    await expect(page).toHaveURL(/\/roadmap-ai-engineer\/en\/topic\/rag\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 2, name: 'What it is' })).toBeVisible();
    await page.locator('[data-idioma-link]').click();
    await expect(page).toHaveURL(/\/roadmap-ai-engineer\/topico\/rag\/$/);
  });

  test('hreflang aponta para as duas versões', async ({ page }) => {
    await page.goto('en/level/5/');
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', 'https://oseiasdfarias.github.io/roadmap-ai-engineer/en/level/5/');
    await expect(page.locator('link[hreflang="pt-BR"]')).toHaveAttribute('href', 'https://oseiasdfarias.github.io/roadmap-ai-engineer/nivel/5/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Frontier');
  });

  test('o progresso marcado em inglês aparece em português', async ({ page }) => {
    await page.goto('en/topic/rag/');
    const botao = page.locator('button[data-alternar="topico:rag"]');
    await expect(botao).toHaveAccessibleName('Mark as studied');
    await botao.click();
    await expect(botao).toHaveAttribute('aria-pressed', 'true');
    await page.goto('topico/rag/');
    await expect(page.locator('button[data-alternar="topico:rag"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('a calculadora em inglês calcula com textos em inglês', async ({ page }) => {
    await page.goto('en/calculator/');
    await expect(page.getByRole('heading', { level: 1, name: 'Calculate your path' })).toBeVisible();
    await expect(page.locator('[data-calc-total]')).toContainText('months');
  });

  test('a navegação lateral e os diagramas estão em inglês', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('en/topic/rag/');
    const lateral = page.getByRole('navigation', { name: 'Roadmap' });
    await expect(lateral.locator('a[aria-current="page"]')).toHaveText('RAG');
    await expect(lateral).toContainText('Level 2 · Concepts');
    await expect(page.locator('figure.fluxo figcaption').first()).toContainText('RAG flow');
    await expect(page.locator('[data-fluxo-cheia]').first()).toHaveAttribute('aria-label', 'View the diagram full screen');
  });

  test('a prévia social em inglês existe', async ({ request }) => {
    const r = await request.get('og/en/topico/rag.png');
    expect(r.status()).toBe(200);
    expect(r.headers()['content-type']).toContain('image/png');
  });
});
