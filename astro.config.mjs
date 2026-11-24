import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://oseiasdfarias.github.io',
  base: '/roadmap-ai-engineer',
  trailingSlash: 'always',
  output: 'static',
  markdown: { shikiConfig: { themes: { light: 'github-light-default', dark: 'github-dark-default' } } },
  integrations: [sitemap({ filter: (pagina) => !pagina.includes('/dev/') })],
});
