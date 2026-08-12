# My Blog

[blog.runningotter.com](https://blog.runningotter.com/)

个人博客，基于 Astro 5 + Tailwind CSS v4 构建。

## 本地开发

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # 生产构建
npm run postbuild    # 构建搜索索引（需先 build）
npm run preview      # 预览生产构建
```

## 写文章

在 `src/content/post/` 下新建 `.md` 或 `.mdx` 文件，文件名即 URL slug。

```yaml
---
title: "文章标题"            # 必填
description: "文章描述"      # 必填，用于 SEO
publishDate: 2024-01-01     # 必填
updatedDate: 2024-01-15     # 可选
tags: ["tag1", "tag2"]      # 可选
coverImage:                 # 可选
  src: "./cover.png"
  alt: "封面描述"
draft: true                 # 可选，草稿不会在生产环境显示
---
```

## 项目结构

```
src/
├── components/       # 组件
├── content/post/     # 博客文章
├── layouts/          # 页面布局
├── pages/            # 路由页面
├── styles/global.css # 全局样式
└── site.config.ts    # 站点配置
```

## 主要配置

- 站点信息 — `src/site.config.ts`
- 全局样式 / 主题色 — `src/styles/global.css`
- 社交链接 — `src/components/SocialList.astro`

## 音乐播放器

全站播放器从 Navidrome 的公开 Playlist Share 读取 M3U，不保存 Navidrome 用户凭据，也不会自动播放。默认服务与歌单配置位于 `src/site.config.ts`。

1. 在 Navidrome 配置中开启 Sharing，并重启服务：

   ```env
   ND_ENABLESHARING=true
   ND_DEFAULTDOWNLOADABLESHARE=false
   ND_DEFAULTSHAREEXPIRATION=87600h
   ```

2. 在 Navidrome 中创建或选择“博客音乐”歌单，为歌单创建不可下载的公开 Share。
3. 如需切换 Navidrome 服务或歌单，复制 `.env.example` 为 `.env` 并覆盖默认配置：

   ```env
   PUBLIC_NAVIDROME_URL=https://music.dengshu.ovh
   PUBLIC_NAVIDROME_SHARE_ID=FGh7hVwzH7
   ```

播放器会在访客第一次打开面板时请求 `/share/<id>/m3u`，后续在 Navidrome 中调整原歌单即可同步曲目。Share 删除或到期后，播放器会显示“共享歌单已过期”。
