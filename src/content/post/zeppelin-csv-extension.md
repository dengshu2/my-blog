---
title: "借助 Claude Code 开发的 Zeppelin CSV 下载扩展"
publishDate: "24 August 2025"
description: "使用 Claude Code 开发了一个简单实用的 Chrome 浏览器扩展，可以直接下载 Zeppelin 查询结果为 CSV 文件，避免重复的复制粘贴操作"
tags: ["claude-code", "zeppelin", "chrome-extension", "csv", "工具"]
---

## 项目背景

在日常使用 Apache Zeppelin 进行数据分析时，经常需要将查询结果导出为 CSV 文件。传统的复制粘贴方式不仅繁琐，而且容易出错。借助 Claude Code 的强大能力，我开发了一个简单实用的 Chrome 浏览器扩展来解决这个问题。

## 软件下载与安装

### 下载地址

[点击下载 Zeppelin CSV Extension](https://img.runningotter.com/zeppelin-csv-extension.7z)

下载完成后，找一个合适的路径解压即可。

### 安装步骤

#### 1. 打开扩展管理页面

打开浏览器后，点击**应用扩展**按钮：

![应用扩展](https:\\img.runningotter.com/2025/09/6c8730f5e18662390d66130068b1d90c.png)

#### 2. 进入管理扩展程序

点击**管理扩展程序**：

![管理扩展程序](https://img.runningotter.com/2025/08/e0c989bc0c2a67cfdd4fd15d42a55a31.png)

#### 3. 开启开发者模式

打开**开发者模式**开关，点击**加载未打包的扩展程序**按钮：

![开发者模式](https://img.runningotter.com/2025/08/c3a3f4a82ab9dfde1d2e8adef71b1cf9.png)

#### 4. 选择扩展文件夹

选择解压后的 `zeppelin_csv_download` 文件夹：

![选择文件夹](https://img.runningotter.com/2025/08/23c3725ee2607b9b3d73a690cb8b50a2.png)

#### 5. 固定扩展

安装完成后，建议在扩展程序列表中将其固定，方便日后使用：

![固定扩展](https://img.runningotter.com/2025/08/9c13cfb367d01bfec99b24870140bb4d.png)

## 使用方法

安装完成后，登录到 Zeppelin 并刷新界面，点击浏览器右上角刚固定的插件，你就可以看到下面的界面，点击下载就可以了。

![插件界面](https://img.runningotter.com/2025/08/80c7521f61a8c67f02d12694ed3fc532.png)

### 功能特性

- **一键下载**：支持将查询结果直接下载为 CSV 格式
- **灵活导出**：支持下载所有结果或特定的对话内容
- **无缝集成**：与 Zeppelin 界面完美融合，不影响正常使用

## 开发感悟

现在借助 AI 工具做个人项目开发变得异常便捷。整个扩展的开发过程只用了大约 1 个小时，其中最耗时的反而是处理各种复制粘贴的报错问题。

这次开发体验让我深刻感受到，未来的软件系统必将基于 AI 友好的方式构建。Claude Code 不仅提高了开发效率，更重要的是让复杂的功能实现变得简单直观。

## 总结

这个小工具虽然功能简单，但很好地解决了日常工作中的痛点。希望这个扩展能为同样使用 Zeppelin 的朋友们带来便利！

如果你在使用过程中遇到任何问题或有改进建议，欢迎反馈交流。