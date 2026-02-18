# Google Cloud开发环境配置清单

> **给你用的：** 创建Google Cloud VM的完整配置

---

## 🖥️ VM配置要求

### 基础配置

```yaml
项目名称: capy-community-dev

VM实例配置:
  名称: capy-dev-vm
  区域: asia-east1 (台湾) 或 asia-southeast1 (新加坡)
  可用区: 任意 (-a, -b, -c)

机器类型:
  推荐: e2-standard-2
  - vCPU: 2核
  - 内存: 8GB
  - 理由: 够用且便宜 (~$50/月)

  如果预算充足:
  - e2-standard-4 (4核16GB) ~$100/月
  - 更快但对我们项目不必要

磁盘:
  类型: 标准永久性磁盘 (Standard persistent disk)
  大小: 50GB
  理由: 够用且便宜 (~$8/月)

操作系统:
  推荐: Ubuntu 22.04 LTS
  理由: 稳定，软件包全
```

### 网络配置

```yaml
网络标签:
  - http-server
  - https-server

防火墙规则:
  允许入站:
    - 22 (SSH)
    - 80 (HTTP)
    - 443 (HTTPS)
    - 3000 (Next.js开发服务器)
    - 5173 (Vite开发服务器，如果需要)

静态IP:
  不需要（动态IP即可）
  如果后续需要，再申请
```

---

## 📦 需要安装的软件

### 1. Node.js 18+

```bash
# 使用nvm安装（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
node -v  # 验证安装
```

### 2. Git

```bash
sudo apt update
sudo apt install -y git
git --version
```

### 3. Claude Code (如果需要在VM上运行)

```bash
# 如果你想在VM上用Claude Code
# 具体安装方法取决于你如何访问（SSH / Web IDE）
```

### 4. 其他工具

```bash
# 基础开发工具
sudo apt install -y \
  build-essential \
  curl \
  wget \
  vim \
  tmux \
  htop

# Docker（如果后续需要容器化）
# 现在不装，等需要时再说
```

---

## 🔐 SSH访问配置

### 生成SSH密钥（在你本地电脑）

```bash
# 1. 生成密钥对
ssh-keygen -t ed25519 -C "capy-dev" -f ~/.ssh/capy-dev

# 2. 复制公钥内容
cat ~/.ssh/capy-dev.pub
# 把输出的内容复制下来
```

### 在Google Cloud添加SSH密钥

```
1. 进入VM实例页面
2. 点击你的VM → 编辑
3. 滚动到"SSH密钥"部分
4. 点击"添加项"
5. 粘贴刚才复制的公钥
6. 保存
```

### 从本地连接

```bash
# 方式1: 通过Google Cloud Console的SSH按钮（最简单）

# 方式2: 从本地终端
ssh -i ~/.ssh/capy-dev <用户名>@<VM外部IP>

# 方式3: 配置~/.ssh/config（最方便）
cat >> ~/.ssh/config << EOF
Host capy-dev
    HostName <VM外部IP>
    User <你的用户名>
    IdentityFile ~/.ssh/capy-dev
EOF

# 然后直接用
ssh capy-dev
```

---

## 💰 成本估算

```
VM实例:
  e2-standard-2 + 50GB磁盘
  约 $58/月

网络:
  出站流量（前1GB免费）
  后续约 $0.12/GB
  预计 $5-10/月

总计:
  约 $70/月
  300刀能用 4-5个月

节省技巧:
  1. 不用时关机（停止实例，只付磁盘钱）
  2. 开发完成后，换到更小的实例
  3. 或者全部迁到Vercel（前端免费）
```

---

## 🚀 初始化脚本

### 创建VM后第一次连接时运行

```bash
#!/bin/bash
# setup-dev-env.sh

set -e

echo "🚀 开始配置开发环境..."

# 1. 更新系统
echo "📦 更新系统包..."
sudo apt update && sudo apt upgrade -y

# 2. 安装基础工具
echo "🔧 安装基础工具..."
sudo apt install -y \
  build-essential \
  curl \
  wget \
  git \
  vim \
  tmux \
  htop \
  unzip

# 3. 安装Node.js
echo "📦 安装Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18
nvm use 18

# 4. 配置Git
echo "⚙️ 配置Git..."
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 5. 创建项目目录
echo "📁 创建项目目录..."
mkdir -p ~/projects
cd ~/projects

echo "✅ 开发环境配置完成！"
echo ""
echo "下一步:"
echo "  1. git clone 你的仓库"
echo "  2. npm install"
echo "  3. npm run dev"
```

