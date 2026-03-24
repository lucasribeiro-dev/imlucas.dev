# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:4321)
npm run build        # Build static site to dist/
npm run preview      # Preview production build locally
npm run lint         # ESLint + Prettier check
npm run lint:fix     # Auto-fix lint/format issues
npm run format       # Prettier format all files
npm test             # Run vitest once
npm run test:watch   # Vitest in watch mode
```

Pre-commit hook (Husky) runs: grammar review (Claude CLI, if available) → lint → test.

## Architecture

Astro 6 static site generator + Tailwind CSS v4 + Markdown content collections. All pages pre-rendered at build time (`output: 'static'`). Build format is `directory` (generates `page/index.html`).

### Content System

Blog posts are Markdown files in `src/content/blog/`. Schema defined in `src/content.config.ts` with Zod validation via Astro's glob loader.

Required frontmatter: `title`, `description`, `pubDate`. Optional: `tags`, `draft`, `updatedDate`, `heroImage`, `heroAlt`.

Use `render(post)` (standalone function from `astro:content`), not `post.render()` — this is Astro 5+ API.

Reading time is injected by a remark plugin (`src/utils/reading-time.mjs`) and accessed via `remarkPluginFrontmatter.minutesRead` after calling `render()`.

### Theme System (3 layers)

1. **CSS variables** in `src/styles/global.css` via Tailwind `@theme` — dark palette is default, light overrides in `:root:not(.dark)`
2. **Blocking inline script** in `BaseLayout.astro` `<head>` — reads localStorage/system preference, sets `.dark` class before paint (prevents flash)
3. **ThemeToggle component** — toggles `.dark` class + persists to localStorage

Components use semantic color tokens (`bg-bg`, `text-text`, `text-accent`, `text-text-muted`) — avoid raw `dark:` variants for palette colors.

Shiki code highlighting uses dual themes (`github-dark-default` / `github-light-default`) controlled by CSS variables (`.dark .shiki` / `.shiki`).

### Search

Static JSON index built at `src/pages/search.json.ts`. Client-side fuzzy search via Fuse.js in `src/components/Search.astro`. Lazy-loads index on first interaction. Opens with Ctrl/Cmd+K.

### Site Config

`src/consts.ts` holds site metadata, GA4 ID, GSC verification token, nav links, and social links. GA/GSC scripts are conditionally injected in `BaseLayout.astro` only when their values are non-empty.

### Deploy Pipeline

Push to `main` → GitHub Actions (lint → test → build) → `peaceiris/actions-gh-pages` pushes `dist/` to `deploy` branch → Hostinger Git auto-deploy pulls from `deploy`.

### Security

`public/.htaccess` has CSP, HSTS, X-Content-Type-Options, X-XSS-Protection, Permissions-Policy, HTTPS enforcement, gzip, and cache headers.

## Tests

Three test files in `tests/`:

- **`consts.test.ts`** — validates site config, nav links, social links
- **`content-schema.test.ts`** — validates all blog posts have required frontmatter
- **`build.test.ts`** — full build verification: page generation, SEO tags, GA/GSC injection, security headers, no info leaks

The build test runs `npm run build` internally (30s timeout).

## Custom Skill

`/review-post` — reviews staged or specified blog posts for grammar, spelling, clarity, and Markdown syntax before committing.
