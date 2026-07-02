---
title: "从零开始：订阅 Claude 会员并稳定使用 Claude Code 的完整指南"
publishDate: "2026-06-12"
description: "面向完全小白的保姆级教程：从网络环境、谷歌账号到订阅支付，三步解决国内使用 Claude 和 Claude Code 的所有问题，附完整资源链接。"
tags: ["claude", "claude-code", "ai", "教程", "网络"]
---

> 这篇文章只解决一件事：让一个“完全没有经验”的人，从零开始，最终能在国内稳定地订阅和使用 Claude（包括 Claude Code）。这里存在着一个鸡生蛋和蛋生鸡的问题。第一步要靠你自己解决了。

:::note
本文所有内容仅供学习交流，请在遵守当地法律法规的前提下使用相关技术。文中提到的价格、链接和方案均为写作时（2026 年 6 月）的情况，可能随时间变化。
:::

## 写在前面

整个流程可以拆成三个独立的问题，按顺序解决：

1. 网络问题 —— 能稳定访问 Claude 的服务
2. 账号问题 —— 有一个干净可用的账号登录 Claude
3. 支付问题 —— 能付钱订阅会员

前两步解决后，你就可以免费使用 Claude 了。第三步解决后，你就拥有了完整的 Claude Pro / Max 体验，包括在终端里跑 Claude Code。

这三步每一步都有门槛，但都不难，需要的只是一点耐心和搜索能力。我写这篇除了给出具体方案，更想顺手教你的是：遇到问题去哪里找答案——这个时代，搜索能力够用，大部分坑你都能自己填上。

## 术语表：先搞懂这几个词

如果你是完全的小白，先花两分钟看完这张表，后面的内容会顺畅很多。

