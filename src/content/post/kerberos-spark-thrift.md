---
title: "从零理解 Kerberos + Spark Thrift Server"
publishDate: "2026-03-27"
description: "用通行证类比拆解 Kerberos 的核心概念，搞清楚 principal、keytab、kinit 到底是什么，以及从集群外部 Python 客户端连接 Spark Thrift Server 时认证参数为什么比集群内多那么多"
tags: ["kerberos", "spark", "data-engineering"]
---

## Kerberos 是什么

**Kerberos 是一套"通行证"系统**，解决的核心问题是：在公司内网里，怎么证明"我是我"？

类比一下：

> 你去公司大楼，保安不认识你，但你有**工牌**（keytab）。保安（KDC）核验工牌后，给你一张**临时通行证**（ticket）。之后进任何门（访问任何服务），刷通行证就行，不用每次都找保安。

---

## 核心概念逐个拆解

### KDC（Key Distribution Center）

Kerberos 的"保安中心"，负责颁发 ticket。通常由集群管理员维护，你不需要直接操作它。

### principal — 身份 ID

**principal 是 Kerberos 里的通用词，表示任何需要身份认证的对象**，不管是人还是服务，统一都叫 principal。就像"身份证"这个词，张三有身份证，银行也有营业执照，都是"身份证明"，叫法一样但持有者不同。

格式上有一个规律，看有没有 `/`：

```
data_dev_user01@CORP.LOCAL
──────────────────────────
没有 / → 普通用户账号


spark/spark-thrift.cluster-net@CORP.LOCAL
─────────────────────────────────────────
有 / → 服务账号（服务名/主机名）
```

`@` 后面的部分叫 **Realm**，相当于公司的域，类比邮箱地址：

```
data_dev_user01 @ CORP.LOCAL
───────────────   ──────────
  账号名称          公司的域
```

### keytab 文件 — 密钥卡

包含加密后的密码，用于自动向 KDC 换取 ticket，不需要每次手动输密码。**由管理员在 KDC 上生成后交给你**，你自己无法生成。

### krb5.conf — 导航地图

告诉客户端 KDC 在哪个地址、Realm 叫什么名字。集群内部节点上已经统一配好，放在 `/etc/krb5.conf`。

### kinit — 打卡动作

用 keytab + principal 向 KDC 换取 ticket 的命令：

```bash
kinit -kt /path/to/your.keytab data_dev_user01@CORP.LOCAL
klist  # 查看 ticket 是否有效、是否过期
```

---

## Spark Thrift Server 是什么

**Thrift Server 是一个 SQL 入口**，让你可以用普通的 Python 客户端连进来执行 Spark SQL，不需要自己写 Spark 代码。Thrift 是 Apache 的一个 RPC 框架，Spark 用它包了一层 HiveServer2 兼容服务。

```
你的 Python 代码
      ↓  （PyHive / JDBC）
Spark Thrift Server（接收 SQL）
      ↓
YARN 集群（执行 Spark 任务）
      ↓
返回结果
```

---

## 认证分两段，不要搞混

连接 Thrift Server 时，Kerberos 认证分两段：

```
Python 客户端  →  [认证①]  →  Thrift Server  →  [认证②]  →  YARN/HDFS
```

**认证②**（Server → 后端）：Thrift Server 启动时用自己的 keytab 向 YARN 认证，与客户端无关，在启动命令里配置：

```bash
./sbin/start-thriftserver.sh \
  --principal spark/spark-thrift.cluster-net@CORP.LOCAL \
  --keytab /etc/security/keytabs/spark.keytab
```

**认证①**（Client → Server）：你的 Python 服务连进来时需要做的认证，**这才是你写代码时需要关心的部分**。

---

## 为什么集群内和集群外参数不一样

### 集群内（Spark Shell）只需要两个参数

```bash
KT_PATH=/path/to/keytabs
KT_NAME=data_dev_user01@CORP.LOCAL
```

