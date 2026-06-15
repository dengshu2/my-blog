# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Content Writing Rules

- **No bold text in articles**: 所有博客文章（`src/content/post/*.md` 或 `.mdx`）中禁止使用加粗写法（不要使用 `**...**` 或 `__...__`）。需要强调时改用其他方式，例如行内代码、引用块、admonition（`:::tip` 等）或重写句子结构。新增或编辑文章时必须遵守此规则，并在编辑现有文章时顺手移除已有的加粗。

### 写作理念（参考博客）

作者欣赏两个博客作为写作参考，二者风格不同但内核一致，写文章时遵循其抽象出的核心逻辑：

- 参考一：[bmpi.dev](https://www.bmpi.dev/self/)（madawei2699）——定位「终身学习与自我提升」，分学习/技术/投资三块。风格系统化、结构化、数据驱动，强调个人实践视角（标题多为「我的……」）、方法论可迭代（如简报 1.0→2.0）、长期坚持（年度总结）。
- 参考二：[椒盐豆豉 blog.douchi.space](https://blog.douchi.space/)——22 年个人博客，涵盖数码/游戏/健康/财务/生活。风格口语化、真诚、有「活人感」、自嘲、不端着。代表理念见《我如何写博客》《独立博客七宗罪》。

抽象出的共同核心逻辑（写文章时遵循）：

1. 真实的第一人称实践——只写自己真正做过、想过、踩过坑的东西，第一人称叙述，不写没有亲历的空泛大道理。
2. 内容 > 形式——把精力放在「写本身」，不在工具/排版/建站上过度折腾（「买椟还珠」）；排版够用就行。
3. 长期主义 + 先发布再迭代——先用最简单的方式开始写并公开发布，再逐步打磨；不追求一篇就完美，不囤草稿不发。
4. 活人感、不掺水——原创，不转载/复制粘贴充数，不用 AI 生成的内容充数；读者来看个人博客就是想看活人写的真东西。
5. 信息密度与诚实——有用或有趣，言之有物；观点带个人态度但不为批判而批判、不堆砌情绪檄文。

写作语气倾向豆豉式的自然、口语、真诚，结构上可借鉴 bmpi 的清晰条理；二者结合，避免空话套话和 AI 腔。

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
