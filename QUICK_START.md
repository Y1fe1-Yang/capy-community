# Capy Community - 快速启动指南

## 🚀 方法1：一键创建VM（推荐）

在你本地电脑运行：

```bash
# 下载并运行创建脚本
curl -fsSL https://raw.githubusercontent.com/Y1fe1-Yang/capy-community/master/create-vm.sh | bash
```

或者手动：

```bash
git clone https://github.com/Y1fe1-Yang/capy-community.git
cd capy-community
bash create-vm.sh
```

---

## 🔧 方法2：单行命令创建（高性能配置）

如果你更喜欢单行命令，直接复制粘贴到终端：

### 步骤1：创建VM

```bash
gcloud compute instances create capy-dev-vm \
  --project=capy-community-dev \
  --zone=asia-east1-b \
  --machine-type=n2-standard-4 \
  --network-interface=network-tier=PREMIUM,subnet=default \
  --maintenance-policy=MIGRATE \
  --provisioning-model=STANDARD \
  --scopes=https://www.googleapis.com/auth/cloud-platform \
  --tags=http-server,https-server,dev-server \
  --create-disk=auto-delete=yes,boot=yes,device-name=capy-dev-vm,image=projects/ubuntu-os-cloud/global/images/family/ubuntu-2204-lts,mode=rw,size=100,type=pd-ssd \
  --shielded-vtpm \
  --shielded-integrity-monitoring
```

**配置说明：**
- **机器类型：** n2-standard-4 (4 vCPU, 16GB RAM)
- **磁盘：** 100GB SSD
- **预计成本：** ~$150/月
- **区域：** asia-east1-b (台湾)

### 步骤2：创建防火墙规则

```bash
# 允许开发服务器端口
gcloud compute firewall-rules create allow-dev-server \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:3000,tcp:5173,tcp:8080 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=dev-server \
  --description="Allow development server ports"
```

### 步骤3：SSH连接

```bash
gcloud compute ssh capy-dev-vm --zone=asia-east1-b
```

### 步骤4：初始化开发环境

在VM上运行：

```bash
# 克隆项目
git clone https://github.com/Y1fe1-Yang/capy-community.git
cd capy-community

# 运行初始化脚本
bash docs/init-dev-env.sh
```

---

## 💰 配置选项对比

### 经济型配置（~$58/月）

```bash
--machine-type=e2-standard-2 \
--create-disk=...size=50,type=pd-standard
```
- 2 vCPU, 8GB RAM
- 50GB 标准磁盘
- 适合轻量开发

### 标准型配置（~$100/月）

```bash
--machine-type=e2-standard-4 \
--create-disk=...size=100,type=pd-standard
```
- 4 vCPU, 16GB RAM
- 100GB 标准磁盘
- 适合中等开发

### 高性能配置（~$150/月）**推荐**

```bash
--machine-type=n2-standard-4 \
--create-disk=...size=100,type=pd-ssd
```
- 4 vCPU, 16GB RAM
- 100GB SSD磁盘（4-5倍速度）
- 适合多Agent并行开发

### 极致性能配置（~$300/月）

```bash
--machine-type=n2-standard-8 \
--create-disk=...size=200,type=pd-ssd
```
- 8 vCPU, 32GB RAM
- 200GB SSD磁盘
- 适合密集开发和生产环境

---

## 📊 区域选择

| 区域 | 位置 | 延迟 | 推荐 |
|------|------|------|------|
| asia-east1 | 台湾 | 低 | ✅ 推荐（国内访问快）|
| asia-southeast1 | 新加坡 | 低 | ✅ 备选 |
| us-west1 | 美国西海岸 | 中 | - |
| us-central1 | 美国中部 | 中 | - |

修改命令中的 `--zone` 参数即可：
```bash
--zone=asia-east1-b    # 台湾
--zone=asia-southeast1-b  # 新加坡
```

---

## 🔍 验证VM创建

```bash
# 查看VM状态
gcloud compute instances list

# 获取外部IP
gcloud compute instances describe capy-dev-vm \
  --zone=asia-east1-b \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# 查看VM详细信息
gcloud compute instances describe capy-dev-vm --zone=asia-east1-b
```

---

## 🛠️ 常用管理命令

```bash
# 停止VM（节省成本，仅收取磁盘费用）
gcloud compute instances stop capy-dev-vm --zone=asia-east1-b

# 启动VM
gcloud compute instances start capy-dev-vm --zone=asia-east1-b

# 删除VM（不可恢复！）
gcloud compute instances delete capy-dev-vm --zone=asia-east1-b

# 查看成本估算
gcloud compute instances get-serial-port-output capy-dev-vm --zone=asia-east1-b
```

---

## 🔐 SSH配置（可选）

如果想用本地SSH客户端：

```bash
# 1. 生成SSH密钥
ssh-keygen -t ed25519 -C "capy-dev" -f ~/.ssh/capy-dev

# 2. 添加公钥到VM
gcloud compute instances add-metadata capy-dev-vm \
  --zone=asia-east1-b \
  --metadata-from-file ssh-keys=<(echo "$(whoami):$(cat ~/.ssh/capy-dev.pub)")

# 3. 获取外部IP
EXTERNAL_IP=$(gcloud compute instances describe capy-dev-vm \
  --zone=asia-east1-b \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

# 4. SSH连接
ssh -i ~/.ssh/capy-dev $(whoami)@$EXTERNAL_IP

# 5. 配置~/.ssh/config（推荐）
cat >> ~/.ssh/config << EOF
Host capy-dev
    HostName $EXTERNAL_IP
    User $(whoami)
    IdentityFile ~/.ssh/capy-dev
EOF

# 然后直接用
ssh capy-dev
```

---

## 🚨 故障排查

### 问题1：项目ID不存在

```bash
# 创建项目
gcloud projects create capy-community-dev \
  --name="Capy Community Dev"

# 设置为当前项目
gcloud config set project capy-community-dev

# 启用Compute Engine API
gcloud services enable compute.googleapis.com
```

### 问题2：配额不足

去Google Cloud Console检查配额：
https://console.cloud.google.com/iam-admin/quotas

### 问题3：无法SSH连接

```bash
# 检查防火墙
gcloud compute firewall-rules list

# 创建SSH规则（通常自动创建）
gcloud compute firewall-rules create allow-ssh \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:22 \
  --source-ranges=0.0.0.0/0
```

---

## 📞 需要帮助？

创建过程中遇到问题？检查：

1. ✅ gcloud CLI已安装并认证
2. ✅ 项目ID存在且有权限
3. ✅ Compute Engine API已启用
4. ✅ 有足够的配额

---

**准备好了？运行上面的命令开始创建！** 🚀
