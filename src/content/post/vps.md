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
sudo apt update && sudo apt upgrade -y && sudo apt install -y build-essential tree
```

## 3. SSH 安全加固

SSH 是远程管理服务器的主要通道，加固 SSH 配置至关重要：

```bash
# 编辑 SSH 配置文件
sudo vim /etc/ssh/sshd_config
```

将以下安全加固配置添加到 SSH 配置文件中：

```ini
# 修改默认 SSH 端口（降低被自动扫描的风险）
Port 2222

# 禁用密码认证，仅允许密钥认证
PasswordAuthentication no
```

应用更改并重启 SSH 服务：

```bash
# 测试配置文件语法是否正确
sudo sshd -t

# 如无错误，重启 SSH 服务
sudo systemctl restart ssh
```

> **注意**：在完全断开当前连接前，请确保新的 SSH 配置可以正常工作。建议保持当前会话连接，另开一个终端测试新配置是否可以成功连接。

## 4. Docker 环境安装

Docker 是容器化应用的标准工具，以下是精简后的安装步骤，参考[Docker 官方安装文档](https://docs.docker.com/engine/install/ubuntu/)

```bash
# 安装必要的依赖
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# 添加 Docker 官方 GPG 密钥
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 添加 Docker 软件源
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新软件包索引
sudo apt-get update

# 安装 Docker 引擎和相关工具
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

验证 Docker 安装：

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
ssh-keygen -t ed25519 -C "your_email@example.com"

# 显示公钥内容，复制后添加到 GitHub/GitLab 账户中
cat ~/.ssh/id_ed25519.pub
```

配置 Git 全局用户信息：

```bash
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"

# 设置默认main分支
git config --global init.defaultBranch main
```

测试 Git 配置：

```bash
# 测试 SSH 连接到 GitHub
ssh -T git@github.com
```

## 6. 防火墙配置

配置 UFW 防火墙增强系统安全：

```bash
# 启用 UFW
sudo ufw enable

# 允许 SSH 连接（使用自定义端口）
sudo ufw allow 2222/tcp

# 如果需要对外提供 Web 服务，开放相应端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 检查防火墙状态
sudo ufw status verbose

# 关闭防火墙
sudo ufw disable
```

## 7. Java 环境配置 (SDKMAN!)

SDKMAN! 是一个用于管理多个版本 Java 及其相关工具的命令行工具，可以轻松安装和切换不同版本的 JDK：

```bash
# 安装 SDKMAN! 所需依赖
sudo apt install -y curl zip unzip

# 安装 SDKMAN!
curl -s "https://get.sdkman.io" | bash

# 加载 SDKMAN! 脚本
source "$HOME/.sdkman/bin/sdkman-init.sh"

# 验证安装
sdk version
```

使用 SDKMAN! 安装和管理 Java：

```bash
# 列出可用的 JDK 版本
sdk list java

# 安装特定版本的 JDK (例如 JDK 17)
sdk install java 8.0.442-zulu 

# 设置默认 Java 版本
sdk default java 8.0.442-zulu

# 验证 Java 安装
java -version
javac -version
```

## 8. Python 环境配置 (pyenv)

pyenv 允许在同一系统上安装和管理多个 Python 版本：

```bash
# 安装 pyenv 所需依赖
sudo apt install -y make build-essential libssl-dev zlib1g-dev \
libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev

# 使用 pyenv 安装程序
curl https://pyenv.run | bash
```

将 pyenv 添加到 shell 配置中：

```bash
# 添加以下内容到 ~/.bashrc 或 ~/.zshrc
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.bashrc

# 重新加载 shell 配置
source ~/.bashrc
```

使用 pyenv 安装和管理 Python：

```bash
# 列出可用的 Python 版本
pyenv install --list

# 安装特定版本的 Python
pyenv install 3.11.11

# 设置全局 Python 版本
pyenv global 3.11.11

# 验证 Python 安装
python --version
pip --version

# 安装常用的 Python 包
pip install ipython numpy pandas matplotlib
```

## 9. 系统备份

完成基础配置后，建议创建系统快照或备份。

## 总结

通过以上步骤，我们完成了 VPS 的初始化配置，包括系统更新、SSH 安全加固、Docker 环境搭建和 Git 配置。这些基础配置为后续运行各类应用和服务提供了安全、可靠的环境。

下一篇文章将详细介绍如何在此基础上搭建和运行大数据项目。

## 参考资料

- [Docker 官方安装文档](https://docs.docker.com/engine/install/ubuntu/)
- [SSH 安全最佳实践](https://linux-audit.com/audit-and-harden-your-ssh-configuration/)
- [GitHub SSH 密钥设置指南](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [UFW 防火墙配置指南](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu-20-04)
