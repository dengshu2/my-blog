---
title: "从零开始：订阅 Claude 会员并稳定使用 Claude Code 的完整指南"
publishDate: "2026-06-12"
updatedDate: "2026-11-06"
description: "面向完全小白的保姆级教程：从网络环境、谷歌账号到订阅支付，三步解决国内使用 Claude 和 Claude Code 的所有问题，附完整资源链接。"
tags: ["claude", "claude-code", "ai", "教程", "网络"]
---

> 这篇文章只解决一件事：让一个“完全没有经验”的人，从零开始，最终能在国内稳定地订阅和使用 Claude（包括 Claude Code）。这里存在着一个鸡生蛋和蛋生鸡的问题。第一步要靠你自己解决了。

:::note
本文所有内容仅供学习交流，请在遵守当地法律法规的前提下使用相关技术。本文初稿写于 2026 年 6 月，近期结合最新的代理分流实践进行了修订。文中提到的价格、链接和方案可能随时间变化。
:::

:::warning
**动手前必看的几点劝告：**

![Claude 风控现状：刚点进去，它就一脸坏笑戏谑地盯着你……“你是中国人吗？”](../../assets/posts/claude-subscription-guide/claude-are-you-chinese-meme.jpg)

1. **Claude 风控极其严格**：Anthropic 对节点纯净度和账号环境要求极高，封号是家常便饭。如果你平时不爱折腾网络或排错，**强烈建议直接劝退**，避免浪费时间和金钱。
2. **护照与身份认证（KYC）**：近期部分账号可能触发身份核验。如果需要用护照认证，**手机端认证时务必开启全局代理**，且确保处于干净的节点环境下，否则极易被直接拒之门外。
3. **永远留一个备用方案**：自建节点和网络环境可能随时受波动影响，多在 Nodeseek、Linux.do 等论坛逛逛吸取经验。“永远备着另一套可用方案”，才是维持网络稳定的唯一真理。
4. **遇到问题多问 AI**：搭建或配置报错别死磕，把错误日志丢给 AI。国内的 DeepSeek（大肥鱼）代码与排错能力已经很强，大部分环境和配置问题它都能帮你快速解决。
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

网络问题的**核心其实是一个稳定、干净的 IP**。

在考虑具体方案前，先分清两个概念：

- **线路机**：负责过墙和高速中转，核心是低延迟、大带宽、网络稳定（如机场节点、优质优化线路 VPS）。
- **落地机**：负责最终向 Claude 发起请求，核心是 **IP 纯净、固定独享**，避免触发风控。

目前通用的几种路线：

### 方案对比

| | 纯机场 | 自己买 VPS 搭建（方案 B） | 机场 + 落地机（方案 C） |
|---|---|---|---|
| 上手难度 | ⭐ 极低 | ⭐⭐⭐ 需要动手 | ⭐⭐ 中等 |
| 成本 | 约 10~30 元/月 | 几十元到 350 元/年 | 机场费用 + 约 50~100 元/年 |
| IP 质量 | ❌ 多人共用，易被滥用 | ✅ 独享，干净 | ✅ 独享，干净 |
| 适合 Claude？ | 不推荐 | 推荐 | 推荐 |

纯机场的问题在于 IP 共用。绝大多数机场都是几十上百人共用同一批出口 IP，注册 Google 账号容易触发风控，使用 Claude 也存在因 IP 被滥用而封号的风险。因此不推荐直接拿纯机场节点上 Claude。

更推荐的路线有以下三种：

### 方案 A：和别人拼车一个 VPS（约 100 元/年）

类似于"拼单"——几个人共同分摊一台服务器的费用。

