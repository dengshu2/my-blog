---
title: "DuckDB FlockMTL 使用指南"
publishDate: "01 August 2025"
description: "本文详细记录了在 macOS 上使用 Ollama 和 DuckDB 构建 LLM 应用的完整指南，并使用一个文本分类的实际案例来展示完整的使用流程"
tags: ["duckdb", "flockmtl", "ollama", "llm"]
---

## 1. 环境准备

### 1.1 安装 DuckDB

前往 DuckDB 官网确认对应版本的安装命令（文末有参考地址），以下以 macOS 为例：

```bash
# 使用 Homebrew 安装（推荐）
brew install duckdb

# 使用 curl 安装
curl https://install.duckdb.org | sh
```

### 1.2 安装 Ollama

前往 Ollama 官网下载对应版本的安装包（支持 macOS 和 Windows），安装完成后选择一个模型使用。以下以 qwen3:0.6b 为例（文末有参考地址）：

```bash
# 使用 ollama 运行模型，会自动下载模型
# 可以使用 /bye 命令退出
ollama run qwen3:0.6b
```

## 2. 使用案例：文本分类

以下通过一个文本分类的实际案例来演示 DuckDB FlockMTL 的使用方法。

### 2.1 启动 DuckDB

确保 Ollama 在后台运行，然后启动 DuckDB UI 模式：

```bash
# 使用 DuckDB UI 模式（推荐，方便执行后续命令）
duckdb -ui
```

### 2.2 配置 FlockMTL 扩展

```sql
-- 安装 FlockMTL 扩展
INSTALL flockmtl FROM community; 

-- 加载扩展
LOAD flockmtl;

-- 创建 Ollama 连接配置
CREATE SECRET (
    TYPE OLLAMA,
    API_URL '127.0.0.1:11434'
);
```

### 2.3 创建模型

> ⚠️ **注意**：以下命令只能在命令行模式执行，在 UI 模式下会报错。

```sql
-- 创建模型配置
CREATE MODEL(
   'QuackingModel',
   'qwen3:0.6b',
   'ollama',
   {"tuple_format": "json", "batch_size": 32, "model_parameters": {"temperature": 0.7}}
);
```

### 2.4 准备测试数据

```sql
-- 创建测试表
CREATE TABLE album_names (
    album_name VARCHAR
);

-- 插入测试数据
INSERT INTO album_names (album_name) VALUES
    ('广州的一天'),
    ('工作的一天'),
    ('周末的一天'),
    ('和家人的一天'),
    ('好朋友的一天');
```

### 2.5 执行文本分类

```sql
-- 使用 FlockMTL 进行文本分类
SELECT
    album_name,
    llm_complete(
        {'model_name': 'QuackingModel'},
        {'prompt': '请将以下相册名称归入"家庭"、"旅行"、"工作"、"朋友"或"风景"这几个类别中。只返回类别名称。相册名：{{album_name}}'},
        {'album_name': album_name}
    ) AS category
FROM
    album_names;
```

## 3. 参考资源

- [Ollama 下载页面](https://ollama.com/download/mac)
- [Qwen3:0.6b 模型](https://ollama.com/library/qwen3:0.6b)
- [DuckDB 安装指南](https://duckdb.org/docs/installation/?version=stable&environment=cli&platform=macos&download_method=direct)
