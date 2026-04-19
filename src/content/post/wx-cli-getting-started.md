---
title: "从『做不到』到『一下午』：用 wx-cli 给群友画像"
publishDate: "19 April 2026"
description: "以一次『给群友做数据画像』的真实分析为主线，展示 wx-cli 如何把过去几乎无法完成的微信数据任务，变成一个下午能跑完的标准数据项目。"
tags: ["wx-cli", "wechat", "cli", "data-analysis"]
---

作为一个数据分析师，我一直有一个痒点：

> 我每天在几个微信群里混。群里那些技术大佬、段子手、潜水党，**他们每个人到底是什么样的人**？谁在凌晨三点还没睡、谁的口头禅是"问题不大"、谁每次发言都要连打十条、谁只在周末出现一次又消失？

这是一个非常典型的数据分析问题。如果换成一个 Slack 群、一个 Discord 服务器，甚至一个 Telegram 群，这都是五分钟就能跑起来的事——**但它是微信**。

微信是一个**数据黑洞**：

- 没有开放 API
- 自带搜索只能按会话搜，没法跨群全局搜
- 导出只能一条一条截屏
- 第三方备份工具要么收费要么不维护
- 聊天记录数据库在本地，但是加密的

所以这件事**在过去几乎做不到**。你要么花一周写个逆向，要么放弃。

