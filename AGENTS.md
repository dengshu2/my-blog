# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server at localhost:4321
pnpm build        # Type check + build (outputs to ./dist/)
pnpm postbuild    # Build Pagefind search index (run after build)
pnpm preview      # Preview production build locally
pnpm lint         # Run Biome linter
pnpm format       # Format with Biome + Prettier
pnpm check        # Run Astro type checking only
```

## Architecture

This is an Astro blog (based on Astro Cactus theme) configured for Chinese content.

### Content System
- **Blog posts**: `src/content/post/*.md` or `.mdx`
- **Post schema**: Defined in `src/content/config.ts`
  - Required: `title` (max 60), `description` (50-160 chars), `publishDate`
  - Optional: `updatedDate`, `tags`, `coverImage`, `ogImage`, `draft`
- **Post utilities**: `src/data/post.ts` - Functions for fetching, sorting, and filtering posts

### Configuration
- **Site config**: `src/site.config.ts` - Title, author, locale, menu links, Expressive Code theme options
- **Astro config**: `astro.config.ts` - Integrations and markdown plugins

### Custom Remark Plugins
- `src/plugins/remark-reading-time.ts` - Calculates reading time
- `src/plugins/remark-admonitions.ts` - Supports `:::tip`, `:::note`, `:::important`, `:::caution`, `:::warning` blocks

### Key Integrations
- **Pagefind**: Static search (built via postbuild script)
- **Satori**: Auto-generates OG images at `src/pages/og-image/[...slug].png.ts`
- **Expressive Code**: Syntax highlighting with dracula/github-light themes
- **TailwindCSS**: Styling with config in `tailwind.config.ts`

### Layouts
- `src/layouts/Base.astro` - Main HTML wrapper
- `src/layouts/BlogPost.astro` - Blog post template with TOC and webmentions

### Path Aliases
- `@/` maps to `src/` (e.g., `import { siteConfig } from "@/site-config"`)
