import { expect, test } from '@playwright/test';

test('mapa mostra todos os tópicos e dicas, agrupados', async ({ page }) => {
  await page.goto('./progresso/');
  await expect(page.getByRole('heading', { level: 1, name: 'Seu progresso' })).toBeVisible();
  await expect(page.locator('.mapa-q[data-tipo="topico"]')).toHaveCount(38);
  await expect(page.locator('.mapa-q[data-tipo="dica"]')).toHaveCount(17);
  await expect(page.locator('[data-mapa-nivel]')).toHaveCount(4);
  await expect(page.locator('[data-mapa-nivel="1"] .mapa-grupo')).toHaveCount(2);
  await expect(page.locator('[data-mapa-proximo] a')).toHaveAttribute('href', '/roadmap-ai-engineer/topico/python-fundamentos/');
});

test('marcar na lista pinta o quadrado e atualiza o próximo tópico', async ({ page }) => {
  await page.goto('./progresso/');
  const q = page.locator('.mapa-q[data-progresso-id="topico:python-fundamentos"]');
  await expect(q).not.toHaveClass(/feito/);
  await page.locator('[data-mapa-nivel="1"] summary.mapa-abrir').click();
  await page.locator('[data-mapa-nivel="1"] button[data-alternar="topico:python-fundamentos"]').first().click();
  await expect(q).toHaveClass(/feito/);
  await expect(page.locator('[data-mapa-nivel="1"] [data-progresso-conta] [data-progresso-texto]').first()).toHaveText('1 / 13');
  await expect(page.locator('[data-mapa-proximo] a')).not.toHaveAttribute('href', /python-fundamentos/);
});

test('com perfil, quadrados de pular e revisar ficam marcados e o próximo respeita o perfil', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('rm-perfil-v1', 's=dev&h=12&b=python-basico,terminal,git,sql,apis-web,testes&n=1'));
  await page.goto('./progresso/');
  await expect(page.locator('.mapa-q[data-progresso-id="topico:python-fundamentos"]')).toHaveAttribute('data-marca', 'pular');
  await expect(page.locator('.mapa-q[data-progresso-id="topico:testes-e-evals-no-projeto"]')).toHaveAttribute('data-marca', 'revisar');
  await expect(page.locator('[data-mapa-proximo] a')).toHaveAttribute('href', '/roadmap-ai-engineer/topico/python-poo-e-tipos/');
});

test('a barra de progresso do topo leva ao mapa', async ({ page }) => {
  await page.goto('./sobre/');
  await page.locator('.bar a.prog').click();
  await expect(page).toHaveURL(/\/progresso\/$/);
});

test('home tem o resumo do mapa com botão em destaque para o mapa completo', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('rm-progresso-v1', JSON.stringify({ 'topico:rag': true })));
  await page.goto('./');
  const sec = page.locator('#mapa-resumo');
  await expect(sec.locator('.mapa-q[data-tipo="topico"]')).toHaveCount(38);
  await expect(sec.locator('.mapa-q[data-tipo="dica"]')).toHaveCount(17);
  await expect(sec.locator('.mapa-q[data-progresso-id="topico:rag"]')).toHaveClass(/feito/);
  const cta = sec.getByRole('link', { name: 'Abrir o mapa completo' });
  await expect(cta).toHaveClass(/mres-cta/);
  await cta.click();
  await expect(page).toHaveURL(/\/progresso\/$/);
});
