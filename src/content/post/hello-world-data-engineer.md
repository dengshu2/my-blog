---
title: "Hello World, Data Engineer"
publishDate: "2025-03-07"
description: "在VPS上搭建现代数据工程开发环境，并实现一个简单的数据处理管道，并使用Docker进行容器化部署，并使用Makefile进行自动化任务管理"
tags: ["data-engineer", "python", "duckdb", "polars", "daft"]
---

# Hello World, Data Engineer：渐进式开发现代数据工程环境

在本文中，我将介绍如何使用渐进式开发方法从零开始搭建一套现代数据工程环境，并实现一个简单但完整的数据处理管道。渐进式开发是一种迭代式方法，每完成一个小功能就进行测试和提交，确保每一步都正确无误，为后续复杂功能奠定基础。

## 渐进式开发流程概述

我们将按照以下流程进行开发：

1. 项目初始化：创建目录结构、配置文件和初始化Git仓库
2. 环境配置：设置Docker和依赖管理
3. 基础模块实现：配置模块、日志模块和工具函数
4. 数据生成：实现示例数据生成功能
5. 数据转换：实现各种数据转换和处理功能
6. 管道集成：创建主模块和运行脚本
7. 自动化：使用Makefile实现自动化任务

每完成一个阶段，我们都会进行测试，确保功能正常，然后提交代码，记录进度。

让我们开始吧！

## 1. 项目初始化与环境配置

### 1.1 创建项目结构并初始化 Git

首先，让我们创建基本的项目结构并初始化Git仓库：

```bash
# 创建项目目录结构
mkdir -p data_engineering_hello_world/{data/{raw,processed,final},src,scripts,logs}
cd data_engineering_hello_world

# 创建必要的文件
touch Dockerfile docker compose.yml pyproject.toml Makefile README.md scripts/run_pipeline.sh .gitignore

# 初始化 Git 仓库
git init

# 创建 .gitkeep 文件以保留空目录结构
touch data/raw/.gitkeep data/processed/.gitkeep data/final/.gitkeep logs/.gitkeep
```

完成后，项目结构如下：

```
data_engineering_hello_world/
├── data/
│   ├── raw/           # 原始数据
│   │   └── .gitkeep
│   ├── processed/     # 处理后的中间数据
│   │   └── .gitkeep
│   └── final/         # 最终输出数据
│       └── .gitkeep
├── src/               # 源代码
├── scripts/           # 运行脚本
│   └── run_pipeline.sh
├── logs/              # 日志文件
│   └── .gitkeep
├── Dockerfile         # Docker 配置
├── docker compose.yml # Docker Compose 配置
├── pyproject.toml     # 项目依赖配置
├── Makefile           # 自动化任务
├── .gitignore         # Git 忽略文件
└── README.md          # 项目说明
```

### 1.2 配置 .gitignore

编辑 `.gitignore`，忽略不必要的文件：

```
# Python 缓存文件
__pycache__/
*.py[cod]

# 数据文件（保留 .gitkeep 文件以维持目录结构）
data/raw/*
data/processed/*
data/final/*
!data/raw/.gitkeep
!data/processed/.gitkeep
!data/final/.gitkeep

# 日志文件
logs/*
!logs/.gitkeep

# 环境变量文件
.env

# 虚拟环境
venv/
.venv/

# IDE 配置
.idea/
.vscode/
```

### 1.3 配置 Dockerfile

编辑 `Dockerfile`：

```dockerfile
# 使用 Python 3.10 作为基础镜像
FROM python:3.10-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖和 Poetry
# curl: 用于下载 Poetry 安装脚本
# build-essential: 用于编译 Python 扩展模块
# 安装后清理 apt 缓存以减小镜像大小
RUN apt-get update && apt-get install -y curl build-essential && rm -rf /var/lib/apt/lists/* \
    && curl -sSL https://install.python-poetry.org | python3 -

# 将 Poetry 添加到 PATH
ENV PATH="/root/.local/bin:$PATH"

# 配置 Poetry 不创建虚拟环境，直接安装到系统 Python 环境
RUN poetry config virtualenvs.create false

# 复制项目文件
COPY pyproject.toml .
COPY src/ ./src/
COPY scripts/ ./scripts/

# 安装依赖
RUN poetry install --without dev --no-interaction

# 创建必要的目录结构
RUN mkdir -p data/raw data/processed data/final logs

# 设置环境变量
ENV PYTHONPATH=/app
ENV PROJECT_ROOT=/app

# 使用CMD而不是ENTRYPOINT，保持容器运行
CMD ["tail", "-f", "/dev/null"]
```

