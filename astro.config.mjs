import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://oseiasdfarias.github.io',
  base: '/roadmap-ai-engineer',
  trailingSlash: 'always',
  output: 'static',
  integrations: [sitemap()],
});
