---
title: "换了台新 Mac，聊聊我的开发环境迁移思路"
publishDate: "2026-03-23"
description: "一次完整的 macOS 开发环境迁移实践：从 Homebrew 统管到 iCloud 同步 dotfiles，分享可复用的迁移方法论和工具清单"
tags: ["mac", "开发环境", "dotfiles", "homebrew", "效率"]
---

上周换了台新 Mac，趁着还记得，把这次迁移的过程记录下来。

之前每次换电脑都是一边用一边装，想起什么装什么，经常过了两周才发现某个工具没装。这次提前做了规划，整个迁移过程大概 2 小时搞定，体验好了很多。分享一下思路，希望对大家有帮助。

## 核心思路：三个原则

这次迁移我遵循了三个原则：

| 原则 | 说明 |
|------|------|
| **Homebrew 统管** | 所有软件（命令行 + GUI）优先通过 Homebrew 安装，一条命令批量搞定 |
| **iCloud 同步配置** | 敏感配置放 iCloud，新电脑创建软链接即可恢复 |
| **按需安装，不囤积** | 全局包不预装，项目需要时再安装 |

核心逻辑很简单：**软件安装靠 Brewfile 自动化，配置恢复靠 iCloud + 软链接**。

## Phase 1: 用 Brewfile 一键安装所有软件

Homebrew 的 `brew bundle` 功能是这次迁移的核心。把所有要装的软件写进一个 `Brewfile`，新电脑上一条命令全装好：

```bash
brew bundle --file=~/Documents/dotfiles/Brewfile
```

我的 Brewfile 大概分这几类：

### 命令行工具

```ruby
# 搜索三件套
brew "fd"                    # 现代 find 替代
brew "fzf"                   # 模糊搜索
brew "ripgrep"               # 现代 grep 替代

# Shell 增强
brew "starship"              # 跨 Shell Prompt
brew "zsh-autosuggestions"   # 命令建议
brew "zsh-syntax-highlighting" # 语法高亮

# 版本管理器
brew "fnm"                   # Node.js 版本管理
brew "uv"                    # Python 工具链（替代 pip/pipx/venv）

# 编程语言
brew "go"
brew "deno"

# 开发工具
brew "gh"                    # GitHub CLI
brew "duckdb"                # 嵌入式分析数据库

# 系统工具
brew "htop"                  # 进程监控
brew "tree"                  # 目录树
brew "trash"                 # 安全删除（替代 rm）

# 媒体处理
brew "ffmpeg"                # 视频/音频处理
brew "yt-dlp"                # 视频下载
brew "pandoc"                # 文档格式转换
```

### GUI 应用

```ruby
# 终端
cask "ghostty"               # 主终端模拟器

# 容器
cask "orbstack"              # Docker + Linux（替代 Docker Desktop）

# 浏览器 & 通讯
cask "google-chrome"
cask "telegram"
cask "wechat"

# 效率工具
cask "raycast"               # 启动器
cask "rectangle"             # 窗口管理
cask "maccy"                 # 剪贴板管理
cask "monitor-control"       # 外接显示器亮度/音量控制
cask "mos"                   # 鼠标平滑滚动

# 笔记 & 媒体
cask "obsidian"              # 笔记管理
cask "iina"                  # 视频播放器
cask "spotify"               # 音乐

# 数据库
cask "dbeaver-community"     # 数据库客户端

# 其他
cask "eudic"                 # 欧路词典
cask "the-unarchiver"        # 解压工具
cask "xnip"                  # 截图标注
cask "piclist"               # 图床管理
cask "buzz"                  # 语音转文字

# 字体
cask "font-jetbrains-mono-nerd-font"
cask "font-lxgw-wenkai"      # 霞鹜文楷
```

写好 Brewfile 之后，跑一遍 `brew bundle`，泡杯咖啡的时间基本就全装好了。

来一张软件截图看看整体效果：