### 1.4 配置 docker compose.yml

编辑 `docker compose.yml`：

```yaml
services:
  data_engine:
    build: .
    volumes:
      # 只挂载源代码、数据和日志目录，而不是整个项目目录
      - ./src:/app/src
      - ./data:/app/data
      - ./logs:/app/logs
      - ./scripts:/app/scripts
    # 设置环境变量
    environment:
      # 设置 Python 不缓冲标准输出
      - PYTHONUNBUFFERED=1
    # 保持容器运行
    command: tail -f /dev/null
    # 设置容器重启策略
    restart: unless-stopped
```

### 1.5 配置依赖管理（pyproject.toml）

编辑 `pyproject.toml`：

```toml
[tool.poetry]
name = "data-engine-hello-world"
version = "0.1.0"
description = "A simple data engine project"
authors = ["dengsu2 <dengshu5115@gmail.com>"]
packages = [{include = "src"}]

[tool.poetry.dependencies]
python = "^3.10"
pandas = "^2.0.0"
numpy = "^1.26.0"
polars = "^0.18.0"
duckdb = "^1.1.0"
getdaft = "^0.4.0"
openpyxl = "^3.1.0"
pyyaml = "^6.0.0"
loguru = "^0.7.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.3.1"
black = "^23.3.0"
isort = "^5.12.0"
flake8 = "^6.0.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

### 1.6 配置 Makefile

编辑 `Makefile`，定义自动化任务：

```makefile
.PHONY: all setup generate-data run-pipeline clean lint format test

# 默认任务：设置环境、生成数据并运行管道
all: setup generate-data run-pipeline

# 构建并启动 Docker 容器
setup:
	docker compose build
	docker compose up -d
	@echo "环境已设置完成"

# 生成示例数据
generate-data:
	docker compose exec data_engine poetry run python -m src.data.generate_sample_data
	@echo "示例数据已生成"

# 运行数据处理管道
run-pipeline:
	docker compose exec data_engine bash scripts/run_pipeline.sh

