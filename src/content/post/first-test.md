---
title: "Astro博客搭建流程与注意事项"
publishDate: "21 March 2024"
description: "本文详细记录了从零开始搭建 Astro 博客的完整流程，包括环境配置、主题选择、GitHub 关联、Vercel 部署等关键步骤，以及在搭建过程中可能遇到的常见问题和解决方案。"
tags: ["astro", "blog", "github", "vercel"]
---

## 1. 环境准备

### Node.js 安装
```bash
# 使用 Homebrew 安装
brew install node
brew install pnpm

# 验证安装
node --version
pnpm --version
```

## 2. 创建 Astro 项目

### 初始化项目
```bash
pnpm dlx create-astro my-blog --template chrismwilliams/astro-theme-cactus
cd my-blog
pnpm install
pnpm dev
```

## 3. Git 与 GitHub 配置

### 初始化 Git 仓库
```bash
cd my-blog          # 确保在正确目录
git init
git add .
git commit -m "first commit"
git branch -M main
```

### 关联 GitHub
```bash
git remote add origin https://github.com/username/my-blog.git
git push -u origin main
```

## 5. 日常维护流程

### 更新博客
```bash
# 拉取最新代码
git pull

# 本地开发
pnpm dev

# 提交更改
git add .
git commit -m "update: 更新说明"
git push
```

## 7. 参考资源

- [Astro 官方文档](https://docs.astro.build)
- [Vercel 部署文档](https://vercel.com/docs)
- [GitHub 文档](https://docs.github.com)