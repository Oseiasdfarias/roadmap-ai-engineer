import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeMermaid from 'rehype-mermaid';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { MERMAID, rehypeFluxo } from './src/lib/mermaid-tema.mjs';

// O Astro guarda o HTML renderizado de cada Markdown e só o refaz quando a configuração muda.
// A impressão digital do plugin dos diagramas entra na configuração: mudou o plugin, o cache se refaz.
const VERSAO_FLUXO = createHash('sha1').update(readFileSync(new URL('./src/lib/mermaid-tema.mjs', import.meta.url))).digest('hex').slice(0, 12);

// O Mermaid mede cada rótulo no navegador do build: com a mesma fonte do site, o texto não corta.
const FONTES_MERMAID = ['400', '500'].map((p) => new URL(`./node_modules/@fontsource/inter/${p}.css`, import.meta.url));

export default defineConfig({
  site: 'https://oseiasdfarias.github.io',
  base: '/roadmap-ai-engineer',
  trailingSlash: 'always',
  output: 'static',
  markdown: {
    // Blocos ```mermaid viram SVG no build (sem JS no navegador); as cores vêm do CSS do site.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    shikiConfig: { themes: { light: 'github-light-default', dark: 'github-dark-default' } },
    rehypePlugins: [[rehypeMermaid, { strategy: 'inline-svg', mermaidConfig: MERMAID, launchOptions: { channel: 'chrome' }, css: FONTES_MERMAID }], [rehypeFluxo, { versao: VERSAO_FLUXO }]],
  },
  integrations: [sitemap({ filter: (pagina) => !pagina.includes('/dev/') })],
});