# 清理生成的数据和日志
clean:
	rm -rf data/processed/* data/final/* logs/*.log
	@echo "已清理生成的数据和日志"
```

### 测试项目初始化

让我们测试项目初始化是否成功：

```bash
# 检查目录结构
ls -la

# 确认 Git 仓库已初始化
git status
```

如果一切正常，你应该能看到项目的目录结构和 Git 仓库状态。

### 提交初始化代码

```bash
git add .
git commit -m "初始化项目结构和配置文件"

# 添加远程仓库
git remote add origin git@github.com:dengshu2/data_engineering_hello_world.git

# 推送到远程仓库
git push -u origin main

```

问题记录：上传到远程仓库的 repo，没有 src 、data目录

## 2. 基础模块实现

现在，让我们创建项目的基础模块，包括配置模块、日志模块和工具函数。

### 2.1 创建配置模块

首先，创建必要的目录结构：

```bash
mkdir -p src/{utils,data,pipeline}
touch src/__init__.py src/utils/__init__.py src/data/__init__.py src/pipeline/__init__.py
```

然后，创建配置文件 `src/config.py`：

```python
"""
配置模块：定义项目中使用的所有路径和配置参数
集中管理配置，便于修改和维护
"""
import os
from pathlib import Path

# 项目根目录
PROJECT_ROOT = Path(os.getenv("PROJECT_ROOT", os.path.dirname(os.path.dirname(__file__))))

# 数据目录
DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
FINAL_DATA_DIR = DATA_DIR / "final"

# 日志目录
LOGS_DIR = PROJECT_ROOT / "logs"

# 数据文件路径
RAW_CSV_PATH = RAW_DATA_DIR / "sample_data.csv"
RAW_EXCEL_PATH = RAW_DATA_DIR / "sample_data.xlsx"
PROCESSED_PARQUET_PATH = PROCESSED_DATA_DIR / "sample_data.parquet"
EXCEL_PARQUET_PATH = PROCESSED_DATA_DIR / "sample_data_from_excel.parquet"
TRANSFORMED_DATA_PATH = PROCESSED_DATA_DIR / "transformed_data.parquet"
POLARS_OUTPUT_PATH = FINAL_DATA_DIR / "polars_processed.parquet"
DAFT_OUTPUT_PATH = FINAL_DATA_DIR / "daft_processed.parquet"

# 数据生成配置
SAMPLE_SIZE = 1000
RANDOM_SEED = 42
```

### 2.2 创建日志模块

创建 `src/utils/logging.py`：

```python
"""
日志模块：配置项目的日志记录功能
使用 loguru 库提供更好的日志体验
"""
import sys
from datetime import datetime
from pathlib import Path

from loguru import logger

from src.config import LOGS_DIR


def setup_logger():
    """
    配置日志记录器
    
    设置两个日志接收器:
    1. 控制台输出 - 显示所有 INFO 级别以上的日志
    2. 文件输出 - 记录所有 DEBUG 级别以上的日志到文件
    
    返回:
        配置好的 logger 实例
    """
    # 确保日志目录存在
    Path(LOGS_DIR).mkdir(parents=True, exist_ok=True)
    
    # 生成带时间戳的日志文件名
    log_file = LOGS_DIR / f"pipeline_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    
    # 移除默认的日志处理器
    logger.remove()
    
    # 添加控制台输出处理器
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO",
    )
    
    # 添加文件输出处理器
    logger.add(
        log_file,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="DEBUG",
        rotation="10 MB",  # 日志文件达到10MB时轮转
        retention="1 week",  # 保留1周的日志
    )
    
    return logger


# 创建全局日志实例
logger = setup_logger()
```

### 2.3 创建文件工具模块

创建 `src/utils/file_utils.py`：

```python
"""
文件工具模块：提供文件和目录操作的辅助函数
"""
import os
from pathlib import Path

from src.utils.logging import logger


def ensure_dirs(*dirs):
    """
    确保指定的所有目录都存在，如果不存在则创建
    
    参数:
        *dirs: 需要确保存在的目录路径列表
    """
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        logger.debug(f"确保目录存在: {dir_path}")


def check_file_exists(file_path):
    """
    检查文件是否存在
    
    参数:
        file_path: 要检查的文件路径
        
    返回:
        bool: 文件存在返回True，否则返回False
    """
    exists = os.path.isfile(file_path)
    if not exists:
        logger.warning(f"文件不存在: {file_path}")
    return exists


def get_file_size(file_path):
    """
    获取文件大小（以MB为单位）
    
    参数:
        file_path: 文件路径
        
    返回:
        float: 文件大小（MB）
    """
    if check_file_exists(file_path):
        size_bytes = os.path.getsize(file_path)
        size_mb = size_bytes / (1024 * 1024)
        return size_mb
    return 0
```

### 测试基础模块

让我们构建Docker镜像并测试基础模块：

```bash
# 构建并启动Docker容器
docker compose build
docker compose up -d

# 进入容器
docker compose exec data_engine bash

# 测试导入模块
python -c "from src.config import PROJECT_ROOT; from src.utils.logging import logger; from src.utils.file_utils import ensure_dirs; print(f'项目根目录: {PROJECT_ROOT}'); logger.info('日志测试'); ensure_dirs('/app/test_dir'); print('基础模块测试成功')"

# 检查是否创建了测试目录
ls -la /app/test_dir

# 检查是否生成了日志文件
ls -la /app/logs

# 退出容器
exit
```

如果测试成功，你应该能看到项目根目录路径、日志测试信息，并且创建了测试目录和日志文件。

### 提交基础模块代码

```bash
git add .
git commit -m "Implement basic modules: configuration, logging, and file utilities"
```

## 3. 数据生成模块实现

现在，让我们实现数据生成模块，用于创建示例数据。

### 3.1 创建数据生成模块

创建 `src/data/generate_sample_data.py`：

```python
"""
数据生成模块：创建示例数据集用于演示
"""
import numpy as np
import pandas as pd

from src.config import (
    RAW_CSV_PATH,
    RAW_DATA_DIR,
    RAW_EXCEL_PATH,
    RANDOM_SEED,
    SAMPLE_SIZE,
)
from src.utils.file_utils import ensure_dirs
from src.utils.logging import logger


def generate_sample_data():
    """
    生成示例数据并保存到 data/raw 目录
    
    创建一个包含用户ID、时间戳、数值、类别和活跃状态的数据集
    保存为CSV和Excel格式
    """
    # 确保原始数据目录存在
    ensure_dirs(RAW_DATA_DIR)
    
    # 设置随机种子以确保可重复性
    np.random.seed(RANDOM_SEED)
    
    # 创建示例数据
    data = {
        'user_id': np.random.randint(1000, 9999, size=SAMPLE_SIZE),  # 随机用户ID
        'timestamp': pd.date_range(start='2023-01-01', periods=SAMPLE_SIZE, freq='h'),  # 每小时一个时间点
        'value': np.random.normal(100, 15, size=SAMPLE_SIZE),  # 正态分布的数值
        'category': np.random.choice(['A', 'B', 'C', 'D'], size=SAMPLE_SIZE),  # 随机类别
        'is_active': np.random.choice([True, False], size=SAMPLE_SIZE, p=[0.8, 0.2])  # 80%概率为活跃用户
    }
    
    # 创建DataFrame
    df = pd.DataFrame(data)
    
    # 保存为CSV
    df.to_csv(RAW_CSV_PATH, index=False)
    logger.info(f"CSV数据已保存: {RAW_CSV_PATH}")
    
    # 保存为Excel
    df.to_excel(RAW_EXCEL_PATH, index=False)
    logger.info(f"Excel数据已保存: {RAW_EXCEL_PATH}")
    
    logger.success(f"生成了示例数据：{len(df)}行，已保存至 {RAW_DATA_DIR}")


if __name__ == "__main__":
    generate_sample_data()
```

### 测试数据生成模块

让我们测试数据生成模块：

```bash
# 进入容器
docker compose exec data_engine bash

# 运行数据生成模块
python -m src.data.generate_sample_data

# 检查生成的数据文件
ls -la /app/data/raw/
head -n 5 /app/data/raw/sample_data.csv

# 退出容器
exit
```

如果测试成功，你应该能看到生成的CSV和Excel文件，并且能查看CSV文件的内容。

### 提交数据生成模块代码

```bash
git add .
git commit -m "Implement data generation module: create CSV and Excel sample data"
```

## 4. 数据转换模块实现

接下来，让我们实现数据转换模块，用于处理和转换数据。

### 4.1 创建数据转换模块

创建 `src/data/transformers.py`：

```python
"""
数据模块：提供各种数据格式转换和处理函数
"""

import pandas as pd
import polars as pl
import duckdb
import daft

from src.config import (
    DAFT_OUTPUT_PATH,
    EXCEL_PARQUET_PATH,
    POLARS_OUTPUT_PATH,
    PROCESSED_PARQUET_PATH,
    RAW_CSV_PATH,
    RAW_EXCEL_PATH,
    TRANSFORMED_DATA_PATH,
)
from src.utils.logging import logger

def csv_to_parquet():
    """
    将CSV文件转换为Parquet文件
    """
    # 使用polars读取csv文件
    df = pl.read_csv(RAW_CSV_PATH)
    # 使用polars写入parquet文件
    df.write_parquet(PROCESSED_PARQUET_PATH)
    logger.info(f"{RAW_CSV_PATH}共计({len(df)})条数据已转换为Parquet文件: {PROCESSED_PARQUET_PATH}")
    return df

def excel_to_parquet():
    """
    将Excel文件转换为Parquet文件
    """
    # 使用pandas读取excel文件
    pandas_df = pd.read_excel(RAW_EXCEL_PATH)
    # 使用daft写入parquet文件
    daft_df = daft.from_pandas(pandas_df)
    daft_df.write_parquet(EXCEL_PARQUET_PATH)
    logger.info(f"{RAW_EXCEL_PATH}共计({len(daft_df)})条数据已转换为Parquet文件: {EXCEL_PARQUET_PATH}")
    return daft_df

def duckdb_transform():
    """
    使用duckdb进行数据转换
    """
    # 创建内存数据库链接
    conn = duckdb.connect(database=':memory:')
    # 从 Parquet 文件读取数据
    df = conn.execute("CREATE TABLE sample_data AS SELECT * FROM read_parquet(?)", [str(PROCESSED_PARQUET_PATH)])

    # 执行 SQL 转换：添加value_category列，根据value 值分类
    conn.execute("""
        CREATE TABLE transformed_data AS 
        SELECT 
        user_id
        ,timestamp
        ,value
        ,category
        ,is_active
        ,CASE WHEN value > 100 THEN 'high'
             WHEN value < 90 THEN 'low'
             ELSE 'medium'
        END AS value_category
        FROM sample_data
        """)
    # 将结果保存为 Parquet 文件
    conn.execute(f"COPY (SELECT * FROM transformed_data) TO '{TRANSFORMED_DATA_PATH}' (FORMAT PARQUET)")
    row_count = conn.execute("SELECT COUNT(*) FROM transformed_data").fetchone()[0]
    logger.info(f"duckdb转换结果,处理了{row_count}条数据,已保存为Parquet文件: {TRANSFORMED_DATA_PATH}")

def polars_processing():
    """
    使用polars进行数据处理
    """
    # 从 Parquet 文件读取数据
    df = pl.read_parquet(TRANSFORMED_DATA_PATH)

    result_df = df.filter(pl.col("is_active") == True) \
        .with_columns(pl.col("value") * 1.1) \
        .sort("value",descending=True) \
    
    # 保存处理结果
    result_df.write_parquet(POLARS_OUTPUT_PATH)
    logger.info(f"polars转换结果,处理了{len(df)}条数据,已保存为Parquet文件: {POLARS_OUTPUT_PATH}")
    return result_df

def daft_processing():
    """
    使用daft进行数据处理
    """
    # 从 Parquet 文件读取数据
    df = daft.read_parquet(str(TRANSFORMED_DATA_PATH))
    
    # 数据处理：
    # 1. 过滤类别为‘A’的记录
    # 2. 添加优先级分数列
    result_df = df.filter(df["category"] == "A") \
        .with_column("priority_score", df["value"] / 100 * 5)

    # 保存处理结果
    result_df.write_parquet(DAFT_OUTPUT_PATH)
    logger.info(f"daft转换结果,处理了{df.count_rows()}条数据,已保存为Parquet文件: {DAFT_OUTPUT_PATH}")
    return result_df
```

### 测试数据转换模块

让我们逐步测试数据转换模块的各个功能：

```bash
# 进入容器
docker compose exec data_engine bash

# 确保已生成示例数据
python -m src.data.generate_sample_data

# 测试CSV到Parquet转换
python -c "from src.data.transformers import csv_to_parquet; csv_to_parquet()"
ls -la /app/data/processed/

# 测试Excel到Parquet转换
python -c "from src.data.transformers import excel_to_parquet; excel_to_parquet()"
ls -la /app/data/processed/

# 测试DuckDB转换
python -c "from src.data.transformers import csv_to_parquet, duckdb_transform; csv_to_parquet(); duckdb_transform()"
ls -la /app/data/processed/

# 测试Polars处理
python -c "from src.data.transformers import csv_to_parquet, duckdb_transform, polars_processing; csv_to_parquet(); duckdb_transform(); polars_processing()"
ls -la /app/data/final/

# 测试Daft处理
python -c "from src.data.transformers import csv_to_parquet, duckdb_transform, daft_processing; csv_to_parquet(); duckdb_transform(); daft_processing()"
ls -la /app/data/final/

# 退出容器
exit
```

如果测试成功，你应该能看到各种转换和处理后的Parquet文件。

### 提交数据转换模块代码

```bash
git add .
git commit -m "Implement data transformation module: CSV/Excel to Parquet, DuckDB conversion, Polars and Daft processing"
```

## 5. 管道集成（续）

### 5.1 创建管道主模块（续）

让我们完成 `src/pipeline/main.py` 文件：

```python
"""
数据管道主模块：协调整个数据处理流程
"""
from src.config import (
    FINAL_DATA_DIR,
    LOGS_DIR,
    PROCESSED_DATA_DIR,
    RAW_DATA_DIR,
)
from src.data.transformers import (
    csv_to_parquet,
    daft_processing,
    duckdb_transform,
    excel_to_parquet,
    polars_processing,
)
from src.utils.file_utils import ensure_dirs
from src.utils.logging import logger


def setup_environment():
    """
    设置环境：确保所有必要的目录存在
    """
    ensure_dirs(RAW_DATA_DIR, PROCESSED_DATA_DIR, FINAL_DATA_DIR, LOGS_DIR)
    logger.info("环境设置完成，所有必要目录已创建")


def run_pipeline():
    """
    运行完整数据管道
    
    执行以下步骤：
    1. 设置环境
    2. 转换CSV到Parquet
    3. 转换Excel到Parquet
    4. 使用DuckDB进行SQL转换
    5. 使用Polars进行数据处理
    6. 使用Daft进行数据处理
    """
    logger.info("开始运行数据管道")
    
    # 步骤1：设置环境
    setup_environment()
    
    # 步骤2：转换CSV到Parquet
    csv_to_parquet()
    
    # 步骤3：转换Excel到Parquet
    excel_to_parquet()
    
    # 步骤4：使用DuckDB进行SQL转换
    duckdb_transform()
    
    # 步骤5：使用Polars进行数据处理
    polars_processing()
    
    # 步骤6：使用Daft进行数据处理
    daft_processing()
    
    logger.success("数据管道执行完成！")


if __name__ == "__main__":
    run_pipeline()
```

### 5.2 创建运行脚本

在 `scripts` 目录下编辑 `run_pipeline.sh`：

```bash
#!/bin/bash

# 运行数据管道的脚本
# 使用彩色输出增强可读性
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}开始执行数据管道: $(date)${NC}"

# 使用Poetry运行主管道模块
poetry run python -m src.pipeline.main

# 检查上一个命令的退出状态
if [ $? -eq 0 ]; then
    echo -e "${GREEN}数据管道执行成功: $(date)${NC}"
else
    echo -e "${RED}数据管道执行失败: $(date)${NC}"
    exit 1
fi

# 显示处理结果摘要
echo -e "${GREEN}处理结果摘要:${NC}"
poetry run python -c "
import os
print(f'原始数据文件数: {len(os.listdir(\"data/raw\")) - 1}')
print(f'处理后数据文件数: {len(os.listdir(\"data/processed\")) - 1}')
print(f'最终结果文件数: {len(os.listdir(\"data/final\")) - 1}')
"
```

### 测试完整管道

让我们测试完整的数据处理管道：

```bash
# 进入容器
docker compose exec data_engine bash

# 清理之前生成的数据（可选）
rm -rf /app/data/raw/* /app/data/processed/* /app/data/final/* /app/logs/*
touch /app/data/raw/.gitkeep /app/data/processed/.gitkeep /app/data/final/.gitkeep /app/logs/.gitkeep

# 生成示例数据
python -m src.data.generate_sample_data

# 运行完整管道
bash scripts/run_pipeline.sh

# 检查结果
ls -la /app/data/final/

# 退出容器
exit
```

如果测试成功，你应该能看到处理结果摘要，并且在 `data/final/` 目录中有两个 Parquet 文件。

### 提交管道集成代码

```bash
git add .
git commit -m "Implement pipeline main module and run script, complete data processing pipeline integration"
```

## 6. 自动化任务测试

现在，让我们测试 Makefile 中定义的自动化任务，确保它们能正常工作。

### 6.1 测试 setup 任务

```bash
# 停止并移除现有容器（如果有）
docker compose down

# 运行 setup 任务
make setup

# 检查容器是否正在运行
docker compose ps
```

如果 setup 任务成功，你应该能看到容器正在运行。

### 6.2 测试 generate-data 任务

```bash
# 清理之前生成的数据（可选）
make clean

# 运行 generate-data 任务
make generate-data

# 检查生成的数据文件
ls -la data/raw/
```

如果 generate-data 任务成功，你应该能看到生成的 CSV 和 Excel 文件。

### 6.3 测试 run-pipeline 任务

```bash
# 运行 run-pipeline 任务
make run-pipeline

# 检查处理结果
ls -la data/final/
```

如果 run-pipeline 任务成功，你应该能看到处理结果摘要，并且在 `data/final/` 目录中有两个 Parquet 文件。

### 提交自动化任务测试代码

```bash
git add .
git commit -m "Test automation tasks, ensure Makefile functionality is normal"
```

## 7. 项目完善

最后，让我们完善项目，添加 README 文件，提供使用说明。

### 7.1 编辑 README.md

````markdown
# Data Engineering Hello World

一个简单但完整的数据工程 Hello World 项目，展示如何使用现代工具构建数据处理管道。

## 项目概述

本项目在一台全新的 VPS 上搭建一套现代数据工程开发环境，并实现一个简单但完整的数据处理管道。项目采用渐进式开发方法，每完成一个阶段就进行测试，确保每一步都正确无误。

## 技术栈

- **Python 3.10**：编程语言
- **Docker & Docker Compose**：容器化和服务编排
- **Poetry**：依赖管理
- **Pandas**：数据处理和分析
- **Polars**：高性能数据处理
- **DuckDB**：嵌入式分析型数据库
- **Daft**：分布式数据处理框架
- **Loguru**：日志记录
- **Makefile**：自动化任务

## 项目结构

```
data_engineering_hello_world/
├── data/
│   ├── raw/           # 原始数据
│   ├── processed/     # 处理后的中间数据
│   └── final/         # 最终输出数据
├── src/
│   ├── config.py      # 配置参数
│   ├── data/
│   │   ├── generate_sample_data.py  # 数据生成
│   │   └── transformers.py          # 数据转换
│   ├── pipeline/
│   │   └── main.py                  # 管道主模块
│   └── utils/
│       ├── file_utils.py            # 文件工具
│       └── logging.py               # 日志配置
├── scripts/
│   └── run_pipeline.sh              # 运行脚本
├── logs/               # 日志文件
├── Dockerfile          # Docker 配置
├── docker compose.yml  # Docker Compose 配置
├── pyproject.toml      # 项目依赖配置
├── Makefile            # 自动化任务
└── .gitignore          # Git 忽略文件
```

## 使用指南

### 前提条件

- Docker 和 Docker Compose
- Make（可选，用于运行自动化任务）

### 快速开始

1. 克隆仓库：

```bash
git clone https://github.com/yourusername/data-engineering-hello-world.git
cd data-engineering-hello-world
```

2. 设置环境：

```bash
make setup
```

3. 生成示例数据：

```bash
make generate-data
```

4. 运行数据管道：

```bash
make run-pipeline
```

### 其他命令

- 清理生成的数据和日志：

```bash
make clean
```

## 数据处理流程

1. 数据生成：
   - 生成包含用户ID、时间戳、数值、类别和活跃状态的随机数据
   - 保存为CSV和Excel格式

2. 格式转换：
   - 使用Polars将CSV转换为Parquet格式
   - 使用Pandas和Daft将Excel转换为Parquet格式

3. 数据处理：
   - 使用DuckDB执行SQL转换，添加value_category分类
   - 使用Polars过滤活跃用户，增加value值，并排序
   - 使用Daft过滤特定类别，计算优先级分数

4. 结果存储：
   - 将处理结果保存至`data/final`目录的Parquet文件

## 许可证

MIT
````

### 7.2 最终测试

让我们进行一次完整的测试，确保整个项目能正常工作：

```bash
# 清理所有生成的数据和日志
make clean

# 运行完整流程
make all

# 检查结果
ls -la data/final/
```

如果测试成功，你应该能看到整个数据处理流程顺利完成，并且在 `data/final/` 目录中有两个 Parquet 文件。

### 提交最终代码

```bash
git add .
git commit -m "Complete project: add detailed README and final test"
```

## 8. 总结

在这个项目中，我们使用渐进式开发方法从零开始搭建了一套现代数据工程环境，并实现了一个简单但完整的数据处理管道。通过这种方法，我们确保了每一步都正确无误，为后续复杂项目奠定了基础。

### 渐进式开发的优势

1. 降低调试难度：问题在早期就能被发现，更容易定位和修复
2. 增强信心：每个成功的测试都增强了对代码的信心
3. 提高代码质量：频繁测试促使我们编写更模块化、更可测试的代码
4. 更好的学习体验：特别对于初学者，每个小成功都是学习的正反馈

### 项目亮点

1. 模块化设计：将功能拆分为多个模块，提高代码可维护性
2. 多种数据处理技术：展示了Pandas、Polars、DuckDB和Daft等多种现代数据处理工具
3. 容器化部署：使用Docker确保环境一致性和可复制性
4. 自动化任务：使用Makefile简化常见操作
5. 完善的日志：使用Loguru提供详细的日志记录

通过这个项目，我们不仅学习了如何搭建数据工程环境，还掌握了渐进式开发的方法，这对于未来的数据工程项目将非常有帮助。

希望这个项目能为你的数据工程之旅提供一个良好的起点。随着你的技能提升，你可以扩展这个项目，添加更复杂的功能，如数据质量检查、调度系统、监控和警报等。

祝你在数据工程领域的探索之旅愉快！