---
title: "周末入坑小丑牌，顺手做了个查卡网站"
publishDate: "2026-03-30"
description: "沉迷 Balatro 两天后卡关，把 B 站攻略视频转成了一个可搜索的小丑牌查询网站，记录一下从音频转文字到前端上线的完整过程"
tags: ["balatro", "gemini", "前端", "周末项目"]
---

上周五下班，手贱打开了 Balatro（小丑牌），然后整个周末就没了。

第一天上头到凌晨一点，第二天继续肝，结果卡在挑战关卡死活过不去。周日醒来冷静了一下，想想这周末代码一行没写，多少有点负罪感。

正好刷到一个 B 站视频，讲的是全 150 张小丑牌的评测和用法：

> [【Balatro】全小丑牌评测](https://www.bilibili.com/video/BV1yk34zZEKR)

看了一半，我就在想：有没有可能把这个视频的内容整理成一个可搜索的网站？ 这样查牌的时候比翻视频方便多了，顺便也让这个周末不至于完全荒废。

最终效果：[balatro.dengshu.ovh](https://balatro.dengshu.ovh/)

![Balatro Helper 网站效果](https://img.runningotter.com/2026/03/5bf5177df617e0f60ec1161c713ab1ed.png)

整个项目大概花了 3 个小时，中间有个坑卡了将近 1 小时，下面记录一下完整的思路。

## 数据从哪来

这个项目的核心不是前端，而是怎么把一个 40 分钟的视频变成结构化数据。我拆成了三步：

### 第一步：提取视频音频

用 [这个工具](https://downloader.bhwa233.com) 下载 B 站视频的音频文件。操作很简单，贴视频链接进去就能拿到音频。

### 第二步：音频转文字（踩坑重灾区）

拿到音频后，需要转成文字。这里我走了弯路：

| 方案 | 结果 |
|------|------|
| 传统语音转文字模型 | 识别效果很差，游戏术语几乎全错，卡了将近 1 小时 |
| Gemini Flash | 直接输出 JSON 格式，识别准确率高很多 |

最终方案是用 Gemini Flash 处理音频，让它直接输出结构化的 JSON。不过有一个限制：网页端对输入长度有上限，150 张小丑牌的内容需要分多次输出，每次处理一批再合并。

### 第三步：补全中英文数据

大模型输出的结果已经不错了，但游戏内的中文名称需要严格对照。数据来源：

- 中文名称：参照了 [营地的 Balatro 工具页](https://www.iyingdi.com/tz/tool/general/balatro)，用 Gemini 侧边栏批量提取了所有中文翻译
- 英文信息：从 [Balatro Wiki](https://balatrowiki.org/w/Jokers) 获取，包括卡牌效果、稀有度等

有了视频转录 + 中文名称 + 英文 Wiki 三份数据，就可以做合并整理了。

:::tip
当单个数据文件体积较大时，值得拆分成多个小文件。一是方便大模型分批处理，二是前端按需加载时性能更好。
:::

## 前端构建

数据准备好之后，前端部分就交给大模型来搭建了。整体风格选了黑白极简，目前够用，后面考虑加点交互细节。

技术栈没什么特别的，核心就是一个可搜索、可筛选的卡牌列表，点进去能看到每张牌的详细评价和用法建议。

## 后续想做的事

- 加一个 Tier Maker 功能，做一个完整的小丑牌强度排名落地页
- 目前的黑白风格还行，但考虑找个更好的视觉方案
- 练手项目多做做，做的过程中总能学到新东西

## 一句话总结

从 B 站视频到可用的网站，核心链路是：下载音频 → Gemini Flash 转结构化文字 → 补全中英文数据 → 前端展示。最大的教训是别用传统 ASR 模型处理游戏内容，直接上大模型省时省力。

## 参考资源

- [Balatro Helper 在线地址](https://balatro.dengshu.ovh/)
- [GitHub 源码](https://github.com/dengshu2/balatro-helper)
- [B 站评测视频](https://www.bilibili.com/video/BV1yk34zZEKR)
- [Balatro Wiki](https://balatrowiki.org/w/Jokers)
- [营地 Balatro 工具](https://www.iyingdi.com/tz/tool/general/balatro)