### 使用方法

```bash
# 1. 上传脚本到VM
scp setup-dev-env.sh capy-dev:~/

# 2. SSH到VM
ssh capy-dev

# 3. 运行脚本
chmod +x setup-dev-env.sh
./setup-dev-env.sh
```

---

## 🔑 环境变量配置

### 在VM上创建.env.local

```bash
# 在项目根目录
cat > .env.local << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=你的Supabase_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Anon_Key

# Gemini API
GEMINI_API_KEY=你的Gemini_Key

# 开发环境
NODE_ENV=development
EOF

# 安全：不要提交.env.local到Git
echo ".env.local" >> .gitignore
```

---

## 🌐 访问开发服务器

### 选项1: SSH隧道（推荐）

```bash
# 在你本地电脑运行
ssh -L 3000:localhost:3000 capy-dev

# 然后在VM上
npm run dev

# 现在你可以在本地浏览器访问
# http://localhost:3000
```

### 选项2: 开放防火墙（不推荐生产）

```bash
# 在Google Cloud Console
# 防火墙规则 → 创建规则
名称: allow-dev-server
目标: 所有实例（或特定标签）
源IP范围: 0.0.0.0/0
协议和端口: tcp:3000

# 然后在VM上
npm run dev -- --host 0.0.0.0

# 访问
# http://<VM外部IP>:3000
```

**注意：** 选项2会让任何人都能访问你的开发服务器，只用于测试！

---

## 📊 监控和管理

### 查看VM资源使用

```bash
# CPU和内存
htop

# 磁盘空间
df -h

# 网络流量
sudo apt install -y iftop
sudo iftop
```

### 查看Node进程

```bash
# 列出所有Node进程
ps aux | grep node

# 使用PM2管理（如果安装了）
pm2 list
pm2 logs
```

### 停止/启动VM

```bash
# 方式1: Google Cloud Console
# VM实例 → 选择实例 → 停止/启动

# 方式2: gcloud命令（需要安装gcloud CLI）
gcloud compute instances stop capy-dev-vm
gcloud compute instances start capy-dev-vm
```

---

## 🐛 故障排查

### 问题1: 无法SSH连接

```bash
# 检查VM是否运行
# Google Cloud Console → VM实例 → 状态应该是"正在运行"

# 检查防火墙
# VPC网络 → 防火墙 → 确保有允许22端口的规则

# 测试连接
ping <VM外部IP>
telnet <VM外部IP> 22
```

### 问题2: npm install很慢

```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com
```

### 问题3: 磁盘空间不足

```bash
# 查看大文件
du -h --max-depth=1 / | sort -hr | head -20

# 清理npm缓存
npm cache clean --force

# 清理apt缓存
sudo apt clean
```

---

## 📝 快速检查清单

创建VM后，按这个清单验证：

```
□ VM已创建并运行
□ 可以SSH连接
□ Node.js 18+已安装 (node -v)
□ Git已安装 (git --version)
□ 可以访问外网（测试: curl google.com）
□ 防火墙规则正确（端口22, 3000可访问）
□ 创建了项目目录 ~/projects
□ 配置了Git用户名和邮箱
```

全部打勾？开始开发！🚀

---

## 🎯 下一步

VM配置完成后：

1. **克隆或创建项目**
   ```bash
   cd ~/projects
   npx create-next-app@latest capy-community
   cd capy-community
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **运行开发服务器**
   ```bash
   npm run dev
   ```

4. **从本地访问**
   ```bash
   # 本地电脑运行
   ssh -L 3000:localhost:3000 capy-dev
   # 然后浏览器打开 http://localhost:3000
   ```

5. **启动多Agent开发**
   - 看 docs/AGENT_TASKS.md
   - 开始领取任务！

---

## 💡 专业提示

### 使用tmux保持会话

```bash
# 安装tmux
sudo apt install tmux

# 启动tmux
tmux

# 运行开发服务器
npm run dev

# 断开连接（服务器继续运行）
Ctrl+B, 然后按 D

# 重新连接
tmux attach
```

### 使用Git管理代码

```bash
# 每天工作结束时
git add .
git commit -m "今天的工作：XXX"
git push

# 这样即使VM坏了，代码也安全
```

---

**准备好了吗？告诉我你创建VM的结果，我们就可以开始了！** 🚀
