---
title: "借助 Claude Code 开发 Excel2SQL 在线工具"
publishDate: "02 September 2025"
description: "使用 Claude Code 开发了一个实用的在线工具，可以将 Excel/CSV 文件转换为 Spark SQL 插入语句，数据完全在本地处理，保证隐私安全"
tags: ["claude-code", "excel", "spark-sql", "online-tool", "工具"]
---

## 项目背景

在数据分析工作中，经常需要将 Excel 或 CSV 文件的数据导入到数据库中。传统的方式需要调度工具实现数据的装载，既费时又容易出错。本周的 vide coding 成效，借助 Claude Code 的强大能力，开发了一个 Excel2SparkSQL 的前端界面工具来解决这个问题。

## 技术栈

项目采用了经典的现代化部署方案：

- **namesilo**：域名购买
- **cloudflare**：DNS解析
- **github**：代码仓库管理
- **vercel**：代码部署
- **claude code**：开发主力工具

## 在线体验

🔗 **工具地址**：[https://excel2sql.runningotter.com/](https://excel2sql.runningotter.com/)

## 功能特性

### 隐私安全
- 数据完全在本地运行，不会上传到服务器
- 保证用户数据隐私安全

### 支持格式
- Excel 文件（.xlsx, .xls）
- CSV 文件（.csv）

### 四大核心模块

1. **Upload Excel File**：上传文件
2. **Preview Data**：查看数据样例
3. **Configure Table**：配置表名
4. **Generated Spark SQL**：生成 Spark SQL 代码

## 使用教程

### 1. 文件上传

在 Upload Excel File 模块，点击上传按钮选择要处理的文件：

![开始界面](https:\\img.runningotter.com/2025/09/2772186e513dd940690444e4004859ce.png)

点击数据上传后，会弹出文件选择对话框。目前支持 Excel 和 CSV 格式，选择文件后点击确认，稍等片刻即可看到解析结果：

![解析结果](https:\\img.runningotter.com/2025/09/2de35f8a11653a85caeba180fc6532a7.png)

### 2. 数据预览

在 Preview Data 模块可以查看上传文件的数据样例，确认数据格式正确。

### 3. 表名配置

在 Configure Table 模块配置目标表名，可以根据需要自定义表名。

### 4. SQL 生成

配置完成后，在 Generated Spark SQL 模块就能看到生成的完整 Spark SQL 插入语句：

![生成结果](https:\\img.runningotter.com/2025/09/50ea42ee48dfc8503c69db38740f934f.png)

## 开发感悟

整个项目的开发过程再次证明了 AI 辅助开发的强大威力。Claude Code 不仅提高了开发效率，更重要的是让复杂的数据处理逻辑实现变得简单直观。从需求分析到最终部署，整个流程都变得异常顺畅。

## 后续计划

下一个 vide coding 计划是搭建一个图片生成工具。最近 Nano Banana 的图片生成比较火，打算配合 OpenRouter 的免费 API 也搭建一个类似的网站，为用户提供更多实用的在线工具。

## 总结

这个 Excel2SQL 工具虽然功能相对简单，但很好地解决了数据导入过程中的痛点。工具的核心优势在于：

- **本地处理**：确保数据隐私安全
- **操作简单**：四步即可完成转换
- **结果准确**：生成标准的 Spark SQL 语句
- **免费使用**：无需注册，开箱即用

希望这个工具能为需要进行数据导入的朋友们带来便利！如果你在使用过程中遇到任何问题或有改进建议，欢迎反馈交流。