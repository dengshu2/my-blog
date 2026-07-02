---
title: "用 gws CLI 让 AI 直接操控 Google Workspace"
publishDate: "2026-03-07"
description: "安装一个命令行工具，让 AI 助手可以直接读写你的 Gmail、Drive、Calendar、Sheets，无需写任何代码。"
tags: ["google-workspace", "ai", "cli", "自动化", "工具"]
---

> 安装一个命令行工具，让 AI 助手可以直接读写你的 Gmail、Drive、Calendar、Sheets。

![Antigravity AI 助手通过 gws CLI 访问 Google Workspace 的效果截图](https://img.runningotter.com/2026/03/199268e4b79f8161b5d416c4007b1b53.png)

---

## 背景

一直想让 AI 帮我处理一些重复性的 Google Workspace 操作——整理邮件、管理 Drive 文件、查日历。但每次都要自己写 API 集成代码，太麻烦。

直到发现了 [googleworkspace/cli](https://github.com/googleworkspace/cli)，也叫 `gws`。

---

## gws 是什么？

一句话：Google Workspace 全家桶的统一命令行接口，专为人类和 AI Agent 设计。

- 支持 Drive、Gmail、Calendar、Sheets、Docs、Slides、Chat、Forms、Keep、Meet……几乎涵盖所有 Google Workspace 服务
- 命令结构从 Google Discovery Service 动态生成，不需要手动维护，Google 加新 API 就自动支持
- 所有输出都是结构化 JSON，AI 可以直接消费
- 内置 100+ Agent Skills（SKILL.md 文件），教 LLM 怎么用这些命令

> ⚠️ 注意：这不是 Google 官方产品，虽然代码托管在 googleworkspace 组织下。

---

## 安装

需要 Node.js 18+，一条命令搞定：

```bash
npm install -g @googleworkspace/cli
```

验证安装：

```bash
gws --version
# gws 0.8.0
```

---

## 认证配置

gws 支持多种认证方式，我用的是手动 OAuth（因为没装 gcloud CLI）。

### 第一步：创建 Google Cloud 项目

去 [Google Cloud Console](https://console.cloud.google.com/projectcreate) 创建一个新项目，名字随意，记下 Project ID。

### 第二步：启用 API

在项目里依次启用你需要的 API：

- [Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)
- [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
- [Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)
- [Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com)

### 第三步：配置 OAuth 同意屏幕

访问：`https://console.cloud.google.com/apis/credentials/consent?project=<PROJECT_ID>`

- User Type 选 External（不要选 Internal，否则个人 Gmail 账号无法授权）
- 填写 App name（随意，比如 "My-GWS-Tool"）
- 在 Test users 里添加自己的 Gmail 邮箱

### 第四步：创建 OAuth 凭证

访问：`https://console.cloud.google.com/apis/credentials?project=<PROJECT_ID>`

- 点 Create Credentials → OAuth client ID
- Application type 选 Desktop app
- 下载 JSON 文件，保存到 `~/.config/gws/client_secret.json`

```bash
mkdir -p ~/.config/gws
mv ~/Downloads/client_secret_*.json ~/.config/gws/client_secret.json
```

### 第五步：登录

```bash
gws auth login -s drive,gmail,sheets,calendar
```

终端会弹出一个 TUI 界面让你选择 OAuth scopes（用方向键 + Space 选择，Enter 确认），然后浏览器自动打开授权页面。

> 如果看到 "Google 尚未验证此应用" 警告，正常，点"继续"即可。

### 第六步：发布 OAuth App（避免 Token 7 天过期）

这一步很重要，容易被忽略。

OAuth App 在 Testing 模式时，Google 限制 Refresh Token 只有 7 天有效期，过了就要重新登录。

解决方法：把 App 发布为 Production。对个人用途不需要 Google 审核，直接发布即可：

`https://console.cloud.google.com/apis/credentials/consent?project=<PROJECT_ID>`

找到 "Publish App" 点击确认，Token 从此长期有效。

### 验证认证状态

```bash
gws auth status
```

输出里看到这几项就说明一切正常：

```json
{
  "token_valid": true,
  "has_refresh_token": true,
  "encryption_valid": true,
  "user": "your@gmail.com"
}
```

---

## 实际使用示例

```bash
# 列出最近 10 个 Drive 文件
gws drive files list --params '{"pageSize": 10}'

# 查看未读邮件数量
gws gmail users messages list --params '{"userId": "me", "q": "is:unread", "maxResults": 5}'

# 查看接下来的日历事件
gws calendar events list --params '{
  "calendarId": "primary",
  "maxResults": 5,
  "orderBy": "startTime",
  "singleEvents": true,
  "timeMin": "2026-03-07T00:00:00+08:00"
}'

# 创建新 Sheet
gws sheets spreadsheets create --json '{"properties": {"title": "Q1 数据"}}'

# 预览请求而不实际执行
gws drive files list --params '{"pageSize": 5}' --dry-run
```

---

## 在 AI 助手里使用

这才是 `gws` 真正的杀手锏。

由于 gws 是全局命令行工具，任何能执行 shell 命令的 AI Agent 都可以直接调用它。在我用的 Antigravity（Google Deepmind 的 AI 编程助手）里，我只需要在对话里说：

> "帮我整理一下最近的未读邮件"
> "把这个 CSV 数据写到一个新的 Sheet 里"
> "查一下我明天有什么日程"

AI 就会自动运行相应的 `gws` 命令，读取 JSON 输出，再给我整理成人类可读的格式。

完全不需要写代码，也不需要配置任何 API 集成。

### 配合使用的技巧

为了让 AI 在每次新对话时都知道 `gws` 可用，在工作目录创建一个说明文件（比如 `.agents/workflows/use-gws.md`），记录已授权的账号、可用服务和常用命令。AI 会自动加载这个文件作为上下文。

---

## 注意事项

| 事项 | 说明 |
|---|---|
| 费用 | 个人账号完全免费，API 配额极宽松 |
| 密钥安全 | `~/.config/gws/client_secret.json` 不要上传到 GitHub |
| 凭证加密 | 认证信息用 AES-256-GCM 加密存在本地，密钥在 OS keyring |
| 自动升级 | npm 全局包不会自动升级，手动执行 `npm update -g @googleworkspace/cli` |
| 官方支持 | 非 Google 官方产品，v1.0 之前可能有 breaking changes |

---

## 总结

整个配置过程大约 15 分钟，核心步骤：

1. `npm install -g @googleworkspace/cli`
2. 在 Google Cloud Console 创建项目 + 配置 OAuth
3. `gws auth login -s drive,gmail,sheets,calendar`
4. 发布 OAuth App 为 Production

配置完成后，AI 助手就有了操控你整个 Google Workspace 的能力，无需额外代码。

---

*gws GitHub 仓库：https://github.com/googleworkspace/cli*
