import { expect, test } from '@playwright/test';

test.describe('página de nível', () => {
  test('nível 1: duas colunas, 13 linhas, critérios e navegação', async ({ page }) => {
    await page.goto('nivel/1/');
    await expect(page.locator('.cols .row')).toHaveCount(13);
    await expect(page.getByRole('heading', { name: 'Programação (sem IA)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Fundamentos de LLM (sem matemática)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Como saber que terminou' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Próximo.*Nível 2/ })).toBeVisible();
    await expect(page.getByText('Anterior')).toHaveCount(0);
  });

  test('expandir mostra referências e o link do tópico', async ({ page }) => {
    await page.goto('nivel/1/');
    const linha = page.locator('.row', { hasText: 'Python: fundamentos' });
    await linha.locator('summary').click();
    await expect(linha.locator('.ref').first()).toBeVisible();
    await expect(linha.getByRole('link', { name: /Ler o resumo completo/ })).toHaveAttribute(
      'href',
      '/roadmap-ai-engineer/topico/python-fundamentos/',
    );
  });

  test('progresso marcado no início aparece no nível', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Python: fundamentos', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Marcar como estudado' }).click();
    await page.goto('nivel/1/');
    await expect(page.locator('.row[data-progresso-id="topico:python-fundamentos"]')).toHaveClass(/feito/);
    await expect(page.locator('[data-progresso-conta]').first()).toContainText('1 de 13');
  });

  test('nível 2 mostra a carreira em paralelo', async ({ page }) => {
    await page.goto('nivel/2/');
    const bloco = page.locator('.cross');
    await expect(bloco.getByRole('heading', { name: /Ao mesmo tempo, na carreira/ })).toBeVisible();
    await expect(bloco.locator('.row')).toHaveCount(4);
    await expect(bloco.getByRole('link', { name: /Abrir a fase/ })).toHaveAttribute('href', '/roadmap-ai-engineer/fase/2/');
  });

  test('nível 3 lista os quatro projetos', async ({ page }) => {
    await page.goto('nivel/3/');
    await expect(page.locator('.projs > a')).toHaveCount(4);
  });
});

test.describe('página de fase', () => {
  test('fase 2 liga aos níveis 2 e 3', async ({ page }) => {
    await page.goto('fase/2/');
    const bloco = page.locator('.cross');
    await expect(bloco.getByRole('heading', { name: 'No estudo, no mesmo período' })).toBeVisible();
    await expect(bloco.getByRole('link', { name: /Nível 2/ })).toHaveAttribute('href', '/roadmap-ai-engineer/nivel/2/');
    await expect(bloco.getByRole('link', { name: /Nível 3/ })).toHaveAttribute('href', '/roadmap-ai-engineer/nivel/3/');
    await expect(page.locator('.row')).toHaveCount(4);
  });
});
