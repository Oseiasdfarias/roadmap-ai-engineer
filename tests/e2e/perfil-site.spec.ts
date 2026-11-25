import { expect, test, type Page } from '@playwright/test';

const DEV = 's=dev&h=12&b=python-basico,terminal,git,sql,apis-web,testes';
const comPerfil = (page: Page, perfil: string) =>
  page.addInitScript((p) => {
    if (!sessionStorage.getItem('perfil-posto')) {
      localStorage.setItem('rm-perfil-v1', p);
      sessionStorage.setItem('perfil-posto', '1');
    }
  }, perfil);

test.describe('sem perfil, o site fica como antes', () => {
  test('home e nível mostram a referência', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('#tempo h2')).toHaveText('Meses, com 10 a 15 horas por semana.');
    await expect(page.locator('[data-perfil-aviso]:visible')).toHaveCount(0);
    await expect(page.locator('[data-perfil-carreira]:visible')).toHaveCount(0);
    await page.goto('./nivel/1/');
    await expect(page.locator('.pg-meta .etq')).toContainText('4 a 6 meses');
  });
});

test.describe('com perfil dev salvo', () => {
  test.beforeEach(async ({ page }) => comPerfil(page, DEV));

  test('linha do tempo da home vira a trilha da pessoa', async ({ page }) => {
    await page.goto('./');
    const h2 = page.locator('#tempo h2');
    await expect(h2).toContainText('Sua trilha:');
    await expect(h2).toContainText('12 horas por semana');
    await expect(page.locator('#tempo [data-perfil-aviso]')).toBeVisible();
    await expect(page.locator('#tempo [data-perfil-generico]')).toBeHidden();
    await expect(page.locator('#tempo [data-perfil-aviso] a')).toHaveAttribute('href', '/roadmap-ai-engineer/calculadora/');
    // carreira de dev no lugar das barras de estágio
    await expect(page.locator('#tempo .tl-fase[data-fase]:visible')).toHaveCount(0);
    await expect(page.locator('#tempo [data-perfil-tl-carreira]')).toContainText('Transição dentro do time ou vaga direta');
    // a régua acompanha o total
    const colunas = await page.locator('#tempo .tl-reg span').count();
    expect(colunas).toBeLessThan(25);
  });

  test('durações dos níveis mudam na home, no nível e na fase', async ({ page }) => {
    await page.goto('./');
    const dur = page.locator('[data-perfil-duracao="1"]').first();
    await expect(dur).not.toHaveText('4 a 6 meses');
    await expect(dur).toHaveText(/^\d+( a \d+)? (mês|meses)$/);
    await page.goto('./nivel/1/');
    await expect(page.locator('.pg-meta [data-perfil-duracao="1"]')).not.toHaveText('4 a 6 meses');
    await page.goto('./fase/2/');
    await expect(page.locator('.niv-links [data-perfil-duracao="2"]')).not.toHaveText('2 a 3 meses');
  });

  test('carreira da home e fases 1 e 2 mostram o caminho do perfil', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('#carreira [data-perfil-carreira="dev"]')).toBeVisible();
    await expect(page.locator('#carreira [data-perfil-generico]:visible')).toHaveCount(0);
    for (const f of [1, 2]) {
      await page.goto(`./fase/${f}/`);
      await expect(page.locator('[data-perfil-carreira="dev"]')).toBeVisible();
      await expect(page.locator('[data-nota-perfil]')).toBeHidden();
    }
  });
});

test.describe('perfil estudante', () => {
  test('mantém as barras de estágio, mas ajusta os meses', async ({ page }) => {
    await comPerfil(page, 's=estudante&h=30&b=');
    await page.goto('./');
    await expect(page.locator('#tempo .tl-fase[data-fase]:visible')).toHaveCount(3);
    await expect(page.locator('#tempo h2')).toContainText('30 horas por semana');
    await expect(page.locator('#tempo [data-perfil-generico]')).toBeHidden();
    await expect(page.locator('#carreira [data-perfil-carreira]:visible')).toHaveCount(0);
  });
});

test.describe('calculadora salva só quando a pessoa mexe', () => {
  test('abrir um link compartilhado não troca o perfil salvo', async ({ page }) => {
    await comPerfil(page, DEV);
    await page.goto('./calculadora/?s=dados&h=30');
    await expect(page.getByRole('radio', { name: 'Dados/ML' })).toBeChecked();
    expect(await page.evaluate(() => localStorage.getItem('rm-perfil-v1'))).toBe(DEV);
    await page.locator('[data-calc-bloco="docker"]').check();
    expect(await page.evaluate(() => localStorage.getItem('rm-perfil-v1'))).toContain('s=dados');
  });

  test('voltar ao roteiro padrão apaga o perfil', async ({ page }) => {
    await comPerfil(page, DEV);
    await page.goto('./calculadora/');
    await page.getByRole('button', { name: 'Voltar ao roteiro padrão' }).click();
    expect(await page.evaluate(() => localStorage.getItem('rm-perfil-v1'))).toBeNull();
    await expect(page.getByRole('radio', { name: 'Estudante' })).toBeChecked();
    await page.goto('./');
    await expect(page.locator('#tempo h2')).toHaveText('Meses, com 10 a 15 horas por semana.');
  });
});
