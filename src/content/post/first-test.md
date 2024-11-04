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

## 4. 多设备管理

### SSH Key 配置
```bash
# 在每台设备上生成 SSH Key
ssh-keygen -t ed25519 -C "your_email@example.com"

# 查看公钥内容
cat ~/.ssh/id_ed25519.pub
```

### GitHub 添加多个 SSH Key
1. 访问 GitHub -> Settings -> SSH and GPG keys
2. 点击 "New SSH key"
3. 为每台设备的 Key 添加不同的标题（如："MacBook Pro"、"Windows Desktop"）
4. 粘贴对应设备的公钥内容

### Git 全局配置
在每台设备上设置相同的 Git 配置：
```bash
# 设置用户名和邮箱
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"

# 建议设置默认分支名称
git config --global init.defaultBranch main
```

### 工作流程
1. 首次在新设备上使用：
```bash
# 克隆仓库
git clone git@github.com:username/my-blog.git
cd my-blog
pnpm install  # 安装依赖
```

2. 日常同步流程：
```bash
# 开始工作前先拉取最新代码
git pull

# 完成修改后推送
git add .
git commit -m "update: 更新说明"
git push
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