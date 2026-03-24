# imlucas.dev

Personal blog built with [Astro](https://astro.build), [Tailwind CSS v4](https://tailwindcss.com), and Markdown.

## Stack

- **Astro** — Static site generator (Node.js-based)
- **Tailwind CSS v4** — Utility-first styling with dark/light mode
- **Markdown** — Blog posts as `.md` files with frontmatter
- **Shiki** — Syntax highlighting with dual themes
- **GitHub Actions** — CI/CD pipeline
- **Hostinger** — Hosting via Git auto-deploy

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable Astro components
├── content/blog/     # Markdown blog posts
├── layouts/          # Page layouts (Base, Post)
├── pages/            # File-based routing
├── styles/           # Global CSS (Tailwind config)
├── utils/            # Remark plugins
├── consts.ts         # Site configuration
└── content.config.ts # Content collection schema
```

## Writing a New Post

Create a new `.md` file in `src/content/blog/`:

```markdown
---
title: 'Your Post Title'
description: 'A brief summary for cards and SEO.'
pubDate: 2026-03-25
tags: ['ai', 'engineering']
draft: false
---

Your content here...
```

Then commit and push:

```bash
git add src/content/blog/your-post.md
git commit -m "Add post: Your Post Title"
git push
```

### Frontmatter Fields

| Field         | Type       | Required | Description                   |
| ------------- | ---------- | -------- | ----------------------------- |
| `title`       | `string`   | Yes      | Post title                    |
| `description` | `string`   | Yes      | Short summary (SEO + cards)   |
| `pubDate`     | `date`     | Yes      | Publication date (YYYY-MM-DD) |
| `tags`        | `string[]` | No       | Tags for categorization       |
| `draft`       | `boolean`  | No       | Set `true` to hide from build |
| `updatedDate` | `date`     | No       | Last updated date             |
| `heroImage`   | `string`   | No       | Path to hero image            |
| `heroAlt`     | `string`   | No       | Alt text for hero image       |

## Configuration

Edit `src/consts.ts` to configure:

```typescript
export const SITE = {
  title: 'imlucas.dev',
  description: '...',
  author: 'Lucas Ribeiro',
  gaId: '', // Google Analytics: 'G-XXXXXXXXXX'
  gscVerification: '', // Google Search Console: verification string
};
```

## Dark / Light Mode

- Dark mode is the default
- Toggle via the button in the header
- Preference is saved to `localStorage`
- Falls back to system preference

## Deployment

### How It Works

1. Push to `main` branch
2. GitHub Actions builds the site and pushes `dist/` to the `deploy` branch
3. Hostinger Git auto-deploy watches `deploy` and syncs to `public_html/`

### Hostinger Setup

1. Go to **hPanel** → **Advanced** → **Git**
2. Create a new repository
3. Set **Repository URL** to your GitHub repo URL
4. Set **Branch** to `deploy`
5. Click **Create** — Hostinger will auto-pull on changes

### GitHub Repository Settings

In your repo's **Settings** → **Actions** → **General**:

- Under "Workflow permissions", select **Read and write permissions**
- This allows the deploy workflow to push to the `deploy` branch

## License

MIT