![软件截图](https://img.runningotter.com/2026/03/cbf59491e0178647f9af4f4f762c1d66.png)

## Phase 2: iCloud + 软链接恢复配置

软件装好了，但各种配置文件才是环境的灵魂。我的方案是把所有配置统一放在 `~/Documents/dotfiles/`（iCloud 自动同步），新电脑上创建**软链接**指向这些文件。

### 为什么用软链接而不是直接复制？

| 方式 | 优点 | 缺点 |
|------|------|------|
| 直接复制 | 简单 | 改了之后要手动再拷贝回去 |
| **软链接** ✅ | 修改即同步，只维护一份文件 | 源文件被删除则链接失效 |

### dotfiles 目录结构

```
~/Documents/dotfiles/
├── Brewfile          # Homebrew 安装清单
├── bootstrap.sh      # 一键引导脚本
├── ssh/              # SSH 配置和密钥
├── shell/            # .zshrc / .zprofile
├── git/              # Git 全局配置
├── ghostty/          # 终端配置
└── ...               # 其他应用配置
```

### 恢复脚本核心逻辑

思路就是对每个配置文件创建软链接：

```bash
# Shell 配置
ln -sf ~/Documents/dotfiles/shell/.zshrc ~/.zshrc
ln -sf ~/Documents/dotfiles/shell/.zprofile ~/.zprofile

# Git 配置
ln -sf ~/Documents/dotfiles/git/config ~/.gitconfig

# 终端配置
mkdir -p ~/.config/ghostty
ln -sf ~/Documents/dotfiles/ghostty/config ~/.config/ghostty/config
```

一行命令 = 一个配置恢复，简单粗暴。

> [!TIP]
> 注意 **SSH 密钥**的权限问题：私钥必须是 `600` 权限，否则 SSH 会拒绝使用。部分应用（如代理客户端）在运行时会锁定配置文件，这些需要先关闭应用再恢复。

## Phase 3: Shell 环境

我的 Shell 环境主要由这几部分组成：

- **Oh My Zsh** — 插件管理框架，用了 `git`、`z`、`docker` 等插件
- **Starship** — 跨 Shell 的 Prompt，接管 Oh My Zsh 的主题
- **fzf** — `Ctrl+R` 历史搜索 / `Ctrl+T` 文件搜索
- **zsh-autosuggestions** + **zsh-syntax-highlighting** — 命令建议和语法高亮

这些都已经在 Brewfile 里了，装好之后 `.zshrc` 通过软链接恢复，Shell 环境就回来了。

> [!NOTE]
> Oh My Zsh 安装时会覆盖 `.zshrc`，所以要**先装 Oh My Zsh，再恢复软链接**，顺序不能反。

## Phase 4: 开发语言与工具链

### Node.js — 用 fnm 管理

```bash
fnm install 22    # 安装 LTS 版本
fnm default 22    # 设为默认
```

全局包策略：**不预装**，项目需要时按需安装。常用的也就一个 `pnpm`。

### Python — 用 uv 管理

[uv](https://github.com/astral-sh/uv) 是 Python 工具链的新选择，用 Rust 写的，速度极快。它能替代 `pip`、`pipx`、`venv`、`pyenv` 等一堆工具。

```bash
# 全局工具用 uv tool install
uv tool install some-cli-tool

# 项目依赖
uv init my-project    # 创建项目
uv add requests       # 添加依赖（自动创建 venv）
uv run python main.py # 在 venv 中运行
```

## Phase 5: 一键引导脚本

把上面所有步骤串起来，写成一个 `bootstrap.sh`：

```bash
#!/bin/bash
set -euo pipefail

# Step 1: 安装 Homebrew
# Step 2: brew bundle 安装所有软件
# Step 3: 安装 Oh My Zsh
# Step 4: 创建 dotfiles 软链接
# Step 5: 安装 Node.js
# Step 6: 打印剩余手动步骤
```

新电脑上只需要：

1. 登录 iCloud，等 `~/Documents/dotfiles/` 同步完成
2. 跑 `bootstrap.sh`
3. 手动登录各个应用的账号

## Phase 6: 还是有些需要手动的

总有一些事情没法自动化：

- 各应用登录账号（Chrome、Telegram、微信、Spotify…）
- Raycast 登录后配置自动同步
- 词典应用下载词典包
- OrbStack 首次启动初始化 Docker 环境
- Obsidian 打开笔记仓库

这些列个 checklist，一个个勾就好。

## 总结

整个迁移方案的核心就两件事：

1. **Brewfile** — 软件安装自动化
2. **iCloud + 软链接** — 配置恢复自动化

把迁移文档本身也放在 dotfiles 里，既是操作手册，也是配置备份的一部分。下次再换电脑，直接照着跑就行。

如果你也在考虑整理自己的开发环境，不一定要一步到位，先从一个 Brewfile 开始，把常用软件记下来，就已经能省很多时间了。
