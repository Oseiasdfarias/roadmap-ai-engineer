import { expect, test } from '@playwright/test';

test('capa inválida cai para o ícone do site', async ({ page }) => {
  await page.goto('dev/refcard/');
  const card = page.locator('a.ref');
  await expect(card.locator('img.ico')).toHaveCount(1);
  await expect(card.locator('img.capa')).toHaveCount(0);
});

test('a página de teste é noindex e fora do Pagefind', async ({ page }) => {
  await page.goto('dev/refcard/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('main[data-pagefind-ignore]')).toHaveCount(1);
});

test('a ilustração é SVG inline, escondida de leitores de tela', async ({ page }) => {
  await page.goto('dev/refcard/');
  await expect(page.locator('svg.ilus-svg[aria-hidden="true"]')).toHaveCount(1);
});