| 术语 | 解释 |
|------|------|
| 代理 / 翻墙 / 科学上网 | 通过中转服务器访问国内无法直接访问的网站（Google、YouTube、Claude 等）的统称 |
| 机场 | 卖共享代理服务的商家。你付月费，拿到一个"订阅链接"，导入软件即可用。优点是省事，缺点是 IP 多人共用 |
| VPS | Virtual Private Server，虚拟专用服务器。你租一台在海外的服务器，自己在上面搭代理，IP 独享 |
| 节点 | 一台具体的代理服务器。"美西节点"指位于美国西部（如洛杉矶、圣何塞）的服务器。论物理距离，亚太节点（香港、日本、新加坡）其实更近，但价格昂贵且稳定性一般；美西平衡了价格和稳定性，所以是国内用户的主流方案 |
| IP 干净 / 被滥用 | 一个 IP 如果被很多人共用、用于注册大量账号，就会被 Google / Anthropic 等平台标记为高风险（"脏 IP"），导致注册失败或封号 |
| 代理客户端 | 装在你电脑/手机上的软件，负责把流量转发到代理服务器。常见的有 Clash Verge Rev（桌面端）、Shadowrocket 小火箭（iOS） |
| TUN 模式 | 代理客户端的一种工作模式，创建虚拟网卡接管全部系统流量。普通模式只代理浏览器，而终端里的命令行程序（比如 Claude Code）不走代理——开启 TUN 模式后它们才能联网 |
| 订阅链接 | 一个 URL，里面包含了你的节点信息。代理客户端导入它就能自动获取节点配置 |
| 苹果税 | 通过 App Store 内购付费时，苹果抽取的约 30% 佣金。部分订阅会把这笔钱转嫁给用户 |
| 美区 Apple ID | 注册地区为美国的苹果账号，用于下载美区 App、用美区礼品卡支付订阅 |
| 全币种信用卡 | 国内银行发行、支持美元等多币种结算的 Visa/Mastercard 信用卡，可用于绑定海外服务 |
| Nodeseek | [nodeseek.com](https://www.nodeseek.com/)，国内最活跃的 VPS / 网络技术论坛，网络相关的一切问题都能在这里搜到 |
| Linux.do | [linux.do](https://linux.do/)，技术社区，关于各种海外服务订阅的问题（Apple ID、信用卡、支付等）大多能在这里找到答案 |

记住这两个社区的分工就好：网络问题查 Nodeseek，订阅问题查 Linux.do。善用站内搜索，多数问题都有现成答案。

## 第一步：解决网络问题

这是地基。网络解决了，你同时获得的是 Google、YouTube、维基百科、GitHub 的访问能力——在遵守法律法规的前提下，我把它当成现代人的一项必备技能，也是观察世界的一个窗口。

目前通用的方案有两种：

### 方案对比：机场 vs 自建

| | 机场 | 自建（VPS） |
|---|---|---|
| 上手难度 | ⭐ 极低 | ⭐⭐⭐ 需要动手 |
| 成本 | 约 10~30 元/月 | 100~350 元/年 |
| IP 质量 | ❌ 多人共用，易被滥用 | ✅ 独享，干净 |
| 适合 Claude？ | 不推荐 | 推荐 |

机场的问题在于 IP 共用。绝大多数机场都是几十上百人共用同一批出口 IP，注册 Google 账号容易触发风控，使用 Claude 也存在因 IP 被滥用而封号的风险。Claude 对登录环境比较敏感，所以我不推荐机场方案。

自建 VPS 是我更推荐的路线，具体又分两种玩法：

### 方案 A：和别人拼车一个 VPS（约 100 元/年）

类似于"拼单"——几个人共同分摊一台服务器的费用。

- 成本：一年 100 元以内
- 流量：每月约 200GB，尝鲜和日常使用完全够用
- 关键词：认准"美西"（美国西部）节点
- 去哪找：Nodeseek 的拼车版块 👉 [nodeseek.com/categories/carpool](https://www.nodeseek.com/categories/carpool)，搜索关键词"大妈 CORONA"（即 DMIT 的 CORONA 系列套餐，拼车里的热门型号）

不用担心隐私问题：拼车拼的是流量，车主只会发给你一个订阅链接，你通常不能在拼车服务器上进行任何操作，自然也不存在敏感信息泄露的问题。要注意的只是选择论坛里信誉好的老用户发起的车队，避免车主中途跑路。

### 方案 B：自己买 VPS 搭建（约 350 元/年）⭐ 推荐

完全独享、最稳定的方案。

厂商选择：我只推荐行业人称"大妈"的 DMIT（[dmit.io](https://www.dmit.io/)）。在有优惠的情况下，美西节点年付约 350 元，每月 2TB 流量。

为什么不推荐更便宜的 VPS？市面上确实有大量几十块一年的服务器，但这类机器的网络质量通常不稳定，高峰期断断续续，排查问题浪费的时间远超省下的钱。综合成本和时间，我自己的结论是 DMIT 美西性价比最优。

搭建方法（二选一）：

1. AI 辅助搭建：直接把"帮我在 Debian VPS 上搭建 sing-box 代理服务"这样的需求丢给 Claude / ChatGPT，跟着指引一步步操作
2. 一键脚本：使用 233boy 的 sing-box 脚本 👉 [233boy.com/sing-box/sing-box-script](https://233boy.com/sing-box/sing-box-script/)，真正的一行命令搞定

本站之前写过一篇 [VPS 初始化配置指南](/posts/vps/)，购买后的系统配置、SSH 加固可以参考。

### 客户端软件：电脑用 Clash Verge Rev，iPhone 用小火箭

代理服务器搭好后，你需要在自己的设备上装客户端软件连接它。市面上软件五花八门，就我的体验来说，这两款就够了：

- 桌面端（Mac / Windows / Linux）：[Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev)，开源免费
- iOS / iPhone：Shadowrocket（小火箭），需要美区 Apple ID 购买（约 $2.99，这也是后面要注册美区 Apple ID 的原因之一）

### 关键设置：开启 TUN 模式

这是很多人卡住的地方，单独拎出来说。

默认情况下，代理客户端只接管浏览器流量。但 Claude Code 是跑在终端里的命令行程序，它不会自动走代理——结果就是浏览器能打开 claude.ai，但终端里的 Claude Code 一直连不上网。

解决办法很简单：在 Clash Verge Rev 中开启 TUN 模式。它会创建一张虚拟网卡，接管整个系统的流量。开启后，无论是终端里的 Claude Code，还是 Claude 桌面端，都能正常联网。

### 附：Clash 参考配置

下面是一份我在用的 Clash 配置，规则部分参考了 [Loyalsoldier/clash-rules](https://github.com/Loyalsoldier/clash-rules) 和 [Shadowrocket-ADBlock-Rules-Forever](https://github.com/Johnshall/Shadowrocket-ADBlock-Rules-Forever) 两个项目。其中专门为 Claude Code 加了域名分流规则，并代理了 NTP 端口防止时区泄露。

你只需要把 `proxies` 和 `proxy-groups` 里的 `xxx` 换成自己的节点信息。看不懂没关系——把整份配置丢给 AI，告诉它你的节点信息，让它帮你改。

```yaml
port: 7890
socks-port: 7891
redir-port: 7892
mixed-port: 7893
allow-lan: false
unified-delay: true
mode: rule
log-level: info
ipv6: false
external-controller: 0.0.0.0:9090

profile:
  tracing: true
sniffer:
  enable: true
  sniff:
    HTTP:
      ports: [80, 8080-8880]
      override-destination: true
    TLS:
      ports: [443, 8443]
    QUIC:
      ports: [443, 8443]
  skip-domain:
    - "Mijia Cloud"
    - "+.push.apple.com"
dns:
  enable: true
  listen: 0.0.0.0:1053
  ipv6: false
  prefer-h3: false
  respect-rules: true
  use-system-hosts: false
  cache-algorithm: arc
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  fake-ip-filter:
    - "+.lan"
    - "+.local"
    - "+.msftconnecttest.com"
    - "+.msftncsi.com"
    - "localhost.ptlogin2.qq.com"
    - "localhost.sec.qq.com"
    - "+.in-addr.arpa"
    - "+.ip6.arpa"
    - "time.*.com"
    - "time.*.gov"
    - "pool.ntp.org"
    - "localhost.work.weixin.qq.com"
  default-nameserver:
    - 223.5.5.5
    - 1.2.4.8
  nameserver:
    - tls://8.8.8.8
    - tls://1.1.1.1
  proxy-server-nameserver:
    - https://223.5.5.5/dns-query
    - https://doh.pub/dns-query
  direct-nameserver:
    - https://223.5.5.5/dns-query
    - https://doh.pub/dns-query
  nameserver-policy:
    geosite:private,cn:
      - https://223.5.5.5/dns-query
      - https://doh.pub/dns-query

proxies:
  - xxx # 换成你自己的节点

proxy-groups:
  - name: PROXY
    type: select
    proxies:
      - xxx # 换成你自己的节点名称

rule-providers:
  reject:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt"
    path: ./ruleset/reject.yaml
    interval: 86400

  icloud:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt"
    path: ./ruleset/icloud.yaml
    interval: 86400

  apple:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt"
    path: ./ruleset/apple.yaml
    interval: 86400

  google:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt"
    path: ./ruleset/google.yaml
    interval: 86400

  proxy:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt"
    path: ./ruleset/proxy.yaml
    interval: 86400

  direct:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt"
    path: ./ruleset/direct.yaml
    interval: 86400

  private:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt"
    path: ./ruleset/private.yaml
    interval: 86400

  gfw:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt"
    path: ./ruleset/gfw.yaml
    interval: 86400

  tld-not-cn:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt"
    path: ./ruleset/tld-not-cn.yaml
    interval: 86400

  telegramcidr:
    type: http
    behavior: ipcidr
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt"
    path: ./ruleset/telegramcidr.yaml
    interval: 86400

  cncidr:
    type: http
    behavior: ipcidr
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt"
    path: ./ruleset/cncidr.yaml
    interval: 86400

  lancidr:
    type: http
    behavior: ipcidr
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt"
    path: ./ruleset/lancidr.yaml
    interval: 86400

  applications:
    type: http
    behavior: classical
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt"
    path: ./ruleset/applications.yaml
    interval: 86400

rules:
  # Claude Code 专用域名
  - DOMAIN-SUFFIX,anthropic.com,PROXY
  - DOMAIN-SUFFIX,claude.ai,PROXY
  - DOMAIN-SUFFIX,claude.com,PROXY
  - DOMAIN-SUFFIX,clau.de,PROXY
  - DOMAIN-SUFFIX,claudemcpclient.com,PROXY
  - DOMAIN-SUFFIX,claudeusercontent.com,PROXY
  - DOMAIN-SUFFIX,sentry.io,PROXY
  - DOMAIN-SUFFIX,statsigapi.net,PROXY
  - DOMAIN-KEYWORD,datadog,PROXY
  - DOMAIN-KEYWORD,sift,PROXY
  # NTP 防时区泄露
  - DST-PORT,123,PROXY
  # 常规规则
  - RULE-SET,applications,DIRECT
  - DOMAIN,clash.razord.top,DIRECT
  - DOMAIN,yacd.haishan.me,DIRECT
  - RULE-SET,private,DIRECT
  - RULE-SET,reject,REJECT
  - RULE-SET,icloud,DIRECT
  - RULE-SET,apple,DIRECT
  - RULE-SET,google,PROXY
  - RULE-SET,proxy,PROXY
  - RULE-SET,gfw,PROXY
  - RULE-SET,tld-not-cn,PROXY
  - RULE-SET,direct,DIRECT
  - RULE-SET,lancidr,DIRECT
  - RULE-SET,cncidr,DIRECT
  - RULE-SET,telegramcidr,PROXY
  - GEOIP,LAN,DIRECT
  - GEOIP,CN,DIRECT
  - MATCH,PROXY
```

## 第二步：解决账号问题

账号问题的核心其实只有一个：注册一个谷歌账号。

为什么是谷歌账号？因为它是整个海外互联网的"通行证"：

- 可以直接用 Google 第三方登录 Claude（以及绝大多数海外平台）
- Chrome 自带的密码同步，帮你管理所有账号密码
- 附赠 Gmail、Google Colab 等一票服务
- 注册 Claude 用国内邮箱成功率玄学，Gmail 最稳

### 怎么注册

在解决了第一步网络问题的前提下，用中国手机号就能正常注册并收到验证码，最终得到一个美国地区的谷歌账号。实操中有几个细节决定成败：

1. 优先用 iPhone + Safari 浏览器访问谷歌注册页面。这是我实测最丝滑的组合——最近让同事照这个流程注册，全程没有遇到任何问题。其他设备/浏览器可能会碰到各种奇怪的拦截
2. 保证节点环境干净。这就是前面不推荐机场的原因——共用 IP 注册谷歌账号很容易直接失败。用自建 VPS 基本不会有问题
3. 具体步骤可以自行搜索，YouTube 上有大量手把手视频教程

:::tip
很多人卡在注册时「验证码发送不出去」这一步。一个亲测有效的绕法：先从 Gmail 的注册入口用邮箱注册，这条路在注册当下不强制验证手机号，能直接把账号建出来；账号建好后，再到谷歌浏览器的个人资料界面登录这个刚注册好的账号，在登录后的设置里补认证手机号。这样就避开了「注册时短信却发不出来」的死结。
:::

### 防封号的关键：固定 IP

注册完成后，有一条长期原则：让你的账号始终从同一个 IP 登录。

这条对谷歌账号和 Claude 账号同样适用。自建 VPS 的 IP 是固定的，天然满足这个条件；而机场节点经常变动 IP，这是它不适合 Claude 的另一个原因。账号长期只在一个干净、固定的 IP 上活动，被风控的概率会大幅降低。

到这里，你已经可以用谷歌账号登录 [claude.ai](https://claude.ai) 正常使用免费版了。

## 第三步：解决订阅支付问题

Claude 的付费订阅分三档：

| 档位 | 价格 | 适合谁 |
|------|------|--------|
| Pro | $20/月 | 绝大多数人的甜点位。可以正常使用 Claude Code，在电脑、VPS 或手机上写代码，额度对普通人来说基本用不完 |
| Max 5x | $100/月 | 重度编程需求 |
| Max 20x | $200/月 | 专业级、全天候使用 |

我的建议是先从 $20 开始。你大概率用不完它的额度；真到了额度不够的那天，再升级也不迟。

### 主推方案：iPhone + 美区礼品卡（适合 $20 档）⭐

这是我试下来最稳、最不折腾的方案，也是绝大多数人在用的。你需要准备三样东西：

1. 一部 iPhone
2. 一个美区 Apple ID —— 参考流程：[linux.do 教程帖](https://linux.do/t/topic/2021625)
3. 一张招商银行全币种国际信用卡 —— 参考流程：[YouTube 视频教程](https://www.youtube.com/watch?v=VMoS1BG6NFI)

流程概括：办好信用卡 → 注册美区 Apple ID → 用信用卡购买美区 App Store 礼品卡充值 → 在 iPhone 的 Claude App 内完成订阅。

几点说明：

- 为什么自己注册 Apple ID，而不是去闲鱼买现成的？网上确实有直接卖账号和代充的，但从稳定性和安全性来说，我强烈建议自己操作。而且美区 Apple ID 用途很广（比如下载小火箭），一次注册终身受用
- 为什么建议办全币种信用卡？不只是为了这一次订阅——以后出国旅游、订阅其他海外服务都用得上。办卡可能需要预约去银行网点，但只要有正常工作，基本都能办下来
- 苹果税的细节：$20 的 Pro 订阅通过 App Store 支付没有额外加价；但 $100 的 Max 档会被额外收取约 $20 的苹果税。所以苹果内购最适合只用 $20 方案的用户

能完整走到这一步，你已经能在终端里随时跑 Claude Code 了。剩下的就是用它干活。

### 进阶方案：N26 虚拟卡（适合 $100 以上档位）

如果你需要订阅 $100/$200 的 Max 档，为了绕开苹果税，更划算的方式是在网页端直接绑卡支付。社区里目前比较成熟的是 N26（一家欧洲数字银行）方案：

参考帖：[nodeseek.com/post-667079-1](https://www.nodeseek.com/post-667079-1)

需要准备的链路：

- N26 账户：完成开通和实名认证，App 内可以看到虚拟卡（卡号 + 有效期 + CVV）
- 众安银行（ZA Bank）：香港的虚拟银行，港元账户，作为整条入金链路的起点
- Wise 账户：负责港币换欧元的中转，缺了它没法低损耗入金
- 稳定的美国节点：操作全程不能断网、不能切换节点，这点我吃过亏，单独提醒

这条链路明显比礼品卡方案复杂，适合已经有一定折腾经验、且确实需要高档位订阅的用户。

### 终极方案：出国

人在海外，一切问题自动消失。😄

## 稳定使用 Claude Code 的注意事项

订阅完成后，最后汇总一下长期稳定使用的几条经验：

1. 终端使用 Claude Code 前，确认 TUN 模式已开启——这是"网页能用、终端连不上"问题的标准答案
2. 固定 IP 登录，不要频繁切换节点，尤其不要在多个国家的节点之间跳来跳去
3. 不要和别人共享账号，多地登录是封号高危行为
4. 遇到网络相关问题先搜 [Nodeseek](https://www.nodeseek.com/)，订阅支付相关问题先搜 [Linux.do](https://linux.do/)

## 资源汇总

| 类别 | 资源 |
|------|------|
| VPS 拼车 | [Nodeseek 拼车版块](https://www.nodeseek.com/categories/carpool) |
| VPS 厂商 | [DMIT（"大妈"）](https://www.dmit.io/) |
| 一键搭建脚本 | [233boy sing-box 脚本](https://233boy.com/sing-box/sing-box-script/) |
| 桌面代理客户端 | [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev) |
| Clash 分流规则 | [Loyalsoldier/clash-rules](https://github.com/Loyalsoldier/clash-rules) · [Shadowrocket-ADBlock-Rules-Forever](https://github.com/Johnshall/Shadowrocket-ADBlock-Rules-Forever) |
| 美区 Apple ID 注册 | [linux.do 教程帖](https://linux.do/t/topic/2021625) |
| 招行全币种信用卡 | [YouTube 视频教程](https://www.youtube.com/watch?v=VMoS1BG6NFI) |
| N26 方案（高档位订阅） | [Nodeseek 参考帖](https://www.nodeseek.com/post-667079-1) |
| 网络问题社区 | [Nodeseek](https://www.nodeseek.com/) |
| 订阅问题社区 | [Linux.do](https://linux.do/) |

## 结语

回头看，整件事就是三步：网络 → 账号 → 支付。每一步都有现成的路可以走，每一步遇到问题都有社区可以搜。

这篇给的只是一条参考路线，不是唯一答案。比起照抄，我更希望你顺手练会的是那个循环：遇到问题，找对社区，搜索，解决。网络问题解决的那一刻起，Google、YouTube、维基百科、GitHub 都向你敞开了，剩下的你完全可以自己探索。
