#!/usr/bin/env node
// Regenerates the Blog Posts section of public/llms.txt from src/content/blog/*.md
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, basename } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const BLOG_DIR = join(ROOT, 'src/content/blog');
const LLMS_PATH = join(ROOT, 'public/llms.txt');
const BASE_URL = 'https://imlucas.dev';

function parseFrontmatter(src) {
  const match = src.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line
      .slice(colon + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');
    fm[key] = val;
  }
  return fm;
}

const posts = readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((file) => {
    const src = readFileSync(join(BLOG_DIR, file), 'utf8');
    const fm = parseFrontmatter(src);
    if (!fm || fm.draft === 'true') return null;
    const slug = basename(file, '.md');
    return { title: fm.title, description: fm.description, pubDate: fm.pubDate, slug };
  })
  .filter(Boolean)
  .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

const lines = posts
  .map((p) => `- [${p.title}](${BASE_URL}/blog/${p.slug}/): ${p.description}`)
  .join('\n');

const llms = readFileSync(LLMS_PATH, 'utf8');
const updated = llms.replace(/(## Blog Posts\n\n)[\s\S]*?(\n\n## )/, `$1${lines}$2`);

writeFileSync(LLMS_PATH, updated);
console.log(`✅ llms.txt updated (${posts.length} posts)`);
