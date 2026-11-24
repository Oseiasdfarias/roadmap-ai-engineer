import { expect, test } from '@playwright/test';
import { htmlsDe, linksAbsolutos } from './helpers';

const CANAIS: Record<string, string> = {
  Portfólio: 'https://oseiasdfarias.github.io/',
  LinkedIn: 'https://www.linkedin.com/in/oseiasfarias/',
  GitHub: 'https://github.com/Oseiasdfarias',
  Medium: 'https://medium.com/@oseiasfarias',
  YouTube: 'https://www.youtube.com/@otensor',
};

test('a página inicial carrega com o título do site', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveTitle(/Roadmap AI Engineer/);
});

test('o rodapé aponta para os cinco canais do autor', async ({ page }) => {
  await page.goto('./');
  const rodape = page.locator('footer');
  for (const [nome, href] of Object.entries(CANAIS)) {
    const link = rodape.getByRole('link', { name: nome, exact: true });
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
});

test('alternar o tema muda data-theme e persiste após recarregar', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('./');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'light');
  const botaoTema = page.getByRole('button', { name: 'Alternar tema' });
  await expect(botaoTema).toHaveAttribute('aria-pressed', 'false');
  await botaoTema.click();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(botaoTema).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
});

test('todo link absoluto em dist/ começa pela base', () => {
  const arquivos = htmlsDe('dist');
  expect(arquivos.length).toBeGreaterThan(0);
  for (const arquivo of arquivos) {
    for (const link of linksAbsolutos(arquivo)) {
      expect(link, `${arquivo}: ${link}`).toMatch(/^\/roadmap-ai-engineer\//);
    }
  }
});

test('os links "Baixar o PDF" apontam para o PDF publicado e ele é servido', async ({ page, request }) => {
  const PDF = '/roadmap-ai-engineer/pdf/roadmap-ai-engineer.pdf';
  await page.goto('./');
  await expect(page.locator('header').locator(`a[href="${PDF}"]`).first()).toBeVisible();
  const rodape = page.locator('footer').getByRole('link', { name: 'Baixar o PDF' });
  await expect(rodape.first()).toHaveAttribute('href', PDF);
  const resp = await request.get(PDF);
  expect(resp.status()).toBe(200);
  expect(resp.headers()['content-type']).toContain('application/pdf');
});
