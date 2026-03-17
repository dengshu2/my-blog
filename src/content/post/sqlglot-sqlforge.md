---
title: "半小时上线一个 SQL 转换工具"
publishDate: "2026-03-17"
description: "发现了 sqlglot 这个宝藏项目，顺手用它搭了一个在线 SQL 格式化和方言转换工具 SQLForge，从动手到上线只花了半小时"
tags: ["sqlglot", "sql", "data-engineering"]
---

周二摸鱼时间，群友安利了一个 Python 项目叫 [sqlglot](https://github.com/tobymao/sqlglot)，看完 README 之后忍不住感叹：这玩意儿早该发现了。

## sqlglot 是什么

一句话：**纯 Python 实现的 SQL 解析器和转译器**。

做数据的人都知道，SQL 这东西各家方言多到离谱。同一个日期函数，在 Hive 里叫 `date_format`，到了 DuckDB 变成 `strftime`，PostgreSQL 又是 `to_char`。每次做架构迁移或者跨引擎查询，光是改 SQL 就能改到怀疑人生。

sqlglot 就是来解决这个问题的。它目前支持 **31+ 种 SQL 方言**的互相转换，GitHub 上 7k+ stars，且被不少知名项目采用：

- [Apache Superset](https://github.com/apache/superset) — 数据可视化平台
- [Dagster](https://github.com/dagster-io/dagster) — 数据编排框架
- [DataHub](https://github.com/datahub-project/datahub) — 数据治理平台（用 sqlglot 做数据血缘解析）
- [SQLMesh](https://github.com/TobikoData/sqlmesh) — 数据转换框架

## 核心能力

sqlglot 不只是个格式化工具，它的能力远比想象中丰富：

**方言转译（Transpile）**：这是最核心的能力。比如把 DuckDB 的时间函数转成 Hive：

```python
import sqlglot

sqlglot.transpile("SELECT EPOCH_MS(1618088028295)", read="duckdb", write="hive")[0]
# 输出: 'SELECT FROM_UNIXTIME(1618088028295 / POW(10, 3))'
```

实际场景里，团队做架构迁移（Hive → Spark、Hive → ClickHouse 等），用这个可以批量转换存量 SQL，省下大量人工改写的时间。

**数据血缘（Lineage）**：能追踪列级别的数据来源，DataHub 的 SQL 血缘解析模块底层用的就是 sqlglot。对于需要做数据治理的团队来说，这个能力相当实用。

**SQL 优化（Optimize）**：常量折叠、谓词下推、星号展开等常见优化都支持。

**AST 解析**：可以把 SQL 解析成抽象语法树，方便程序化地分析和修改 SQL 结构。

## 半小时搭了个在线工具

看完 sqlglot 的文档之后手痒，想着干脆做个在线版本，方便日常使用。于是花了半小时，用 FastAPI + sqlglot 做后端，Vite + TypeScript + CodeMirror 6 做前端，丢进 Docker 一把部署。

上线地址：[sqlforge.dengshu.ovh](https://sqlforge.dengshu.ovh/)

![SQLForge 网站效果](https://img.runningotter.com/2026/03/f7930e2928dd47f50c881ab500086166.png)

功能包括：

- **格式化** — 把乱七八糟的 SQL 整理成可读的格式
- **方言转换** — 支持 31+ 种方言互转（MySQL ↔ PostgreSQL ↔ Spark ↔ BigQuery ↔ ClickHouse...）
- **SQL 优化** — 应用查询优化规则
- **AST 查看** — 查看 SQL 的抽象语法树
- **Diff 对比** — 语义级别的 SQL 差异比较
- **血缘分析** — 列级别的数据来源追踪

技术架构很简单，单容器部署，FastAPI 同时托管 API 和前端静态文件，反向代理指过去就行。

## 参考资源

- [sqlglot GitHub](https://github.com/tobymao/sqlglot)
- [sqlglot 官方文档](https://sqlglot.com/)
- [SQLForge 在线工具](https://sqlforge.dengshu.ovh/)
- [SQLForge 源码](https://github.com/dengshu2/sqlforge)
