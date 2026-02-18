#!/bin/bash
# Capy Community - 开发环境初始化脚本
# 在VM首次启动时运行

set -e

echo "🚀 开始配置 Capy Community 开发环境..."
echo ""

# ============================================
# 1. 更新系统
# ============================================

echo "📦 更新系统包..."
sudo apt update && sudo apt upgrade -y

# ============================================
# 2. 安装基础工具
# ============================================

echo ""
echo "🔧 安装基础工具..."
sudo apt install -y \
  build-essential \
  curl \
  wget \
  git \
  vim \
  tmux \
  htop \
  unzip \
  ca-certificates \
  gnupg \
  lsb-release

# ============================================
# 3. 安装Node.js 18+ (使用nvm)
# ============================================

echo ""
echo "📦 安装Node.js..."

# 安装nvm
if [ ! -d "$HOME/.nvm" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

# 加载nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 安装Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

echo ""
node -v
npm -v

# ============================================
# 4. 配置npm加速（可选，国内网络优化）
# ============================================

echo ""
echo "⚙️ 配置npm镜像..."
npm config set registry https://registry.npmmirror.com

# ============================================
# 5. 安装pnpm（更快的包管理器）
# ============================================

echo ""
echo "📦 安装pnpm..."
npm install -g pnpm

# ============================================
# 6. 配置Git
# ============================================

echo ""
echo "⚙️ 配置Git..."
read -p "输入你的Git用户名: " git_username
read -p "输入你的Git邮箱: " git_email

git config --global user.name "$git_username"
git config --global user.email "$git_email"
git config --global init.defaultBranch main
git config --global core.editor vim

echo ""
git config --global --list

# ============================================
# 7. 创建项目目录
# ============================================

echo ""
echo "📁 创建项目目录..."
mkdir -p ~/projects
cd ~/projects

echo ""
echo "当前目录: $(pwd)"

# ============================================
# 8. 安装Docker（可选）
# ============================================

echo ""
read -p "是否安装Docker？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🐳 安装Docker..."

    # 添加Docker官方GPG密钥
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    # 添加Docker仓库
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # 安装Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # 添加当前用户到docker组
    sudo usermod -aG docker $USER

    echo "✅ Docker安装完成！"
    echo "⚠️  注意：需要重新登录才能使用docker命令（不需要sudo）"
else
    echo "⏭️  跳过Docker安装"
fi

# ============================================
# 9. 配置防火墙（UFW）
# ============================================

echo ""
echo "🔒 配置防火墙..."
sudo ufw --force enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Next.js
sudo ufw allow 5173/tcp  # Vite
sudo ufw status

# ============================================
# 10. 创建环境变量模板
# ============================================

echo ""
echo "📝 创建环境变量模板..."

cat > ~/.env.capy-template << 'EOF'
# Capy Community 环境变量模板
# 复制到项目的 .env.local 并填写实际值

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# 环境
NODE_ENV=development

# 可选：数据库直连（仅开发环境）
DATABASE_URL=your_database_url
EOF

echo "✅ 环境变量模板已创建: ~/.env.capy-template"

# ============================================
# 11. 配置tmux（可选但推荐）
# ============================================

echo ""
echo "⚙️ 配置tmux..."

cat > ~/.tmux.conf << 'EOF'
# Capy Community tmux配置

# 使用Ctrl+A作为前缀键（代替Ctrl+B）
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# 启用鼠标
set -g mouse on

# 窗口编号从1开始
set -g base-index 1
setw -g pane-base-index 1

# 更友好的分屏快捷键
bind | split-window -h
bind - split-window -v

# 快速重载配置
bind r source-file ~/.tmux.conf \; display "Config reloaded!"

# 状态栏美化
set -g status-style bg=colour235,fg=colour136
set -g status-left '#[fg=colour76][#S] '
set -g status-right '#[fg=colour39]%Y-%m-%d #[fg=colour76]%H:%M'
EOF

echo "✅ tmux配置完成"

# ============================================
# 完成
# ============================================

echo ""
echo "=========================================="
echo "🎉 开发环境配置完成！"
echo "=========================================="
echo ""
echo "环境信息："
echo "  Node.js: $(node -v)"
echo "  npm: $(npm -v)"
echo "  pnpm: $(pnpm -v)"
echo "  Git: $(git --version)"
echo "  项目目录: ~/projects"
echo ""
echo "下一步："
echo ""
echo "1. 如果安装了Docker，请重新登录："
echo "   exit"
echo "   # 然后重新SSH进来"
echo ""
echo "2. 克隆项目："
echo "   cd ~/projects"
echo "   git clone https://github.com/Y1fe1-Yang/capy-community.git"
echo "   cd capy-community"
echo ""
echo "3. 配置环境变量："
echo "   cp ~/.env.capy-template .env.local"
echo "   vim .env.local  # 填写实际的API keys"
echo ""
echo "4. 创建Supabase项目："
echo "   # 去 https://supabase.com 创建新项目"
echo "   # 记录 URL 和 anon key"
echo ""
echo "5. 获取Gemini API Key："
echo "   # 去 https://ai.google.dev 获取"
echo ""
echo "6. 开始开发："
echo "   # 我们会使用多Agent并行开发"
echo "   # 按照 docs/AGENT_TASKS.md 的任务列表执行"
echo ""
echo "=========================================="
echo ""
echo "💡 提示："
echo "  - 使用tmux保持会话: tmux new -s capy"
echo "  - 断开连接: Ctrl+A, 然后按 D"
echo "  - 重新连接: tmux attach -t capy"
echo ""
echo "  - 查看系统资源: htop"
echo "  - 查看磁盘空间: df -h"
echo ""
echo "准备好开始开发了吗？🚀"
