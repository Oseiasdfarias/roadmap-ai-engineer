import { expect, test } from '@playwright/test';

const PAGINAS = ['nivel/2/', 'fase/2/', 'topico/rag/', 'carreira/curriculo/', 'projeto/p1-assistente-da-montadora/', 'sobre/'];

test.describe('páginas internas com a nova identidade', () => {
  for (const rota of PAGINAS) {
    test(`sem rolagem horizontal em 390 px: ${rota}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(rota);
      const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(sobra).toBeLessThanOrEqual(0);
    });
  }

  test('cada link do sumário leva ao seu H2 em tela larga (1100 px)', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.goto('topico/rag/');
    const links = page.getByRole('navigation', { name: 'Nesta página' }).getByRole('link');
    const total = await links.count();
    expect(total).toBeGreaterThan(3);
    for (let i = 0; i < total; i++) {
      const href = (await links.nth(i).getAttribute('href'))!;
      expect(href).toMatch(/^#/);
      await links.nth(i).click();
      await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe(href);
      const alvo = page.locator(`h2[id="${href.slice(1)}"]`);
      await expect(alvo).toBeInViewport();
      // o título fica logo abaixo do cabeçalho fixo, não escondido por ele
      const topo = await alvo.evaluate((e) => e.getBoundingClientRect().top);
      const cab = await page.locator('header.bar').evaluate((e) => e.getBoundingClientRect().bottom);
      expect(topo).toBeGreaterThanOrEqual(cab - 1);
    }
  });

  test('os H2 do artigo trazem o índice mono e o sumário usa os mesmos números', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('topico/rag/');
    const indice = await page.locator('h2#como-funciona').evaluate((e) => getComputedStyle(e, '::before').content);
    expect(indice).toContain('counter');
    await expect(page.getByRole('navigation', { name: 'Nesta página' }).locator('a[href="#como-funciona"] .n')).toHaveText('03');
  });

  test('alternar o tema numa página de tópico persiste após recarregar', async ({ page }) => {
    await page.goto('topico/rag/');
    const html = page.locator('html');
    const antes = await html.getAttribute('data-theme');
    const depois = antes === 'dark' ? 'light' : 'dark';
    await page.getByRole('button', { name: 'Alternar tema' }).click();
    await expect(html).toHaveAttribute('data-theme', depois);
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', depois);
    await page.goto('projeto/p1-assistente-da-montadora/');
    await expect(html).toHaveAttribute('data-theme', depois);
  });

  test('marcar na página do tópico usa o anel e o rótulo muda', async ({ page }) => {
    await page.goto('carreira/curriculo/');
    const botao = page.locator('button[data-alternar="carreira:curriculo"]');
    await expect(botao).toHaveAccessibleName('Marcar como estudado');
    await botao.click();
    await expect(botao).toHaveAttribute('aria-pressed', 'true');
    await expect(botao).toHaveAccessibleName('Estudado');
  });
});

test.describe('abertura da página inicial', () => {
  test('o RAI.E em contorno existe e é decorativo', async ({ page }) => {
    await page.goto('./');
    const marca = page.locator('.hero .hero-marca');
    await expect(marca).toHaveCount(1);
    await expect(marca).toHaveAttribute('aria-hidden', 'true');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Roadmap AI Engineer');
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('a rota liga aos quatro níveis e os números às seções', async ({ page }) => {
    await page.goto('./');
    const rota = page.getByRole('navigation', { name: 'Rota do roadmap' });
    const links = rota.getByRole('link');
    await expect(links).toHaveCount(4);
    for (let n = 1; n <= 4; n++) await expect(links.nth(n - 1)).toHaveAttribute('href', `/roadmap-ai-engineer/nivel/${n}/`);
    await expect(rota).toContainText('Python');
    await expect(rota).toContainText('Agente em produção');
    const numeros = page.locator('.hero-numeros a');
    await expect(numeros).toHaveCount(3);
    await expect(numeros.nth(0)).toHaveAttribute('href', '#niveis');
    await expect(numeros.nth(1)).toHaveAttribute('href', '#carreira');
    await expect(numeros.nth(2)).toHaveAttribute('href', '#portfolio');
    await expect(numeros.nth(0)).toContainText('4 níveis');
    await expect(numeros.nth(1)).toContainText('5 fases de carreira');
    await expect(numeros.nth(2)).toContainText('5 projetos');
  });

  for (const [w, h] of [[1440, 900], [1280, 720], [390, 844]]) {
    test(`a abertura ocupa a tela e os dois botões cabem: ${w}x${h}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('./');
      const r = await page.evaluate(() => {
        const ctas = [...document.querySelectorAll('.hero-ctas a')].slice(0, 2).map((a) => a.getBoundingClientRect());
        return {
          fundo: document.querySelector('[data-hero-abertura]')!.getBoundingClientRect().bottom,
          alt: innerHeight,
          larg: innerWidth,
          ctas: ctas.map((c) => ({ top: c.top, bottom: c.bottom, left: c.left, right: c.right })),
        };
      });
      expect(r.fundo).toBeLessThanOrEqual(r.alt + 1);
      expect(r.fundo).toBeGreaterThanOrEqual(0.9 * r.alt);
      expect(r.ctas).toHaveLength(2);
      for (const c of r.ctas) {
        expect(c.top).toBeGreaterThanOrEqual(0);
        expect(c.bottom).toBeLessThanOrEqual(r.alt);
        expect(c.left).toBeGreaterThanOrEqual(0);
        expect(c.right).toBeLessThanOrEqual(r.larg);
      }
    });
  }
});

test.describe('cabeçalho em larguras intermediárias', () => {
  for (const w of [861, 1079]) {
    test(`cabe na largura e a navegação não encosta no progresso: ${w} px`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 800 });
      for (const rota of ['./', 'topico/rag/']) {
        await page.goto(rota);
        const r = await page.evaluate(() => {
          const inn = document.querySelector('.bar .in')!;
          const nav = document.querySelector('.bar .nav')!.getBoundingClientRect();
          const prog = document.querySelector('.bar .prog')!.getBoundingClientRect();
          return { sw: inn.scrollWidth, cw: inn.clientWidth, navDir: nav.right, navBaixo: nav.bottom, navTopo: nav.top, progEsq: prog.left, progTopo: prog.top, progBaixo: prog.bottom };
        });
        expect(r.sw).toBeLessThanOrEqual(r.cw);
        const sobrepoe = r.navDir > r.progEsq && r.navBaixo > r.progTopo && r.progBaixo > r.navTopo;
        expect(sobrepoe).toBe(false);
      }
    });
  }
});

test.describe('menu no celular', () => {
  for (const w of [320, 390]) {
    test(`todos os links cabem sem rolagem: ${w} px`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 800 });
      await page.goto('./');
      const r = await page.evaluate(() => {
        const nav = document.querySelector<HTMLElement>('.bar .nav')!;
        const caixa = nav.getBoundingClientRect();
        const links = [...nav.querySelectorAll('a')].map((a) => a.getBoundingClientRect());
        return { sw: nav.scrollWidth, cw: nav.clientWidth, fora: links.filter((l) => l.left < caixa.left - 1 || l.right > caixa.right + 1).length, n: links.length };
      });
      expect(r.n).toBe(5);
      expect(r.sw).toBeLessThanOrEqual(r.cw);
      expect(r.fora).toBe(0);
    });
  }
});
