import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://awesome-agentic-ai-site.vercel.app',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      langs: ['bash', 'json', 'yaml', 'markdown', 'plaintext', 'diff', 'typescript', 'javascript', 'python', 'html', 'css']
    }
  }
});
