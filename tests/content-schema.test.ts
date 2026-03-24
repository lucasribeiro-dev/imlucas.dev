import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const BLOG_DIR = join(process.cwd(), 'src/content/blog');

function parseFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const lines = match[1].split('\n');
  const data: Record<string, string> = {};
  for (const line of lines) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      data[key.trim()] = rest.join(':').trim();
    }
  }
  return data;
}

describe('blog posts', () => {
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

  it('has at least one post', () => {
    expect(files.length).toBeGreaterThanOrEqual(1);
  });

  for (const file of files) {
    describe(file, () => {
      const content = readFileSync(join(BLOG_DIR, file), 'utf-8');
      const frontmatter = parseFrontmatter(content);

      it('has valid frontmatter', () => {
        expect(frontmatter).not.toBeNull();
      });

      it('has required title field', () => {
        expect(frontmatter?.title).toBeTruthy();
      });

      it('has required description field', () => {
        expect(frontmatter?.description).toBeTruthy();
      });

      it('has required pubDate field', () => {
        expect(frontmatter?.pubDate).toBeTruthy();
      });

      it('has content after frontmatter', () => {
        const body = content.split('---').slice(2).join('---').trim();
        expect(body.length).toBeGreaterThan(0);
      });
    });
  }
});
