import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const DIST = join(process.cwd(), 'dist');

beforeAll(() => {
  execSync('npm run build', { stdio: 'pipe' });
}, 30000);

describe('build output', () => {
  it('creates dist directory', () => {
    expect(existsSync(DIST)).toBe(true);
  });

  const requiredPages = [
    'index.html',
    'about/index.html',
    'blog/index.html',
    'tags/index.html',
    '404.html',
    'blog/hello-world/index.html',
  ];

  for (const page of requiredPages) {
    it(`generates ${page}`, () => {
      expect(existsSync(join(DIST, page))).toBe(true);
    });
  }

  it('generates RSS feed', () => {
    expect(existsSync(join(DIST, 'rss.xml'))).toBe(true);
  });

  it('generates sitemap', () => {
    expect(existsSync(join(DIST, 'sitemap-index.xml'))).toBe(true);
  });

  it('generates search index', () => {
    const searchJson = join(DIST, 'search.json');
    expect(existsSync(searchJson)).toBe(true);
    const data = JSON.parse(readFileSync(searchJson, 'utf-8'));
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
  });

  it('copies .htaccess', () => {
    expect(existsSync(join(DIST, '.htaccess'))).toBe(true);
  });

  it('copies robots.txt', () => {
    expect(existsSync(join(DIST, 'robots.txt'))).toBe(true);
  });

  it('copies favicon', () => {
    expect(existsSync(join(DIST, 'favicon.svg'))).toBe(true);
  });
});

describe('HTML content', () => {
  it('index has theme init script', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf-8');
    expect(html).toContain("localStorage.getItem('theme')");
    expect(html).toContain('classList.toggle');
  });

  it('index has SEO meta tags', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf-8');
    expect(html).toContain('og:title');
    expect(html).toContain('twitter:card');
    expect(html).toContain('meta name="description"');
  });

  it('index has GA script when configured', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf-8');
    expect(html).toContain('googletagmanager.com');
    expect(html).toContain('G-6TF9NP73WP');
  });

  it('index has GSC verification when configured', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf-8');
    expect(html).toContain('google-site-verification');
  });

  it('does not leak generator meta tag', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf-8');
    expect(html).not.toContain('name="generator"');
  });

  it('blog post has reading time', () => {
    const html = readFileSync(join(DIST, 'blog/hello-world/index.html'), 'utf-8');
    expect(html).toContain('min read');
  });

  it('blog post has tag links', () => {
    const html = readFileSync(join(DIST, 'blog/hello-world/index.html'), 'utf-8');
    expect(html).toContain('/tags/engineering');
  });
});

describe('security', () => {
  it('.htaccess has CSP header', () => {
    const htaccess = readFileSync(join(DIST, '.htaccess'), 'utf-8');
    expect(htaccess).toContain('Content-Security-Policy');
  });

  it('.htaccess has HSTS header', () => {
    const htaccess = readFileSync(join(DIST, '.htaccess'), 'utf-8');
    expect(htaccess).toContain('Strict-Transport-Security');
  });

  it('.htaccess has X-Content-Type-Options', () => {
    const htaccess = readFileSync(join(DIST, '.htaccess'), 'utf-8');
    expect(htaccess).toContain('X-Content-Type-Options');
  });

  it('.htaccess forces HTTPS', () => {
    const htaccess = readFileSync(join(DIST, '.htaccess'), 'utf-8');
    expect(htaccess).toContain('RewriteCond %{HTTPS} off');
  });
});