在集群节点上运行，环境天然互信：`/etc/krb5.conf` 已经统一配好，YARN/HDFS 的配置文件里也内置了所有 Realm 信息。只需要告诉 Spark "用哪个 keytab、以哪个身份运行"就够了。

### 集群外（Python 服务）需要五个参数

```dotenv
KRB5_CONF=/etc/kerberos/krb5.conf
KRB5_REALM=CORP.LOCAL
SPARK_PRINCIPAL=spark/spark-thrift.cluster-net@CORP.LOCAL
SPARK_KEYTAB=/path/to/your.keytab
HIVE_AUTH=KERBEROS
```

从外部连进来，环境一无所知，需要一一告知。每个参数的作用：

| 参数 | 作用 |
|---|---|
| `KRB5_CONF` | 手动指定 krb5.conf 路径，告诉客户端 KDC 在哪 |
| `KRB5_REALM` | 明确 Realm，避免多域歧义 |
| `SPARK_PRINCIPAL` | Thrift Server 的身份，用于验证"我连的服务是合法的" |
| `SPARK_KEYTAB` | 客户端自己的 keytab，用于 kinit 自动换取 ticket |
| `HIVE_AUTH` | 告诉连接库启用 KERBEROS（GSSAPI）握手 |

简单说：**集群内是"家里人"，环境天然互信；集群外是"外来客"，每一步都要自证身份、验证对方。**

---

## 这些文件和参数从哪里来

| 参数 | 怎么来 |
|---|---|
| keytab 文件 | 找管理员要，自己无法生成 |
| krb5.conf | 从集群节点 `scp /etc/krb5.conf` 过来 |
| `KRB5_REALM` | 从 krb5.conf 里的 `default_realm` 字段抄 |
| `SPARK_PRINCIPAL` | 让管理员在 Thrift Server 节点执行 `ps aux \| grep thrift`，输出里的 `--principal` 那一串就是 |
| `HIVE_AUTH` | 固定填 `KERBEROS`，自己写 |

:::note
`ps aux` 里看到的是 Thrift Server 自己的 principal（服务账号），和你自己的 `KT_NAME`（用户账号）是两回事。类比打电话给银行客服：你的身份证号是你，客服工号是对方，两个都是"身份"，但一个是你，一个是服务。
:::

```
KT_NAME=data_dev_user01@CORP.LOCAL          → 你自己的身份（用户）
SPARK_PRINCIPAL=spark/spark-thrift...        → Thrift Server 的身份（服务）
```

---

## Python 客户端怎么写

运行前先确保本机有有效 ticket：

```bash
kinit -kt $SPARK_KEYTAB data_dev_user01@CORP.LOCAL
klist  # 确认 ticket 存在且未过期
```

连接代码：

```python
from pyhive import hive
import os

conn = hive.connect(
    host='spark-thrift.cluster-net',
    port=10000,
    auth=os.getenv('HIVE_AUTH'),              # 'KERBEROS'
    kerberos_service_name='spark'             # SPARK_PRINCIPAL 的第一段（/ 前面的部分）
)
```

:::important
`kerberos_service_name` 要填 `SPARK_PRINCIPAL` 里 `/` 前面的那一段。如果 principal 是 `spark/spark-thrift.cluster-net@CORP.LOCAL`，那就填 `spark`。填错了连接会直接报认证失败，错误信息还特别隐晦，排查起来很浪费时间。
:::

---

## 一句话总结

Kerberos 是公司内网的通行证系统。keytab 是你的工牌，kinit 是打卡，ticket 是临时通行证，principal 是工号（用户和服务都有）。集群内部参数少因为环境互信，外部连接参数多因为一切都要从零说清楚。

---

## 参考资料

- [MIT Kerberos 官方文档](https://web.mit.edu/kerberos/)
- [Spark Thrift Server 配置指南](https://spark.apache.org/docs/latest/sql-distributed-sql-engine.html)
- [PyHive GitHub](https://github.com/dropbox/PyHive)
