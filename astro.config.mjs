import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import remarkReadingTime from './src/utils/reading-time.mjs';

export default defineConfig({
  site: 'https://imlucas.dev',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: {
        dark: 'github-dark-default',
        light: 'github-light-default',
      },
    },
    remarkPlugins: [remarkReadingTime],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
});
