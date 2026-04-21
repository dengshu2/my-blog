---
title: "给软件发一张 AI 名片：从 Skill 到 chrome-history-cli"
publishDate: "22 April 2026"
description: "Claude 在 2025 年 10 月推出 Skills——一种让 AI agent 找得到、装得上、用得对软件的协议。这篇以我刚开源的 chrome-history-cli 为案例，讲 Skill 是什么、长什么样，以及为什么未来每个 AI 友好的软件都可能带一份 SKILL.md。"
tags: ["claude", "skill", "chrome-history-cli", "ai-agent"]
---

今天我开源了一个小 CLI：[chrome-history-cli](https://github.com/dengshu2/chrome-history-cli)，从本地 Chrome 读浏览历史和书签。工具本身一个 Python 脚本、零依赖、500 多行，说不上多少技术含量。

但它有个不太常见的配套：仓库根目录放了一个 `SKILL.md`。

这让它从"一个普通的 CLI"变成了一个 Claude 可以自动识别、决定什么时候用、该怎么用的 skill。

换句话说，它多了一张「给 AI 看的名片」。

本文两件事：

- Skill 是什么，为什么值得关心
- 以 chrome-history-cli 为实例，看一个软件怎么"长出" SKILL.md

顺便聊一个判断：**未来 AI 友好的软件，可能都会带一份 SKILL.md。**

## 1. Skill 是什么

Skill 是 Anthropic 在 2025 年 10 月正式发布的概念，12 月升级为[开放规范](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)。一句话定义：

> Skill 是一个文件夹，装着一份说明文档（`SKILL.md`）加可选的脚本和资源，Claude 在需要时按需加载。

关键机制叫 progressive disclosure（渐进披露）：

- 启动时 Claude 只读每个 skill 的 `name + description`，几十个 token
- 判断哪个可能相关，再完整加载那个 skill 的正文
- 和当前任务无关的 skill，成本趋近于零

所以一个装了几十个 skill 的 Claude，启动开销并不会爆炸。这是它区别于「all-in-one 大 system prompt」的核心设计。

SKILL.md 的形态非常朴素：

```yaml
---
name: chrome-history-cli
description: 从本地 Chrome 读取浏览历史与书签。当用户提到...时使用。
---

# chrome-history-cli

[正文：怎么用、命令速查、FAQ]
```

Frontmatter 的 `description` 是关键——它决定了 Claude 在哪些场景下会想到你。写得准，skill 会在合适时机被唤起；写得虚，要么错过该用的时候，要么被乱用。

## 2. 案例：chrome-history-cli 是怎么"长出" SKILL.md 的

### 需求

我想让 Claude 回答这种问题：

- "我这两周在搜什么主题？"
- "前几天看过那个讲 MCP 的博客，URL 是啥？"
- "帮我把书签里所有 AI 相关的工具列个表。"

这些信息全都在我本地，但 Claude 默认看不到。

传统解法有三条：

1. 浏览器插件——用户要装、要授权
2. Chrome DevTools Protocol——重、侵入性强
3. 直接读 Chrome 的 SQLite 历史库——最轻，但"Chrome 运行时被锁 / WebKit 时间戳 / WAL 附属文件"这些坑得一个个处理

我选了第三条，写成 CLI，Claude 用 Bash 执行即可。

### 代码层

核心技术点（300 来行脚本里的事）：

- 识别 profile 目录（Win / macOS / Linux 三平台）
- 复制 `History` 数据库到临时目录规避 Chrome 的锁——同时复制 `-journal / -wal / -shm` 附属文件
- WebKit 微秒时间戳 → 本地时区 ISO
- `urls / visits / keyword_search_terms` 三张表的查询
- YAML 输出（比 JSON 省 token），`--format json` 可切

这部分是"给工具"。真正让它变成 skill 的是另外半边。

### SKILL.md 层

缩减版长这样：

```markdown
---
name: chrome-history-cli
description: 从本地 Chrome 读取浏览历史与书签。当用户提到
  Chrome/谷歌浏览器的历史记录、访问记录、书签、收藏夹时使用此 skill。
---

## Triggers
- 查 Chrome 历史记录 / 浏览记录
- 最近访问的网站 / 访问最多的网站
- "我前几天看过那个网站"

## 命令速查
chrome-history-cli history list
chrome-history-cli history search "claude" --since 2026-04-01
chrome-history-cli history domains -n 20
chrome-history-cli history searches "claude"
chrome-history-cli bookmarks list
...

## Agent 使用建议
1. 不确定用哪个 profile 时，先跑 profiles
2. 大批量分析时加 --format json
3. 模糊需求用 history search + --since 缩时间窗
...

## FAQ
Q: --since 2026-04-01 包含当天吗？
Q: history top --since 的 visit_count 是什么？
...
```

这份文档和普通 README 有几处明显不同：

- 是给 agent 写的，不是给人写的
- 有专门的 Triggers 段——告诉 Claude "看到什么信号时你应该打开我"
- 有 Agent 使用建议——把我作为工具作者的"怎么用"直接前置，而不是让 Claude 瞎试
- FAQ 专门解释容易被 agent 搞错的语义细节（比如"`history top --since` 返回的 visit_count 是窗口内的还是终生的？"）

这种"给 AI 的产品说明书"才是 skill 的本质。

### 实际效果

今天 Claude 扫到"我最近在搜啥"就自动跑：

```
$ python3 chrome_history_cli.py history searches --since 2026-04-15 -n 20
- term: Claude harness
  engine: www.google.com
  count: 1
  last: "2026-04-20T11:18:33"
- term: "Claude code 安全限制"
  engine: www.google.com
  ...
```

输出直接是 YAML，agent 不用再解析什么就能做二次加工：画活动热图、抽主题、按引擎聚合。

我过去两周的搜索词一扔进去，Claude 五分钟就给我做出了一份"信息摄入画像"。这事放两年前得我自己导出数据、处理格式、写脚本、画图——现在只剩提问。

## 3. AI 友好的软件，未来可能都长这样

把视野拉宽。

- **API 时代**，软件的"对外形态"是给程序员用的：endpoint、auth、SDK
- **MCP 时代**（2024 末起），软件开始有了"给 agent 用的 RPC 接口"：你起一个 server，agent 连上
- **Skill 时代**（2025 末起），软件进一步有了"给 agent 看的说明书 + 本地可执行物"

三者不矛盾，分别解决不同问题：

| 协议  | 位置              | 成本             | 适合的场景                |
| ----- | ----------------- | ---------------- | ------------------------- |
| API   | 远程 HTTP         | 需 server        | 任何程序接入              |
| MCP   | 远程 / 本地 server | 要起 server、要授权 | agent 长期对接一个服务     |
| Skill | 本地文件          | **零基建**       | agent 一次性用一个本地工具 |

Skill 最戳的是成本。一个 `SKILL.md` 加一个脚本就是完整的交付物，放 GitHub `git clone` 到 `~/.claude/skills/` 即可——没有 server、没有账号、没有 webhook。

这带来一个判断：

> 未来每一个有本地数据、有本地入口、或者有独特领域知识的软件，都值得配一份 SKILL.md。

一份好的 skill 至少写清楚这几件事：

- 我是做什么的（让 Claude 能选对我）
- 什么场景下用我（trigger）
- 怎么调用（命令速查）
- 怎么避免把我用错（FAQ / 陷阱）
- 输出结构（让 Claude 不用再做二次猜测）

传统上这些东西分散在 README、wiki、Stack Overflow 答案、Discord 里。Skill 把它们集中到一份 AI 能直接消费的文件里。

一些具体的观察：

- 软件的"说明书"正在分化：给人的（README）和给 AI 的（SKILL.md），未来可能两份都要有
- 像 chrome-history-cli 这种轻量本地工具，skill 是最省的分发形态
- 像 `jq`、`duckdb`、`gh`、`uv` 这类已经被 agent 大量使用的工具，如果官方出 skill，使用体验会肉眼可见地提升
- 公司内部工具（自有 CLI、dashboard 抓取脚本）做 skill 成本极低，ROI 会很高

换句话说，SKILL.md 不是一项"新的工作"。它更像是"让你的软件被 AI 正确使用"的入场券。

## 4. 结语

一个 500 来行的 Python 脚本，加一份 180 行的 SKILL.md，就让我的本地 Chrome 数据变得可以被 Claude 以自然语言访问。

技术上没什么魔法。但这个小案例里有个模式我觉得成立：

- **工具层**解决"能不能做到"
- **Skill 层**解决"AI 能不能正确使用"

一句话收束：

> 好软件自己会说话——今天可以改成，**好软件有 SKILL.md**。

---

项目地址：[github.com/dengshu2/chrome-history-cli](https://github.com/dengshu2/chrome-history-cli)

参考：

- [Introducing Agent Skills（Anthropic）](https://claude.com/blog/skills)
- [Equipping agents for the real world with Agent Skills（Anthropic engineering）](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Claude Skills are awesome, maybe a bigger deal than MCP（Simon Willison）](https://simonwillison.net/2025/Oct/16/claude-skills/)
- [How Anthropic's 'Skills' make Claude faster, cheaper, and more consistent（VentureBeat）](https://venturebeat.com/technology/how-anthropics-skills-make-claude-faster-cheaper-and-more-consistent-for)
