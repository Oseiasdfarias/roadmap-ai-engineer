import { expect, test } from '@playwright/test';

test.describe('página inicial', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
  });

  test('mostra os seis períodos e o progresso zerado', async ({ page }) => {
    await expect(page.locator('[data-periodo]')).toHaveCount(6);
    await expect(page.locator('[data-progresso-global] [data-progresso-texto]')).toHaveText('0 de 55 · 0%');
  });

  test('painel abre, marca, persiste e devolve o foco', async ({ page }) => {
    const pilula = page.getByRole('button', { name: 'Python: fundamentos' });
    await pilula.click();

    const dialogo = page.getByRole('dialog');
    await expect(dialogo).toBeVisible();
    await expect(dialogo.getByRole('heading', { name: 'Python: fundamentos' })).toBeVisible();
    await expect(dialogo.getByRole('link', { name: /Ler o resumo completo/ })).toHaveAttribute(
      'href',
      '/roadmap-ai-engineer/topico/python-fundamentos/',
    );

    await dialogo.getByRole('button', { name: 'Marcar como estudado' }).click();
    await expect(page.locator('[data-progresso-global] [data-progresso-texto]')).toHaveText('1 de 55 · 2%');
    await expect(pilula).toHaveClass(/feito/);

    await page.reload();
    await expect(page.locator('[data-progresso-global] [data-progresso-texto]')).toHaveText('1 de 55 · 2%');
    await expect(page.getByRole('button', { name: 'Python: fundamentos' })).toHaveClass(/feito/);

    await page.getByRole('button', { name: 'Python: fundamentos' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Python: fundamentos' })).toBeFocused();
  });

  test('clique fora fecha o painel', async ({ page }) => {
    await page.getByRole('button', { name: 'Python: fundamentos' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.mouse.click(20, 300);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('clicar na área vazia dentro do painel não o fecha', async ({ page }) => {
    await page.getByRole('button', { name: 'Python: fundamentos' }).click();
    const dialogo = page.getByRole('dialog');
    await expect(dialogo).toBeVisible();
    const largura = page.viewportSize()!.width;
    // Espera a animação de entrada terminar (o painel encosta na borda direita).
    await expect.poll(async () => {
      const c = await dialogo.boundingBox();
      return c ? Math.round(c.x + c.width) : 0;
    }).toBe(largura);
    const caixa = (await dialogo.boundingBox())!;
    await page.mouse.click(caixa.x + caixa.width / 2, caixa.y + caixa.height - 20);
    await expect(dialogo).toBeVisible();
  });

  test('projeto abre o painel sem botão de marcar', async ({ page }) => {
    await page.getByRole('button', { name: /P1: Assistente da Montadora/ }).click();
    const dialogo = page.getByRole('dialog');
    await expect(dialogo).toBeVisible();
    await expect(dialogo.getByRole('button', { name: /estudado/i })).toHaveCount(0);
  });

  test('cards de cabeçalho levam ao nível e à fase', async ({ page }) => {
    await expect(page.locator('a.head-card[href="/roadmap-ai-engineer/nivel/1/"]')).toHaveCount(1);
    await expect(page.locator('a.head-card[href="/roadmap-ai-engineer/fase/1/"]')).toHaveCount(1);
  });
});
