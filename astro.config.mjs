import { defineConfig } from 'astro/config';
import fatwaSections from './src/plugins/fatwa-sections.mjs';

export default defineConfig({
  // Change this to your real domain before going live.
  site: 'https://daruliftamiami.com',
  trailingSlash: 'always',
  markdown: {
    rehypePlugins: [fatwaSections],
  },
});
