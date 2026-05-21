---
title: "VPS 初始化配置指南"
publishDate: "2025-03-07"
description: "本文详细记录了 VPS 购买、系统配置、SSH 安全加固、Docker 环境搭建以及 Git 配置的完整流程"
tags: ["vps", "服务器", "安全", "docker", "git"]
---

中年男人的新玩具🐶。

## 1. VPS 购买与选型

转战[HostHatch](https://cloud.hosthatch.com/) 平台。

> **选型说明**：如何选购VPS可以多逛逛论坛 [nodeseek](https://www.nodeseek.com/),再推荐另一个VPS [dmit](https://www.dmit.io/clientarea.php);

### 脚本测试

目前推荐使用融合怪脚本测试，可以获取基础的软件和网络信息。

```shell
# https://github.com/spiritLHLS/ecs
curl -L https://gitlab.com/spiritysdx/za/-/raw/main/ecs.sh -o ecs.sh && chmod +x ecs.sh && bash ecs.sh
```

| 项目 | 信息 |
|------|------|
| CPU 型号 | AMD EPYC 7763 64-Core Processor |
| CPU 核心数 | 4 |
| CPU 频率 | 2449.998 MHz |
| CPU 缓存 | L1: 256.00 KB / L2: 2.00 MB / L3: 64.00 MB |
| AES-NI指令集 | ✔ Enabled |
| VM-x/AMD-V支持 | ✔ Enabled |
| 内存 | 695.85 MiB / 15.62 GiB |
| Swap | 无交换分区或交换文件 |
| 硬盘空间 | 3.08 GiB / 179.40 GiB |
| 启动盘路径 | /dev/vda1 |
| 系统在线时间 | 0 days, 21 hour 30 min |
| 负载 | 0.45, 0.23, 0.09 |
| 系统 | Ubuntu 24.04.3 LTS (x86_64) |
| 架构 | x86_64 (64 Bit) |
| 内核 | 6.8.0-31-generic |
| TCP加速方式 | bbr |
| 虚拟化架构 | KVM |
| IPV4 ASN | AS63473 HostHatch, LLC |
| IPV4 位置 | Seoul / Seoul / KR |
| IPV6 ASN | AS63473 HOSTHATCH |
| IPV6 位置 | United States |
| IPV6 子网掩码 | 64 |

## 2. 系统初始化

首次登录 VPS 后，应当立即更新系统并安装必要的基础软件包：

```bash
# 更新软件包索引并升级已安装的软件
apt update && sudo apt upgrade -y

# 安装必要的工具
apt install -y tree curl wget htop tmux sudo unzip

# 其他的开发环境工具有需求的时候再安装
# uv Python
# sdkman Java
```

## 3. 配置新的用户和 SSH 安全加固

### 配置新的用户

root 用户只用来管理账号，不做日常的开发，新增用户可以稍后配置。

```bash
# 创建新的用户
adduser dengshu

# 授权sudo命令
usermod -aG sudo dengshu

# 设置sudo免密
sodo visudo

# 新增(Ctrl+o 保存 Ctrl+w 退出)
dengshu ALL=(ALL) NOPASSWD:ALL
```

### SSH 安全加固

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

# 如果有配置其他的用户，可以配置禁止 root 用户登录
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
sudo ss -tlnp | grep ssh

# 如果没有生效，可能是 socket 问题，停止并禁用 socket (解除对 22 端口的硬编码锁定)
sudo systemctl stop ssh.socket
sudo systemctl disable ssh.socket

# 启动并启用标准 service (让 sshd 读取配置文件并在新端口后台常驻)
sudo systemctl start ssh.service
sudo systemctl enable ssh.service
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
ssh-keygen -t ed25519 -C "dengshu.dev@gmail.com"

# 显示公钥内容，复制后添加到 GitHub/GitLab 账户中
cat ~/.ssh/id_ed25519.pub
```

配置 Git 全局用户信息：

```bash
git config --global user.name "dengshu2"
git config --global user.email "dengshu.dev@gmail.com"

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
- [GitHub SSH 密钥设置指南](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
