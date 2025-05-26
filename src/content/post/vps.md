---
title: "VPS 初始化配置指南"
publishDate: "2025-03-07"
description: "本文详细记录了 VPS 购买、系统配置、SSH 安全加固、Docker 环境搭建以及 Git 配置的完整流程"
tags: ["vps", "服务器", "安全", "docker", "git"]
---

中年男人的新玩具🐶。

## 1. VPS 购买与选型

在 [Claw Cloud](https://claw.cloud/) 平台购买了以下配置的 VPS：

- **处理器**：8 核心 CPU
- **内存**：32GB RAM
- **存储**：360GB SSD
- **带宽**：1Tbps
- **操作系统**：Ubuntu 24.04 LTS

> **选型说明**：选择高配置主要是为了后续运行大数据项目，通过优惠码，年付价格约为 1300 元左右。根据自己的实际需求，可以适当调整配置。

## 2. 系统初始化

首次登录 VPS 后，应当立即更新系统并安装必要的基础软件包：

```bash
# 更新软件包索引并升级已安装的软件
sudo apt update && sudo apt upgrade -y 

# 安装必要的工具
sudo apt install -y build-essential tree net-tools

# 可选安装 图片处理和字体
sudo apt install -y imagemagick inkscape fonts-noto-cjk

# 可选安装 python
sudo apt install -y python3 python3-pip python3-venv

# 可选安装 openjdk11
sudo apt install -y openjdk-11-jdk

# 可选安装 maven
sudo apt install -y maven
```

## 3. SSH 安全加固

SSH 是远程管理服务器的主要通道，加固 SSH 配置至关重要：

```bash
# 编辑 SSH 配置文件
sudo vim /etc/ssh/sshd_config
```

将以下安全加固配置添加到 SSH 配置文件中,vps 厂商提供了密钥文件配置的功能，关闭密码认证：

```ini
# 修改默认 SSH 端口（降低被自动扫描的风险）
Port 2222

# 禁用密码认证，仅允许密钥认证
PasswordAuthentication no

# 禁止 root 用户登录
PermitRootLogin prohibit-password
```

应用更改并重启 SSH 服务：

```bash
# 测试配置文件语法是否正确
sudo sshd -t

# 如无错误，重启 SSH 服务
sudo systemctl restart ssh

# 查看 SSH 服务状态
sudo systemctl status ssh

## 查看 SSH 是否正常绑定到 2222 端口
sudo netstat -tulpen | grep sshd

## 本地重新连接，清除指定IP+端口的旧记录
ssh-keygen -R "[47.79.21.68]:2222"
```

> **注意**：在完全断开当前连接前，请确保新的 SSH 配置可以正常工作。建议保持当前会话连接，另开一个终端测试新配置是否可以成功连接。

## 4. Docker 环境安装

Docker 是容器化应用的标准工具，请直接参考官网的最新安装教程：[Docker 官方安装文档](https://docs.docker.com/engine/install/ubuntu/)


```bash
# 检查 Docker 版本
docker --version
docker compose version

# 运行测试容器
sudo docker run hello-world

# 查看所有容器
sudo docker ps -a

# 删除未使用的镜像、容器和网络
sudo docker system prune -f
```

## 5. Git 配置

为高效管理代码，配置 Git 环境：

```bash
# 安装 Git（如未安装）
sudo apt install -y git

# 生成 SSH 密钥对
ssh-keygen -t ed25519 -C "dengshu5115@gmail.com" 

# 显示公钥内容，复制后添加到 GitHub/GitLab 账户中
cat ~/.ssh/id_ed25519.pub
```

配置 Git 全局用户信息：

```bash
git config --global user.name "dengshu2" 
git config --global user.email "dengshu5115@gmail.com" 

# 设置默认main分支
git config --global init.defaultBranch main
```

测试 Git 配置：

```bash
# 测试 SSH 连接到 GitHub
ssh -T git@github.com
```

## 总结

通过以上步骤，我们完成了 VPS 的初始化配置，包括系统更新、SSH 安全加固、Docker 环境搭建和 Git 配置。这些基础配置为后续运行各类应用和服务提供了安全、可靠的环境。

下一篇文章将详细介绍如何在此基础上搭建和运行大数据项目。

## 参考资料

- [Docker 官方安装文档](https://docs.docker.com/engine/install/ubuntu/)
- [SSH 安全最佳实践](https://linux-audit.com/audit-and-harden-your-ssh-configuration/)
- [GitHub SSH 密钥设置指南](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
