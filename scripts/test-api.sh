#!/bin/bash

# ==============================================================================
# Capy Community API 测试脚本（Mock数据模式）
# ==============================================================================
#
# 用途：测试所有API端点，验证Mock数据系统是否正常工作
#
# 使用方法：
#   1. 确保项目正在运行（npm run dev）
#   2. 运行此脚本：bash scripts/test-api.sh
#
# 测试用户：
#   - User 1: 张三 (Max用户，有Capy"小懒")
#   - User 2: 李四 (Max用户，有Capy"小勤")
#   - User 3: 王五 (Pro用户，可以发帖评论)
#   - User 4: 赵六 (Free用户，只读权限)
#
# ==============================================================================

set -e

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "  Capy Community API 测试（Mock模式）"
echo "========================================"
echo ""

# ==============================================================================
# 1. 测试获取帖子列表
# ==============================================================================
echo -e "${BLUE}[1/8] 测试 GET /api/posts${NC}"
response=$(curl -s -X GET "$BASE_URL/api/posts?limit=5")
echo "$response" | jq '.'
if echo "$response" | jq -e '.posts | length > 0' > /dev/null; then
  echo -e "${GREEN}✓ 获取帖子列表成功${NC}"
else
  echo -e "${RED}✗ 获取帖子列表失败${NC}"
fi
echo ""

# ==============================================================================
# 2. 测试获取单个帖子
# ==============================================================================
echo -e "${BLUE}[2/8] 测试 GET /api/posts/[id]${NC}"
response=$(curl -s -X GET "$BASE_URL/api/posts/post1")
echo "$response" | jq '.'
if echo "$response" | jq -e '.post.id' > /dev/null; then
  echo -e "${GREEN}✓ 获取单个帖子成功${NC}"
else
  echo -e "${RED}✗ 获取单个帖子失败${NC}"
fi
echo ""

# ==============================================================================
# 3. 测试Pro用户发帖
# ==============================================================================
echo -e "${BLUE}[3/8] 测试 POST /api/posts (Pro用户)${NC}"
response=$(curl -s -X POST "$BASE_URL/api/posts" \
  -H "x-user-id: 3" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试帖子 - 来自Pro用户",
    "content": "这是一个测试帖子内容",
    "category": "测试"
  }')
echo "$response" | jq '.'
if echo "$response" | jq -e '.post.id' > /dev/null; then
  echo -e "${GREEN}✓ Pro用户发帖成功${NC}"
else
  echo -e "${RED}✗ Pro用户发帖失败${NC}"
fi
echo ""

# ==============================================================================
# 4. 测试Free用户发帖（应该失败）
# ==============================================================================
echo -e "${BLUE}[4/8] 测试 POST /api/posts (Free用户 - 应该失败)${NC}"
response=$(curl -s -X POST "$BASE_URL/api/posts" \
  -H "x-user-id: 4" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试帖子 - 来自Free用户",
    "content": "这不应该成功",
    "category": "测试"
  }')
echo "$response" | jq '.'
if echo "$response" | jq -e '.error' > /dev/null; then
  echo -e "${GREEN}✓ Free用户发帖被正确拒绝${NC}"
else
  echo -e "${RED}✗ Free用户发帖没有被拒绝（错误！）${NC}"
fi
echo ""

# ==============================================================================
# 5. 测试获取评论
# ==============================================================================
echo -e "${BLUE}[5/8] 测试 GET /api/comments?post_id=post1${NC}"
response=$(curl -s -X GET "$BASE_URL/api/comments?post_id=post1")
echo "$response" | jq '.'
if echo "$response" | jq -e '.comments' > /dev/null; then
  echo -e "${GREEN}✓ 获取评论成功${NC}"
else
  echo -e "${RED}✗ 获取评论失败${NC}"
fi
echo ""

# ==============================================================================
# 6. 测试Pro用户评论
# ==============================================================================
echo -e "${BLUE}[6/8] 测试 POST /api/comments (Pro用户)${NC}"
response=$(curl -s -X POST "$BASE_URL/api/comments" \
  -H "x-user-id: 3" \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": "post1",
    "content": "这是一条测试评论"
  }')
echo "$response" | jq '.'
if echo "$response" | jq -e '.comment.id' > /dev/null; then
  echo -e "${GREEN}✓ Pro用户评论成功${NC}"
else
  echo -e "${RED}✗ Pro用户评论失败${NC}"
fi
echo ""

# ==============================================================================
# 7. 测试Max用户获取Capy
# ==============================================================================
echo -e "${BLUE}[7/8] 测试 GET /api/capy (Max用户)${NC}"
response=$(curl -s -X GET "$BASE_URL/api/capy" \
  -H "x-user-id: 1")
echo "$response" | jq '.'
if echo "$response" | jq -e '.capy.id' > /dev/null; then
  echo -e "${GREEN}✓ Max用户获取Capy成功${NC}"
else
  echo -e "${RED}✗ Max用户获取Capy失败${NC}"
fi
echo ""

# ==============================================================================
# 8. 测试Max用户获取Capy推荐
# ==============================================================================
echo -e "${BLUE}[8/8] 测试 GET /api/capy/recommendations (Max用户)${NC}"
response=$(curl -s -X GET "$BASE_URL/api/capy/recommendations" \
  -H "x-user-id: 1")
echo "$response" | jq '.'
if echo "$response" | jq -e '.recommendations' > /dev/null; then
  echo -e "${GREEN}✓ 获取Capy推荐成功${NC}"
else
  echo -e "${RED}✗ 获取Capy推荐失败${NC}"
fi
echo ""

# ==============================================================================
# 总结
# ==============================================================================
echo "========================================"
echo -e "${GREEN}测试完成！${NC}"
echo "========================================"
echo ""
echo "如果所有测试都通过，说明Mock数据系统工作正常！"
echo ""
echo "测试用户信息："
echo "  - User 1 (张三): Max用户，有Capy'小懒'"
echo "  - User 2 (李四): Max用户，有Capy'小勤'"
echo "  - User 3 (王五): Pro用户，可以发帖评论"
echo "  - User 4 (赵六): Free用户，只读权限"
echo ""
echo "要使用不同的用户测试，请在请求中添加 header:"
echo "  -H \"x-user-id: <user-id>\""
echo ""
