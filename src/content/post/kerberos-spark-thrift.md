---
title: "搞懂 Kerberos，以及为什么别再用 Spark Thrift Server"
publishDate: "2026-03-27"
description: "用通行证类比快速讲清 Kerberos 的几个核心概念，再说说 Spark Thrift Server 那套两段认证为什么已经落后，以及新项目为什么更该用 Spark 3.4 的 Spark Connect。"
tags: ["kerberos", "spark", "data-engineering"]
---

## Kerberos 是什么

Kerberos 是一套"通行证"系统，解决的核心问题是：在公司内网里，怎么证明"我是我"？

类比一下：

> 你去公司大楼，保安不认识你，但你有工牌（keytab）。保安（KDC）核验工牌后，给你一张临时通行证（ticket）。之后进任何门（访问任何服务），刷通行证就行，不用每次都找保安。

## 几个核心概念

把上面的类比对应到术语，记住这几个就够用了：

- KDC（Key Distribution Center）：Kerberos 的"保安中心"，负责颁发 ticket。集群管理员维护，你不用直接碰它。
- principal：身份 ID，人和服务都用它表示。看有没有 `/` 来区分——`data_dev_user01@CORP.LOCAL` 没有 `/`，是普通用户账号；`spark/spark-thrift.cluster-net@CORP.LOCAL` 有 `/`，是服务账号（格式是「服务名/主机名」）。`@` 后面的 `CORP.LOCAL` 叫 Realm，相当于公司的域。
- keytab：你的"密钥卡"，里面是加密后的密码，用来自动向 KDC 换 ticket，不用每次手输。由管理员在 KDC 上生成给你，自己造不出来。
- krb5.conf：一张"导航地图"，告诉客户端 KDC 在哪、Realm 叫什么。集群节点上一般已配好，放在 `/etc/krb5.conf`。
- kinit：一个"打卡动作"，用 keytab + principal 向 KDC 换 ticket：

```bash
kinit -kt /path/to/your.keytab data_dev_user01@CORP.LOCAL
klist  # 查看 ticket 是否有效、是否过期
```

一句话串起来：keytab 是工牌，kinit 是打卡，ticket 是临时通行证，principal 是工号（用户和服务都有），KDC 是发证的保安中心。Kerberos 的概念其实就这么点，剩下的复杂度基本都来自你拿它去接什么服务。

## Spark Thrift Server：已经落后了

Spark Thrift Server 是一个 SQL 入口，让你用普通的 Python 客户端（PyHive / JDBC）连进来跑 Spark SQL，不用自己写 Spark 代码。它在很长一段时间里是「让外部程序查 Spark」的标准做法，但放到今天，我不会再建议新项目用它。

它的模型是「一个常驻、大家共用的 Spark 应用」：所有 SQL 都挤在同一个 driver 上，资源是开服时定下的那一坨，人多了互相抢、闲下来也缩不回去。

更折磨人的是认证。从集群外部连进来，Kerberos 要走两段——客户端先向 Thrift Server 证明身份，Thrift Server 再向 YARN / HDFS 证明身份。于是外部客户端要交代的参数一大把（krb5.conf、Realm、principal、keytab、auth 方式……），其中 principal 里的主机名还得和 KDC 注册的一字不差，错一个字母就报 `Server not found in Kerberos database`，排查起来特别费时间。

我以前认真研究过怎么把这套参数一个个配通，但现在回头看，没必要再把这些步骤铺开写了——那只会教会你一套正在过时的东西。如果你是新搭，直接看下面的 Spark Connect。

## 更推荐的方案：Spark Connect（Spark 3.4 起）

如果是新项目、而且 Spark 能上到 3.4 以上，更值得用的是 Spark Connect。

它换了个思路：客户端和 driver 彻底解耦。客户端只是很薄的一层，用 DataFrame API 通过 gRPC 把逻辑计划发给远端的 Connect Server，真正的计算在服务端跑。好处有几个：

- 客户端轻。本地不用再塞一整个 Spark / JVM，Python 直接 `pip install "pyspark[connect]"` 连过去就行，和服务端的版本也能解耦。
- 隔离性好。一个客户端跑挂了，不会把整个共享服务带崩，这点比 Thrift Server 那种共用 driver 安心很多。
- 多语言。同一个服务，Python、Scala 等不同语言的客户端都能连。

而最值得说的弹性扩容，是它和云原生部署搭在一起的甜点：配合 Spark 的动态资源分配（dynamic allocation），executor 数量能按负载自动涨落——忙的时候自动扩出来，闲下来自动回收，不用像 Thrift Server 那样长期占着一坨固定资源。跑在 K8s 或各家托管 / Serverless Spark 上，这种弹性体验更明显，成本也更可控。

当然它也有代价：Spark Connect 在 3.4 还算新，部分 API 和第三方生态的兼容性得自己先验一遍；已经在跑的 Thrift Server 链路短期内也不必急着拆。但新项目、又能用上较新的 Spark，我会直接往 Spark Connect 走。

## 一句话总结

Kerberos 是公司内网的通行证系统：keytab 是工牌，kinit 是打卡，ticket 是临时通行证，principal 是工号，KDC 是保安中心。至于怎么让外部程序接进来，Spark Thrift Server 那套常驻共用 + 两段 Kerberos 认证已经落后，新项目直接上 Spark 3.4 的 Spark Connect——客户端更轻、隔离更好，还能配合动态资源分配做弹性扩容。

## 参考资料

- [MIT Kerberos 官方文档](https://web.mit.edu/kerberos/)
- [Spark Connect 官方文档](https://spark.apache.org/docs/latest/spark-connect-overview.html)
