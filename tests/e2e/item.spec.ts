import { expect, test } from '@playwright/test';

test.describe('página de tópico, dica e projeto', () => {
  test('tópico: título, migalha, resumo e botão de marcar', async ({ page }) => {
    await page.goto('topico/rag/');
    await expect(page.getByRole('heading', { level: 1, name: 'RAG' })).toBeVisible();
    const migalha = page.getByRole('navigation', { name: 'Você está em' });
    await expect(migalha).toContainText('Mapa');
    await expect(migalha).toContainText('Nível 2 · Conceitos');
    await expect(migalha.locator('[aria-current="page"]')).toHaveText('RAG');
    await expect(page.locator('.resumo')).toContainText('Geração aumentada por recuperação');
    const botao = page.locator('button[data-alternar="topico:rag"]');
    await expect(botao).toHaveAttribute('aria-pressed', 'false');
    await botao.click();
    await expect(botao).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.locator('button[data-alternar="topico:rag"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('sumário lateral com âncoras em tela larga', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('topico/rag/');
    const sumario = page.getByRole('navigation', { name: 'Nesta página' });
    await expect(sumario).toBeVisible();
    await sumario.getByRole('link', { name: 'Como funciona' }).click();
    await expect(page).toHaveURL(/#como-funciona$/);
    await expect(page.locator('h2#como-funciona')).toBeInViewport();
  });

  test('dica: migalha com a fase', async ({ page }) => {
    await page.goto('carreira/curriculo/');
    await expect(page.getByRole('navigation', { name: 'Você está em' })).toContainText('Fase 2 · Estágio');
    await expect(page.locator('button[data-alternar="carreira:curriculo"]')).toBeVisible();
  });

  test('projeto: versões em camadas, stack e critérios', async ({ page }) => {
    await page.goto('projeto/p1-assistente-da-montadora/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Assistente da Montadora');
    await expect(page.locator('.camadas li')).toHaveCount(7);
    await expect(page.locator('.camadas')).toContainText('Observabilidade e custo');
    await expect(page.getByRole('heading', { name: 'Critérios do projeto' })).toBeVisible();
    await expect(page.locator('button[data-alternar]')).toHaveCount(0);
  });

  test('anterior e próximo navegam dentro do nível', async ({ page }) => {
    await page.goto('topico/rag/');
    const prox = page.locator('a[rel="next"]');
    await expect(prox).toHaveCount(1);
    const href = await prox.getAttribute('href');
    expect(href).toMatch(/\/roadmap-ai-engineer\/topico\//);
    await prox.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator('a[rel="prev"]')).toHaveAttribute('href', '/roadmap-ai-engineer/topico/rag/');
  });

  test('relacionados aparecem como links', async ({ page }) => {
    await page.goto('topico/rag/');
    const rel = page.locator('.relacionados');
    await expect(rel.getByRole('link')).toHaveCount(2);
    await expect(rel.getByRole('link', { name: 'Evals' }).first()).toHaveAttribute('href', '/roadmap-ai-engineer/topico/evals/');
  });
});