- 成本：一年 100 元以内
- 流量：每月约 200GB，日常使用完全够用
- 关键词：认准"美西"（美国西部）节点
- 去哪找：Nodeseek 的拼车版块 👉 [nodeseek.com/categories/carpool](https://www.nodeseek.com/categories/carpool)，搜索关键词"大妈 CORONA"（即 DMIT 的 CORONA 系列套餐，拼车里的热门型号）

### 方案 B：自己买 VPS 搭建（可单机直连，也可自建中转 + 落地）⭐ 推荐

完全独享、自由度最高的自建方案。具体又可以按成本和动手能力分层次玩：

1. **基础玩法（单机直连，丰俭由人）**：
   - **不必非买昂贵的线路机**：首先自己可以先买一台便宜的 VPS 用着，不一定非要买死贵的高端优化线路。只要基于自己本地的宽带与运营商（电信、联通、移动）实测丢包不严重、网络合适，很多普通机器就能胜任，这样不选高端线路机的**成本还可以再大幅降低**（几十元到一百多元一年）；
   - **预算充裕或追求省心再上高端机**：如果不想花时间反复测试宽带匹配，推荐选择行业人称"大妈"的 DMIT（[dmit.io](https://www.dmit.io/)）美西优化线路套餐（年付约 350 元，每月 2TB 流量），线路和落地一步到位；
   - **搭建方法**：Debian VPS 上直接使用 233boy 的 sing-box 脚本 👉 [233boy.com/sing-box/sing-box-script](https://233boy.com/sing-box/sing-box-script/)，真正一行命令搞定。本站之前写过篇 [VPS 初始化配置指南](/posts/vps/) 可供参考；
   - **选购参考**：除了在 Nodeseek 等论坛多看真实评价外，关于 VPS 选购还可以参考这两个实用网站：
     - [MeowVPS](https://meowvps.com/)：海外 VPS 选购指南与优惠汇总；
     - [VPStarter 商家 IP 质量汇总](https://vpstarter.com/ip-quality/)：直接对主流常见 VPS 商家的 IP 质量与纯净度做了系统汇总，选落地机前可以先对照排雷。

2. **自建进阶玩法（自建中转 + 落地机）**：
   - 如果你手里有一台网络连接极佳的线路机（如国内优化机或低延迟近海 VPS），但它的 IP 不适合直接访问 Claude；同时手里还有一台极其便宜但 IP 纯净的海外落地 VPS；
   - 可以在线路机上自建中转服务（通过 Realm、Gost 或 sing-box 端口转发），在服务端直接把流量高速中转到海外落地机。客户端只需连接线路机入口，在服务端完成高速中转与纯净出口。

### 方案 C：机场 + 便宜落地 VPS（走客户端链式代理）

如果你手头已经有现成的商业机场，不需要自己买机器折腾服务端中转，这是最省心的高性价比路线：

- 纯机场节点通常几十上百人共用 IP，容易触发 Claude 风控；
- 但你可以买一台极其便宜的美西 VPS（如年付几美元的小机器）当作专属落地机；
- 在 Clash 等客户端中直接配置 `relay`（链式代理）策略组：让流量先走机场的高速节点过墙（借机场作为前置线路机），最后从便宜 VPS 落地出口；
- 这样既享受了机场的稳定加速，又获得了独享干净的固定 IP。

:::note
**关于网上常提的「落地家宽」：**
网上不少攻略把家庭宽带（家宽 / Residential IP）的作用传得很神。实事求是地说，如果有预算、不差钱的话确实值得尝试，日常遇到 Cloudflare 盾时不用频繁手动点人机验证，体验还是相当舒服的；但 IP 也只是整个风控里的一个因素而已，不用过度迷信。

更建议大家**一步一步来，不用想着一次性砸钱到位**：
1. **先试单机**（选适合自己宽带的便宜 VPS 或高端优化机，满足日常稳定使用就先不折腾）；
2. 感觉有风控顾虑或想兼顾日常大流量，再试**自建中转+落地**（方案 B 进阶）或**机场+落地链式代理**（方案 C）；
3. 预算充裕、追求更无感体验时，最后再考虑进阶到**线路机 + 落地家宽**。
:::

### 客户端软件：电脑用 Clash Verge Rev，iPhone 用小火箭

代理服务器搭好后，你需要在自己的设备上装客户端软件连接它。市面上软件五花八门，就我的体验来说，这两款就够了：

- 桌面端（Mac / Windows / Linux）：[Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev)，开源免费
- iOS / iPhone：Shadowrocket（小火箭），需要美区 Apple ID 购买（约 $2.99，这也是后面要注册美区 Apple ID 的原因之一）

:::tip
如果你在 iPhone 上用小火箭，分流规则完全没必要从头手写——直接把本文后面的 Clash 配置丢给 AI（如 DeepSeek），让它基于此生成一套小火箭适用的规则文件即可。另外在小火箭设置里**同样必须注意防范 DNS 泄露**（建议开启远端 DNS 解析并关闭 IPv6）。
:::

### 关键设置：开启 TUN 模式

这是很多人卡住的地方，单独拎出来说。

默认情况下，代理客户端只接管浏览器流量。但 Claude Code 是跑在终端里的命令行程序，它不会自动走代理——结果就是浏览器能打开 claude.ai，但终端里的 Claude Code 一直连不上网。

解决办法很简单：在 Clash Verge Rev 中开启 TUN 模式。它会创建一张虚拟网卡，接管整个系统的流量。开启后，无论是终端里的 Claude Code，还是 Claude 桌面端，都能正常联网。

### 附：Clash 参考配置

下面是一份精简的 Clash Verge Rev 参考配置。重点处理了三件事：

1. **关闭 IPv6**（`ipv6: false`）：避免双栈网络下因 IPv6 直连或乱跳导致真实地区暴露。
2. **处理 DNS 泄露**（DoH + fake-ip）：使用加密远程 DNS 并屏蔽本地敏感反查，防止 DNS 污染与时区/地域泄露。
3. **Claude 单独节点与分流**：设立专属的 `Claude` 策略组（可直接绑定固定落地 VPS，或使用 `relay` 链式代理），确保访问 Claude 的出口 IP 纯净固定；同时放通 Statsig 通道避免被广告规则误杀。

你只需要把 `proxies` 和 `proxy-groups` 换成你自己的节点信息即可。看不懂没关系——把整份配置丢给 AI，告诉它你的节点信息，让它帮你改。

<details class="my-4 rounded-lg border border-accent/20 bg-accent/5 p-4">
<summary class="cursor-pointer font-semibold text-accent hover:underline">
👉 点击展开查看完整 Clash Verge Rev 参考配置（含分流规则与 DNS 优化）
</summary>

```yaml
mixed-port: 7897
allow-lan: false
unified-delay: true
mode: rule
log-level: info
ipv6: false # 关闭 IPv6，防止泄漏
external-controller: 127.0.0.1:9090

profile:
  tracing: true

sniffer:
  enable: true
  parse-pure-ip: true
  sniff:
    HTTP:
      ports: [80, 8080-8880]
      override-destination: true
    TLS:
      ports: [443, 8443]
    QUIC:
      ports: [443, 8443]
  skip-domain:
    - "+.push.apple.com"

dns:
  enable: true
  listen: 127.0.0.1:1053
  ipv6: false # DNS 同样禁用 IPv6 解析
  prefer-h3: false
  respect-rules: true
  use-system-hosts: false
  cache-algorithm: arc
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  fake-ip-filter:
    - "+.lan"
    - "+.local"
    - "localhost"
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
    - 119.29.29.29
  nameserver:
    - https://8.8.8.8/dns-query
    - https://1.1.1.1/dns-query
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
  - name: "日常节点"
    type: ss # 根据你的实际节点类型修改（如 vless / vmess / trojan 等）
    # server: xxx.xxx.xxx.xxx
    # port: 443

  - name: "Claude 落地节点"
    type: ss
    # 你的纯净/固定 IP 落地 VPS 节点信息

proxy-groups:
  - name: PROXY
    type: select
    proxies:
      - "日常节点"

  # Claude 专用分组：绑定固定、干净的落地 IP，与日常上网隔离
  - name: Claude
    type: select
    proxies:
      - "Claude 落地节点"
      # 若使用「机场 + 落地」链式代理，也可直接填入下方的 relay 组名：
      # - "Claude 链式代理"

  # 可选：链式代理示例（机场节点作为前置中转，自建落地作为最终出口）
  # - name: "Claude 链式代理"
  #   type: relay
  #   proxies:
  #     - "日常节点"       # 线路机（过墙中转）
  #     - "Claude 落地节点" # 落地机（固定纯净 IP）

rule-providers:
  reject:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt"
    path: ./ruleset/reject.yaml
    proxy: PROXY
    interval: 86400

  icloud:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt"
    path: ./ruleset/icloud.yaml
    proxy: PROXY
    interval: 86400

  apple:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt"
    path: ./ruleset/apple.yaml
    proxy: PROXY
    interval: 86400

  google:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt"
    path: ./ruleset/google.yaml
    proxy: PROXY
    interval: 86400

  proxy:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt"
    path: ./ruleset/proxy.yaml
    proxy: PROXY
    interval: 86400

  direct:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt"
    path: ./ruleset/direct.yaml
    proxy: PROXY
    interval: 86400

  private:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt"
    path: ./ruleset/private.yaml
    proxy: PROXY
    interval: 86400

  telegramcidr:
    type: http
    behavior: ipcidr
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt"
    path: ./ruleset/telegramcidr.yaml
    proxy: PROXY
    interval: 86400

  cncidr:
    type: http
    behavior: ipcidr
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt"
    path: ./ruleset/cncidr.yaml
    proxy: PROXY
    interval: 86400

  lancidr:
    type: http
    behavior: ipcidr
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt"
    path: ./ruleset/lancidr.yaml
    proxy: PROXY
    interval: 86400

  applications:
    type: http
    behavior: classical
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt"
    path: ./ruleset/applications.yaml
    proxy: PROXY
    interval: 86400

  anthropic:
    type: http
    behavior: classical
    format: yaml
    url: "https://raw.githubusercontent.com/SkywalkerJi/Clash-Rules/refs/heads/master/AI/Anthropic.yaml"
    path: ./Anthropic.yaml
    proxy: PROXY
    interval: 86400
    size-limit: 0

rules:
  # ==== 关键：Claude 与 Statsig 流量走单独的 Claude 分组 ====
  # featuregates 和 api.statsigcdn 必须在 reject 之前放通，防止被广告规则集误杀
  - DOMAIN-SUFFIX,featuregates.org,Claude
  - DOMAIN-SUFFIX,api.statsigcdn.com,Claude
  - RULE-SET,anthropic,Claude

  # 本地与局域网直连
  - DOMAIN,localhost,DIRECT
  - IP-CIDR,127.0.0.0/8,DIRECT,no-resolve
  - RULE-SET,private,DIRECT
  - RULE-SET,lancidr,DIRECT,no-resolve
  - DOMAIN,clash.razord.top,DIRECT
  - DOMAIN,yacd.haishan.me,DIRECT

  # 常用应用直连
  - RULE-SET,applications,DIRECT

  # 广告拦截（放在放通规则之后）
  - RULE-SET,reject,REJECT

  # 常用服务分流
  - RULE-SET,icloud,DIRECT
  - RULE-SET,apple,DIRECT
  - RULE-SET,google,PROXY
  - RULE-SET,proxy,PROXY
  - RULE-SET,direct,DIRECT
  - RULE-SET,telegramcidr,PROXY,no-resolve
  - RULE-SET,cncidr,DIRECT,no-resolve
  - GEOIP,LAN,DIRECT,no-resolve
  - GEOIP,CN,DIRECT,no-resolve

  # 兜底日常代理
  - MATCH,PROXY
```

</details>

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

到这里，你已经可以用谷歌账号登录 [claude.ai](https://claude.ai) 正常使用免费版了。

## 第三步：解决订阅支付问题

Claude 的付费订阅分三档：

| 档位 | 价格 | 适合谁 |
|------|------|--------|
| Pro | $20/月 | 绝大多数人的甜点位。可以正常使用 Claude Code，在电脑、VPS 或手机上写代码，额度对普通人来说基本用不完 |
| Max 5x | $100/月 | 重度编程需求 |
| Max 20x | $200/月 | 专业级、全天候使用 |

我的建议是先从 $20 开始。你大概率用不完它的额度；真到了额度不够的那天，再升级也不迟。

:::note
**关于办「美卡」订阅：**
网上经常有人提到通过各种途径办美国本土信用卡（美卡）去网页端直接绑卡订阅。但对于绝大多数普通人来说，办美卡的门槛和后续维护成本实在过于高昂（ITIN、美国真实地址、养卡等）。为了订阅一个 Claude 去大费周章做这件事投入产出比极低，很不划得来，个人非常不建议去折腾这条路线。
:::

目前推荐两条手机订阅路线：iPhone 用户可以用美区礼品卡，Android 用户可以通过 Google Play 绑定国内外币卡支付。按手头的设备选择即可。

### 推荐方案一：iPhone + 美区礼品卡（适合 $20 档）⭐

这是我试下来最稳、最不折腾的方案，也是绝大多数人在用的。你需要准备三样东西：

1. 一部 iPhone
2. 一个美区 Apple ID —— 参考流程：[linux.do 教程帖](https://linux.do/t/topic/2021625)
3. 一张招商银行全币种国际信用卡 —— 参考流程：[YouTube 视频教程](https://www.youtube.com/watch?v=VMoS1BG6NFI)

流程概括：办好信用卡 → 注册美区 Apple ID → 用信用卡购买美区 App Store 礼品卡充值 → 在 iPhone 的 Claude App 内完成订阅。

几点说明：

- 为什么自己注册 Apple ID，而不是去闲鱼买现成的？网上确实有直接卖账号和代充的，但从稳定性和安全性来说，我强烈建议自己操作。而且美区 Apple ID 用途很广（比如下载小火箭），一次注册终身受用
- 为什么建议办全币种信用卡？不只是为了这一次订阅——以后出国旅游、订阅其他海外服务都用得上。办卡可能需要预约去银行网点，但只要有正常工作，基本都能办下来
- 苹果税的细节：$20 的 Pro 订阅通过 App Store 支付没有额外加价；但 $100 的 Max 档会被额外收取约 $20 的苹果税。所以苹果内购最适合只用 $20 方案的用户

### 推荐方案二：Android 手机 + Google Play 订阅 ⭐

如果你用的是 Google 手机（Pixel），或者其他能正常使用 Google Play 的 Android 手机，也可以直接在 Claude App 内订阅。Google Play 可以绑定国内银行发行的外币卡（如支持外币支付的 Visa / Mastercard），省去购买和充值美区礼品卡的步骤。

流程概括：在 Google Play 绑定国内外币卡 → 下载官方 Claude App → 登录你要订阅的 Claude 账号 → 在 App 内选择套餐，通过 Google Play 完成支付。

绑定的是 Google Play 的付款方式，实际能否扣款取决于 Google Play 账号地区、发卡行和卡片的支付权限，以结账页面和实际扣款结果为准。订阅后，续费和取消也在 Google Play 中管理。Claude 官方的 [订阅支付说明](https://support.claude.com/en/articles/8325618-paid-plan-billing-faqs) 也确认了 Android 内购由 Google Play 处理。

能完整走到这一步，你已经能在终端里随时跑 Claude Code 了。剩下的就是用它干活。

### 不再推荐：N26 虚拟卡

旧版文章曾推荐通过 N26 虚拟卡在网页端订阅高档位套餐，现在不再推荐这条路线。目前仅凭中国大陆或中国香港护照，已无法直接完成注册，还需要提供额外的证明材料。具体材料要求以 N26 对开户地区和个人身份的审核为准。

对从零开始的用户来说，这条路线的开户门槛已经变高，建议优先选择上面的手机订阅方式。原来的 [Nodeseek 参考帖](https://www.nodeseek.com/post-667079-1) 仅作为历史资料保留，不再作为当前的操作指南。

### 补充参考视频

如果你更习惯跟着视频操作，可以参考 [这段 YouTube 视频](https://www.youtube.com/watch?v=8lNWd7PvvCU)。核心逻辑和本文一样：先解决网络，再解决账号，最后完成订阅支付；具体界面和支付条件以实际操作时为准。

### 终极方案：出国

人在海外，一切问题自动消失。😄

## 稳定使用 Claude Code 的注意事项

订阅完成后，最后汇总一下长期稳定使用的几条经验：

1. **确认 TUN 模式已开启**：终端使用 Claude Code 前必查——这是"网页能用、终端连不上"问题的标准答案。
2. **固定 IP 登录**：不要频繁切换节点，尤其不要在多个国家的节点之间跳来跳去。
3. **不要和别人共享账号**：多地登录是封号高危行为。
4. **没必要就不用浏览器插件**：安安静静用官方网页或官方应用即可，少装第三方甚至非必要的 Claude 浏览器扩展，减少异常后台请求与指纹风险。
5. **VPS 远程管理建议桌面端远端连接**：如果你需要用 Claude Code 操作 VPS 上的工程，更建议在桌面端配置远端连接（如 VS Code Remote-SSH）本地连过去开发；尽量避免直接 SSH 连进 VPS 内部并在机器终端直接跑 Claude Code，数据中心机房 IP 容易增加不必要的风控风险（纯个人使用体感，能避则避）。
6. **社区求助与搜索**：遇到网络相关问题先搜 [Nodeseek](https://www.nodeseek.com/)，订阅支付相关问题先搜 [Linux.do](https://linux.do/)。

## 资源汇总

| 类别 | 资源 |
|------|------|
| VPS 拼车 | [Nodeseek 拼车版块](https://www.nodeseek.com/categories/carpool) |
| VPS 厂商 | [DMIT（"大妈"）](https://www.dmit.io/) |
| VPS 选购参考 | [MeowVPS](https://meowvps.com/) |
| 商家 IP 质量汇总 | [VPStarter 商家 IP 质量汇总](https://vpstarter.com/ip-quality/) |
| 一键搭建脚本 | [233boy sing-box 脚本](https://233boy.com/sing-box/sing-box-script/) |
| 桌面代理客户端 | [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev) |
| Clash 分流规则 | [Loyalsoldier/clash-rules](https://github.com/Loyalsoldier/clash-rules) · [SkywalkerJi/Clash-Rules (Anthropic)](https://github.com/SkywalkerJi/Clash-Rules) |
| 美区 Apple ID 注册 | [linux.do 教程帖](https://linux.do/t/topic/2021625) |
| 招行全币种信用卡 | [YouTube 视频教程](https://www.youtube.com/watch?v=VMoS1BG6NFI) |
| Google Play 订阅 | [Claude 官方订阅支付说明](https://support.claude.com/en/articles/8325618-paid-plan-billing-faqs) |
| 补充参考视频（核心逻辑相同） | [YouTube 视频](https://www.youtube.com/watch?v=8lNWd7PvvCU) |
| N26 旧方案（不再推荐） | [Nodeseek 历史参考帖](https://www.nodeseek.com/post-667079-1) |
| 网络问题社区 | [Nodeseek](https://www.nodeseek.com/) |
| 订阅问题社区 | [Linux.do](https://linux.do/) |
