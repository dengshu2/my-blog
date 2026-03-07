# My Blog

🌐 **[blog.runningotter.com](https://blog.runningotter.com/)**

个人博客，基于 [Astro](https://astro.build/) + [Tailwind CSS v4](https://tailwindcss.com/) 构建。

## 技术栈

- **框架**：Astro 5
- **样式**：Tailwind CSS v4 + Typography Plugin
- **内容**：Markdown / MDX（Content Collections）
- **搜索**：Pagefind 静态搜索
- **代码高亮**：Expressive Code
- **OG 图片**：Satori 自动生成

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器 http://localhost:4321
npm run dev

# 构建生产版本
npm run build

# 构建后生成搜索索引（需在 build 之后运行）
npm run postbuild

# 本地预览生产构建
npm run preview
```

## 写文章

在 `src/content/post/` 目录下新建 `.md` 或 `.mdx` 文件，文件名即为 URL slug。

### Frontmatter 字段

```yaml
---
title: "文章标题"           # 必填，最多 60 字符
description: "文章描述"     # 必填，50-160 字符，用于 SEO
publishDate: 2024-01-01    # 必填，发布日期
updatedDate: 2024-01-15    # 可选，最后更新日期
tags: ["tag1", "tag2"]     # 可选，文章标签
coverImage:                # 可选，封面图
  src: "./cover.png"
  alt: "封面描述"
ogImage: "./og.png"        # 可选，自定义 OG 图片（不填则自动生成）
draft: true                # 可选，草稿模式（生产环境不显示）
---
```

## 项目结构

```
src/
├── components/     # 组件
├── content/
│   └── post/       # 博客文章（.md / .mdx）
├── layouts/        # 页面布局
├── pages/          # 路由页面
├── styles/
│   └── global.css  # 全局样式 & Tailwind 配置
└── site.config.ts  # 站点基本信息配置
```

## 主要配置

- **站点信息**：修改 `src/site.config.ts`
- **全局样式 / 主题色**：修改 `src/styles/global.css`
- **社交链接**：修改 `src/components/SocialList.astro`
- **代码高亮主题**：在 `src/site.config.ts` 中调整 Expressive Code 主题
