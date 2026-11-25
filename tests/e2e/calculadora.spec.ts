import { expect, test, type Page } from '@playwright/test';

const PAG = './calculadora/';
const primeiroNumero = async (page: Page) => Number((await page.locator('[data-calc-total]').textContent())!.match(/\d+/)![0]);

test('padrão: estudante, 12 h, nada marcado, tudo a estudar', async ({ page }) => {
  const erros: string[] = [];
  page.on('pageerror', (e) => erros.push(e.message));
  await page.goto(PAG);
  await expect(page.getByRole('heading', { level: 1, name: 'Calcule a sua trilha' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Estudante' })).toBeChecked();
  await expect(page.locator('[data-calc-horas]')).toHaveValue('12');
  await expect(page.locator('[data-calc-bloco]:checked')).toHaveCount(0);
  await expect(page.locator('[data-calc-total]')).toContainText('meses');
  await expect(page.locator('[data-calc-marca="rag"]')).toHaveText('Estudar');
  await expect(page.locator('[aria-live="polite"] [data-calc-total]')).toHaveCount(1);
  await expect(page.locator('[data-calc-nojs]')).toBeHidden();
  expect(erros).toEqual([]);
});

test('preset dev marca blocos, pula tópicos e troca a carreira', async ({ page }) => {
  await page.goto(PAG);
  await page.getByRole('radio', { name: 'Dev de outra área' }).check();
  for (const id of ['python-basico', 'git', 'apis-web']) await expect(page.locator(`[data-calc-bloco="${id}"]`)).toBeChecked();
  await expect(page.locator('[data-calc-marca="python-fundamentos"]')).toHaveText('Pular');
  await expect(page.locator('[data-calc-marca="testes-e-evals-no-projeto"]')).toHaveText('Revisar');
  await expect(page.locator('[data-calc-carreira]:visible h3')).not.toContainText(/estágio/i);
  await expect(page.locator('[data-calc-aviso="python-fundamentos"]')).toBeVisible();
});

test('trocar a situação reaplica o preset', async ({ page }) => {
  await page.goto(PAG);
  await page.getByRole('radio', { name: 'Dev de outra área' }).check();
  await page.locator('[data-calc-bloco="git"]').uncheck();
  await page.getByRole('radio', { name: 'Dados/ML' }).check();
  await expect(page.locator('[data-calc-bloco="git"]')).toBeChecked();
  await expect(page.locator('[data-calc-bloco="dados-ml"]')).toBeChecked();
});

test('mais horas encurtam o total', async ({ page }) => {
  await page.goto(PAG);
  const com12 = await primeiroNumero(page);
  await page.locator('[data-calc-horas]').fill('40');
  await expect.poll(() => primeiroNumero(page)).toBeLessThan(com12);
});

test('a URL define e corrige o perfil', async ({ page }) => {
  await page.goto(`${PAG}?s=dev&h=20&b=git`);
  await expect(page.locator('[data-calc-horas]')).toHaveValue('20');
  await expect(page.locator('[data-calc-bloco]:checked')).toHaveCount(1);
  await expect(page.locator('[data-calc-bloco="git"]')).toBeChecked();
  const erros: string[] = [];
  page.on('pageerror', (e) => erros.push(e.message));
  await page.goto(`${PAG}?h=abc&s=zzz`);
  await expect(page.getByRole('radio', { name: 'Estudante' })).toBeChecked();
  await expect(page.locator('[data-calc-horas]')).toHaveValue('12');
  expect(erros).toEqual([]);
});

test('lembra o perfil ao voltar', async ({ page }) => {
  await page.goto(PAG);
  await page.getByRole('radio', { name: 'Dev de outra área' }).check();
  await page.goto(PAG);
  await expect(page.getByRole('radio', { name: 'Dev de outra área' })).toBeChecked();
});

test('marcar o que já domino grava no progresso', async ({ page }) => {
  await page.goto(PAG);
  await page.getByRole('radio', { name: 'Dev de outra área' }).check();
  await page.locator('[data-calc-marcar-concluidos]').click();
  const prog = await page.evaluate(() => JSON.parse(localStorage.getItem('rm-progresso-v1') ?? '{}'));
  expect(prog['topico:python-fundamentos']).toBe(true);
  expect(prog['topico:rag']).toBeUndefined();
});

test('campos têm rótulo', async ({ page }) => {
  await page.goto(PAG);
  await expect(page.getByLabel('Horas por semana')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Docker' })).toBeVisible();
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('mostra aviso', async ({ page }) => {
    await page.goto(PAG);
    await expect(page.getByText('A calculadora precisa de JavaScript')).toBeVisible();
  });
});

test.describe('ligações', () => {
  test('cabeçalho e linha do tempo levam à calculadora', async ({ page }) => {
    await page.goto('./sobre/');
    await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Calculadora' }).click();
    await expect(page).toHaveURL(/\/roadmap-ai-engineer\/calculadora\//);
    await page.goto('./');
    await expect(page.locator('#tempo a[href="/roadmap-ai-engineer/calculadora/"]:visible')).toHaveCount(1);
  });

  test('sem perfil salvo, nenhuma etiqueta', async ({ page }) => {
    await page.goto('./topico/python-fundamentos/');
    await expect(page.locator('[data-etiqueta-perfil]')).toBeHidden();
  });

  test('com perfil dev, etiquetas no tópico e no nível', async ({ page }) => {
    await page.goto('./calculadora/');
    await page.getByRole('radio', { name: 'Dev de outra área' }).check();
    await page.goto('./topico/python-fundamentos/');
    const etq = page.locator('[data-etiqueta-perfil]');
    await expect(etq).toBeVisible();
    await expect(etq).toContainText(/pular/i);
    await expect(etq.getByRole('link', { name: /ajustar/i })).toHaveAttribute('href', '/roadmap-ai-engineer/calculadora/');
    await page.goto('./topico/rag/');
    await expect(page.locator('[data-etiqueta-perfil]')).toBeHidden();
    await page.goto('./nivel/1/');
    await expect(page.locator('[data-etiqueta-topico="python-fundamentos"]')).toBeVisible();
    await expect(page.locator('[data-etiqueta-topico="embeddings"]')).toBeHidden();
  });
});

test.describe('correções da revisão', () => {
  test('parâmetro estranho na URL não apaga o perfil salvo', async ({ page }) => {
    await page.goto('./calculadora/');
    await page.getByRole('radio', { name: 'Dev de outra área' }).check();
    await page.goto('./calculadora/?utm_source=linkedin');
    await expect(page.getByRole('radio', { name: 'Dev de outra área' })).toBeChecked();
  });

  test('marcar o que já domino atualiza o progresso do cabeçalho na hora', async ({ page }) => {
    await page.goto('./calculadora/?s=dev');
    await page.locator('[data-calc-marcar-concluidos]').click();
    await expect(page.locator('[data-progresso-global]')).not.toContainText(/^\s*0 \//);
  });

  test('só o total e o resumo são região ao vivo', async ({ page }) => {
    await page.goto('./calculadora/');
    await expect(page.locator('main [aria-live]')).toHaveCount(1);
    await expect(page.locator('[aria-live] [data-calc-total]')).toHaveCount(1);
    await expect(page.locator('[aria-live] button')).toHaveCount(0);
  });
});

test.describe('home e fases apontam para a calculadora', () => {
  const CALC = '/roadmap-ai-engineer/calculadora/';
  test('abertura, carreira e faixa final da home', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('.hero-ctas').getByRole('link', { name: 'Ajustar ao meu perfil' })).toHaveAttribute('href', '#escolha');
    await expect(page.locator('#carreira').locator(`a[href="${CALC}"]:visible`)).toHaveCount(1);
    await expect(page.locator('footer').getByRole('link', { name: 'Calcular minha trilha' })).toHaveAttribute('href', CALC);
    await expect(page.locator('#tempo')).not.toContainText('1º semestre');
  });
  test('fases 1 e 2 têm a nota para outros perfis; fase 3 não', async ({ page }) => {
    for (const f of [1, 2]) {
      await page.goto(`./fase/${f}/`);
      await expect(page.locator(`[data-nota-perfil] a[href="${CALC}"]`)).toBeVisible();
    }
    await page.goto('./fase/2/');
    await expect(page.locator('main')).not.toContainText('1º semestre da faculdade');
    await page.goto('./fase/3/');
    await expect(page.locator('[data-nota-perfil]')).toHaveCount(0);
  });
});
