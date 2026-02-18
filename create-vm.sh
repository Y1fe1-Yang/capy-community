#!/bin/bash
# Capy Community - 高性能VM创建脚本
# 性能优先配置，适合开发和生产环境

set -e

echo "🚀 开始创建 Capy Community 开发VM..."
echo ""

# ============================================
# 配置参数（可根据需要调整）
# ============================================

PROJECT_ID="capy-community-dev"
VM_NAME="capy-dev-vm"
ZONE="asia-east1-b"  # 台湾
MACHINE_TYPE="n2-standard-4"  # 4 vCPU, 16GB RAM (高性能)
BOOT_DISK_SIZE="100GB"  # 更大的磁盘空间
BOOT_DISK_TYPE="pd-ssd"  # SSD磁盘（比标准磁盘快4-5倍）
IMAGE_FAMILY="ubuntu-2204-lts"
IMAGE_PROJECT="ubuntu-os-cloud"

# ============================================
# 网络配置
# ============================================

NETWORK_TAGS="http-server,https-server,dev-server"

# ============================================
# 创建VM
# ============================================

echo "配置信息："
echo "  项目: $PROJECT_ID"
echo "  VM名称: $VM_NAME"
echo "  区域: $ZONE"
echo "  机器类型: $MACHINE_TYPE (4核16GB)"
echo "  磁盘: $BOOT_DISK_SIZE SSD"
echo "  操作系统: Ubuntu 22.04 LTS"
echo ""
echo "预计成本: ~$150/月"
echo ""

read -p "确认创建？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "取消创建"
    exit 0
fi

echo ""
echo "正在创建VM..."

gcloud compute instances create "$VM_NAME" \
    --project="$PROJECT_ID" \
    --zone="$ZONE" \
    --machine-type="$MACHINE_TYPE" \
    --network-interface=network-tier=PREMIUM,subnet=default \
    --maintenance-policy=MIGRATE \
    --provisioning-model=STANDARD \
    --service-account=default \
    --scopes=https://www.googleapis.com/auth/cloud-platform \
    --tags="$NETWORK_TAGS" \
    --create-disk=auto-delete=yes,boot=yes,device-name="$VM_NAME",image=projects/"$IMAGE_PROJECT"/global/images/family/"$IMAGE_FAMILY",mode=rw,size="$BOOT_DISK_SIZE",type=projects/"$PROJECT_ID"/zones/"$ZONE"/diskTypes/"$BOOT_DISK_TYPE" \
    --no-shielded-secure-boot \
    --shielded-vtpm \
    --shielded-integrity-monitoring \
    --reservation-affinity=any

echo ""
echo "✅ VM创建完成！"
echo ""

# ============================================
# 创建防火墙规则
# ============================================

echo "正在配置防火墙规则..."

# 允许开发服务器端口（3000, 5173等）
gcloud compute firewall-rules create allow-dev-server \
    --project="$PROJECT_ID" \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:3000,tcp:5173,tcp:8080 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=dev-server \
    --description="Allow development server ports for Capy Community" \
    2>/dev/null || echo "  ⚠️  防火墙规则已存在，跳过"

echo ""
echo "✅ 防火墙配置完成！"
echo ""

# ============================================
# 获取VM信息
# ============================================

echo "获取VM信息..."
VM_EXTERNAL_IP=$(gcloud compute instances describe "$VM_NAME" \
    --project="$PROJECT_ID" \
    --zone="$ZONE" \
    --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo ""
echo "=========================================="
echo "🎉 VM创建成功！"
echo "=========================================="
echo ""
echo "VM信息："
echo "  名称: $VM_NAME"
echo "  外部IP: $VM_EXTERNAL_IP"
echo "  区域: $ZONE"
echo "  机器类型: $MACHINE_TYPE"
echo ""
echo "下一步："
echo ""
echo "1. SSH连接到VM："
echo "   gcloud compute ssh $VM_NAME --zone=$ZONE"
echo ""
echo "2. 或者配置本地SSH："
echo "   # 生成SSH密钥"
echo "   ssh-keygen -t ed25519 -C \"capy-dev\" -f ~/.ssh/capy-dev"
echo ""
echo "   # 添加公钥到VM"
echo "   gcloud compute instances add-metadata $VM_NAME \\"
echo "     --zone=$ZONE \\"
echo "     --metadata-from-file ssh-keys=<(echo \"\$(whoami):\$(cat ~/.ssh/capy-dev.pub)\")"
echo ""
echo "   # SSH连接"
echo "   ssh -i ~/.ssh/capy-dev \$(whoami)@$VM_EXTERNAL_IP"
echo ""
echo "3. 连接后运行初始化脚本："
echo "   git clone https://github.com/Y1fe1-Yang/capy-community.git"
echo "   cd capy-community"
echo "   bash docs/init-dev-env.sh"
echo ""
echo "=========================================="