直到前几天我发现了 [wx-cli](https://github.com/jackwener/wx-cli)，这个问题被解开了。本文以"给一个群友做技术画像"为主线，记录从零到成品的完整过程。

## 0. 先说结论

整个任务一个下午跑完，产出包括：

- **时间指纹**：发言时段分布 vs 群均值，看出他的作息
- **社交生态位**：他的高频对话伙伴、互动强度
- **语言指纹**：TF-IDF 筛出他特有的口头禅
- **话题光谱**：技术/生活/宏观思考的分布
- **技术关注图谱**：分享链接的域名、引用话题的主题聚类

最终得到一张两百字的人物小传，结论相当立体。下面是怎么做到的。

## 1. 过去：为什么这件事做不到

我先花了 10 分钟验证"老办法都不行"：

| 方案 | 卡在哪 |
|---|---|
| 微信自带搜索 | 只能搜单个会话，不支持跨群、不支持按发言人筛 |
| 手动翻聊天记录 | 一个活跃群一个月 10,000+ 条，眼睛翻废 |
| 聊天记录导出插件 | 大多不支持 4.x、不支持 macOS、或者只导出可视化 HTML |
| 自己逆向 SQLite | 数据库有加密，需要逆向提取密钥 |

**问题的本质是：数据在你本地，但你打不开它**。微信把数据存在 `~/Library/Containers/com.tencent.xinWeChat/` 下，但所有 `.db` 文件都是 SQLCipher 加密的，密钥只存在于运行中的 WeChat 进程内存里。

所以任何"分析微信数据"的正规做法都卡在同一步：**怎么把进程内存里的密钥提取出来**。

## 2. wx-cli 做了什么

wx-cli 的定位说穿了就一件事：**替你做密钥提取 + SQLCipher 解密，然后把解密后的数据库封装成一个 CLI**。

它的数据流是这样的：

```
┌─ 敏感一次性操作（sudo wx init）──────────────────────┐
│  扫描 WeChat 进程内存 → 17 个 DB 密钥               │
│                      → ~/.wx-cli/all_keys.json     │
└─────────────────────────────────────────────────────┘
               ↓
┌─ daemon 启动（首次 wx 命令）─────────────────────────┐
│  读 all_keys.json → 解密 .db 到 cache/              │
│  监听 Unix socket → daemon.sock                     │
└─────────────────────────────────────────────────────┘
               ↓
┌─ 日常查询（wx sessions / search / stats …）────────┐
│  CLI ← IPC → daemon ← SQL → 已解密的本地缓存        │
│  ▶ 不 sudo、不扫内存、不碰 WeChat 进程              │
└─────────────────────────────────────────────────────┘
```

**关键性质**：

- 扫内存这个敏感动作**只发生一次**（或微信重启后手动触发）
- 日常命令纯粹是读本地文件 + IPC，不走网络
- `~/.wx-cli/` 下的 `all_keys.json` 是敏感资产，**绝对不要传 Git / 云盘**

## 3. 安装（3 分钟）

```bash
# npm 安装
npm install -g @jackwener/wx-cli

# macOS：先给 WeChat 重签名（只做一次，微信更新后要重做）
codesign --force --deep --sign - /Applications/WeChat.app

# 重启微信并完成登录
killall WeChat && open /Applications/WeChat.app

# 初始化（唯一一次需要 sudo）
sudo wx init
```

完成后验证 daemon：

```bash
$ wx --version
wx 0.1.9
$ wx daemon status
wx-daemon 运行中 (PID 3502)
```

以后所有命令都不再需要 sudo。

## 4. 真实案例：给"J 同学"做画像

> 隐私处理说明：以下分析基于真实数据但**已做匿名化**。昵称 / 截图内容里的身份相关细节已替换。公开发布与个人分析之间的隐私边界，在本文最后会专门讨论。

选一个群里发言量 Top 3 的朋友，暂称 **J 同学**。目标：搞清楚他是什么样的人。

### Step 1 — 摸底

先看群整体：

```bash
wx sessions --json | jq '.[] | select(.chat == "<群名>")'
wx stats "<群名>"
```

得到基本盘：

- 群人数：500（满群）
- 近 30 天消息：10,147 条
- Top 3 发言人分别贡献 3390 / 1595 / 766 条
- J 同学排第 3，766 条

这 766 条就是我们的画像原材料。

### Step 2 — 拉原始数据

```bash
wx history "<群名>" -n 20000 --json > ydata_all.json
```

一条命令，10 秒钟，整整 30 天的群聊落到本地。在微信原生体验下，**这一步本身就是不可能的**。

然后 Python 一行筛出 J 同学的发言：

```python
import json
d = json.load(open('ydata_all.json'))
me = [m for m in d if m['sender'] == 'J同学']
# 766 条，文本 611 / 表情 110 / 链接 31 / 图片 14
```

### Step 3 — 五个分析维度

#### ① 时间指纹

对比他的小时分布和全群均值：

```
11 点 ▲▲▲▲▲▲▲▲▲▲  +10pp 超级峰值
14 点 ▲▲▲▲        +4.1
19 点 ▲▲▲         +3.2
22 点 ▽▽▽▽▽▽      -6.4  从不熬夜
```

一眼看出**作息规律**：上午 11 点摸鱼型高峰、午饭后第二波、18 点通勤静默、19 点晚饭后一轮、22 点准时下线。

周分布更惊喜：周三发言量 27 条（远低于其他工作日），周日只有 1 条——**周三有规律性会议/值班，周日雷打不动数字戒断**。

#### ② 发言节奏

用 5 分钟间隔切 burst：

```python
bursts = []; cur = [msgs[0]]
for m in msgs[1:]:
    if m['ts'] - cur[-1]['ts'] <= 300: cur.append(m)
    else: bursts.append(cur); cur = [m]
bursts.append(cur)
```

结果：单条独立发言只有 16%，4 条以上连发占 48%。**他是典型"敲一句发一句"的爆发型**。最长一次连打 49 条，聊的是 Mac x86→ARM 迁移。

#### ③ 社交生态位

统计他每次发言前后 5 分钟谁在同时活跃：

| 对方 | 前 5 分钟 | 后 5 分钟 | 合计 |
|---|---|---|---|
| 用户 A | 2629 | 2272 | **4901** |
| 用户 B | 2289 | 2193 | **4482** |
| 用户 C | 957 | 932 | 1889 |

他的群生活是围绕 A、B 两人展开的**双线对手戏**——而 A、B 正好是群发言量 Top 1 和 Top 2。群的"三巨头"就是三个人的互动闭环。

#### ④ 语言指纹（TF-IDF 口头禅）

拿他的字符二元组频率除以群整体字符二元组频率，挑出他**独有**的高频词：

```python
ratio = me_rate[w] / all_rate[w]
# 筛 ratio > 2 且 me_count >= 5
```

| 特征词 | 他出现 | 群罕见度 |
|---|---|---|
| 问题不大 | 11 | 9.9× |
| 希腊奶 | 5 | 16.5× |
| 爆金币 | 5 | 16.5× |
| 正常吧 | 9 | 6.1× |

前两个是内部梗（"金币" = 结婚彩礼，是群里的暗语），"问题不大 / 正常吧"则是他的评价基线。一句模拟他的话：「**这种问题不大，正常吧，一般也就那样**」。

#### ⑤ 话题光谱

按"长度 × 后续 5 分钟群活跃度"给每条文本打分，挑最具代表性的 15 条读——只读这 15 条就能看到四个象限：

- **技术分析派**：看到别人发的 GitHub 项目，能直接点出"`server/.env` 里提交了 DEV_API_KEY，解码后是外部地址，给动态执行逻辑供货"——读代码洞察力
- **AI 社会思想者**：某天中午连发 9 条谈"未来 5 年大部分人都不用干活 / 社会总产出早就远超人的总需求"，引出 200+ 条群回复
- **自嘲生活流**："我被裁了打算去搞个餐车卖炒粉去"——最出圈的一段
- **信息中继站**：31 条引用回复，每条都附吐槽点评，从不裸转

真·链接只有 6 条，但域名分布很能说明问题：`github.com / openai.com / arxiv.org / claude 官方文档`——**一手信源，零自媒体**。

### Step 4 — 人物小传

综合五个维度，200 字总结：

> 一个活在 11 点、19 点和 22 点之间的数据开发，用"问题不大"回应一切，被家里催婚、被公司裁掉，但仍然能一边调侃自己要去卖炒粉，一边严肃思考 AI 时代人的福祉。技术上是务实的 Agent 实践派，Codex 重度用户，对函数式编程有立场，对硬件选型理性，从不转发自媒体，只读一手信源。群里社交围绕两个核心对手展开，周三消失、周日不在线。

这就是一个下午的产出。

## 5. 代码全景（能复制粘贴的那种）

```bash
# 拉数据
wx history "群名" -n 20000 --json > raw.json
```

```python
import json, re
from collections import Counter
from datetime import datetime

raw = json.load(open('raw.json'))
target = '目标昵称'
msgs = [m for m in raw if m['sender'] == target]
texts = [m['content'] for m in msgs if m['type'] == '文本']

# 1) 时间指纹
hist = Counter(datetime.strptime(m['time'], '%Y-%m-%d %H:%M').hour
               for m in msgs)

# 2) Burst
msgs.sort(key=lambda m: m['timestamp'])
bursts, cur = [], [msgs[0]]
for m in msgs[1:]:
    (cur if m['timestamp'] - cur[-1]['timestamp'] <= 300 else
     bursts.append(cur) or cur).append(m) if False else None
    # 实际代码请写得清楚一点，这里仅示意

# 3) 社交网络
before = Counter(); after = Counter()
raw.sort(key=lambda m: m['timestamp'])
for m in msgs:
    t = m['timestamp']
    for x in raw:
        dt = x['timestamp'] - t
        if -300 <= dt < 0 and x['sender'] != target:
            before[x['sender']] += 1
        elif 0 < dt <= 300 and x['sender'] != target:
            after[x['sender']] += 1

# 4) 口头禅（字符 n-gram TF-IDF）
def ngrams(ts, n):
    c = Counter()
    for t in ts:
        s = re.sub(r'[^\u4e00-\u9fff]', '', t)
        for i in range(len(s)-n+1): c[s[i:i+n]] += 1
    return c
all_texts = [m['content'] for m in raw if m.get('type')=='文本']
me_bi, all_bi = ngrams(texts, 2), ngrams(all_texts, 2)
sig = [(w, c, (c/sum(me_bi.values())) / (all_bi.get(w,1)/sum(all_bi.values())))
       for w, c in me_bi.items() if c >= 5]
sig = sorted([x for x in sig if x[2] > 2], key=lambda x: x[1]*x[2], reverse=True)

# 5) Top 语录
scored = []
for m in msgs:
    if m['type'] != '文本' or len(m['content']) < 15: continue
    t = m['timestamp']
    after_n = sum(1 for x in raw if 0 < x['timestamp']-t <= 300
                  and x['sender'] != target)
    scored.append((len(m['content']) + after_n*2, m))
scored.sort(reverse=True, key=lambda x: x[0])
```

整个脚本不到 80 行，在任何一个装了 Python 的电脑上都能跑。

## 6. 这个工作流真正重要的是什么

wx-cli 本身只是解密层，但它改变的是**整个工作流的可能性**：

| 传统体验 | wx-cli 后的体验 |
|---|---|
| 微信是信息黑洞 | 微信变成可查询的结构化数据 |
| 分析 1 个群友要一周 | 一个下午跑完 5 维度画像 |
| 只能看，不能算 | 接上 Python / Pandas / DuckDB / LLM，后面怎么玩都行 |
| 数据贴在手机上 | 数据在本地文件，随时喂给 Claude / GPT |

更重要的是，它解锁的不只是"微信数据分析"这一件事，而是一整类过去**数据在眼前但拿不到**的任务：

- 给某个群做年度报告
- 自动对聊天记录做 LLM 总结
- 提取所有好友的沟通频率做社交网络图
- 把一个技术讨论群的历史喂给 RAG 做检索知识库
- 写一个 MCP 让 Claude Desktop 直接回答"上周谁在群里讨论了 X"

## 7. 关于隐私的三条纪律

用微信数据做分析，有三条底线我觉得必须写清楚：

1. **`~/.wx-cli/all_keys.json` 永远不要离开你的磁盘**。任何一个复制都是一次"把微信密钥泄漏出去"的操作。
2. **他人的聊天内容要做匿名化**。本文所有人名、内部梗、暴露个人信息的原句都已替换或改写。"有趣的分析"和"泄漏别人隐私"是两件事。
3. **数据用完及时清理**。cache/ 下是明文 SQLite，不用 `wx daemon stop` 之后可以定期 `rm -rf ~/.wx-cli/cache/`，下次用会自动重建。

## 8. 小结

过去，我想给一个微信群友画像，是个做不到的任务。

今天，这个任务从"做不到"变成"**一个下午、80 行 Python、5 个维度**"。

技术上没什么魔法：wx-cli 做的只是替我完成"进程内存扫描 + SQLCipher 解密 + SQLite 查询封装"这三步工程活。但正是这三步工程活，把微信从**黑洞**变成了**数据源**。

下次你想认真了解一个群、一段关系、或者过去一年自己在微信上留下了什么，你终于有工具可以做了。

项目地址：[github.com/jackwener/wx-cli](https://github.com/jackwener/wx-cli)
