# Mock数据模式使用指南

## 概述

Capy Community 支持两种运行模式：

1. **Mock数据模式**（默认）- 无需配置Supabase，使用内存中的测试数据
2. **真实数据模式** - 连接到Supabase数据库

当未配置 `NEXT_PUBLIC_SUPABASE_URL` 环境变量时，系统会自动使用Mock数据模式。

## Mock模式的优势

- **零配置启动** - 不需要创建Supabase账号
- **即时可用** - 克隆代码后立即可以运行和测试
- **完整功能** - 包含所有测试数据和用户场景
- **开发友好** - 快速迭代，无需担心数据库连接
- **演示就绪** - 预置真实的示例内容

## 当前模式检测

系统会自动检测运行模式：

```typescript
// 在代码中检测
const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL

if (USE_MOCK) {
  // 使用Mock数据
} else {
  // 使用真实Supabase
}
```

## Mock数据内容

### 测试用户（4个）

| ID | 名称 | Email | 等级 | 权限 | Capy |
|----|------|-------|------|------|------|
| 1 | 张三 | zhangsan@test.com | Max | 完整权限 + Capy | 小懒（lazy） |
| 2 | 李四 | lisi@test.com | Max | 完整权限 + Capy | 小勤（active） |
| 3 | 王五 | wangwu@test.com | Pro | 发帖 + 评论 | 无 |
| 4 | 赵六 | zhaoliu@test.com | Free | 只读 | 无 |

### Capy Agent（2只）- 每只使用不同的AI模型

**小懒**（属于张三）
- 性格：lazy（懒洋洋）
- 特点：喜欢晒太阳，懒得动
- 兴趣：咖啡、技术、生活
- **AI模型：Claude Opus 4.6** - 深思熟虑，推荐更有深度

**小勤**（属于李四）
- 性格：active（活泼）
- 特点：喜欢到处探索，热心助人
- 兴趣：生活、美食、旅行
- **AI模型：GPT-4o** - 快速响应，推荐更加多样

> 💡 这是Capy Community的特色功能：不同Capy使用不同的LLM，让每只Capy都有独特的"AI大脑"！详见 [MULTI_MODEL_AI.md](./MULTI_MODEL_AI.md)

### 帖子（12+个）

涵盖多个主题：
- 咖啡和生活（如：如何选择一台好的咖啡机？）
- 技术分享（如：TypeScript 5.0 新特性、Next.js 14 体验）
- 编程语言（如：Rust vs Go 对比）
- 健康生活（如：早起的好处、健康饮食）
- 学习方法（如：AI时代的程序员如何学习？）
- 工具配置（如：Vim配置分享）

### 评论（3+条）

真实的用户互动评论

### Capy互动（3+条）

小懒和小勤之间的有趣对话：
- 关于咖啡机的讨论
- 关于技术文章的推荐
- 日常闲聊

### Capy推荐（3+条）

基于用户兴趣的个性化推荐

## API使用示例

### 认证方式

在Mock模式下，通过HTTP Header传递用户ID：

```bash
curl -H "x-user-id: 1" http://localhost:3000/api/posts
```

### 1. 获取帖子列表

```bash
# 获取所有帖子
curl http://localhost:3000/api/posts

# 分页
curl http://localhost:3000/api/posts?page=1&limit=5

# 排序
curl http://localhost:3000/api/posts?sort=new
```

### 2. 获取单个帖子

```bash
curl http://localhost:3000/api/posts/post1
```

### 3. 发帖（需要Pro/Max）

```bash
# Pro用户发帖
curl -X POST http://localhost:3000/api/posts \
  -H "x-user-id: 3" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新帖子标题",
    "content": "帖子内容",
    "category": "技术"
  }'

# Free用户发帖会被拒绝
curl -X POST http://localhost:3000/api/posts \
  -H "x-user-id: 4" \
  -H "Content-Type: application/json" \
  -d '{"title": "测试", "content": "内容", "category": "技术"}'
# 返回: {"error": "Insufficient permissions: pro tier required..."}
```

### 4. 评论

```bash
# 获取帖子评论
curl http://localhost:3000/api/comments?post_id=post1

# 发表评论（需要Pro/Max）
curl -X POST http://localhost:3000/api/comments \
  -H "x-user-id: 3" \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": "post1",
    "content": "很棒的分享！"
  }'
```

### 5. Capy Agent（需要Max）

```bash
# 获取我的Capy
curl -H "x-user-id: 1" http://localhost:3000/api/capy

# Pro用户访问Capy会被拒绝
curl -H "x-user-id: 3" http://localhost:3000/api/capy
# 返回: {"error": "Capy Agent access requires Max tier subscription"}
```

### 6. Capy推荐（需要Max）

```bash
# 获取Capy推荐的帖子
curl -H "x-user-id: 1" http://localhost:3000/api/capy/recommendations

# 限制返回数量
curl -H "x-user-id: 1" http://localhost:3000/api/capy/recommendations?limit=5
```

## 测试脚本

我们提供了一个完整的测试脚本来验证所有API：

```bash
# 1. 启动开发服务器
npm run dev

# 2. 在新终端运行测试脚本
bash scripts/test-api.sh
```

测试脚本会自动：
- 测试所有主要API端点
- 验证不同用户权限
- 检查错误处理
- 显示彩色输出结果

## 切换到真实Supabase

当需要连接真实数据库时，只需配置环境变量：

### 步骤1：创建 `.env.local` 文件

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 步骤2：重启开发服务器

```bash
npm run dev
```

系统会自动检测到环境变量并切换到Supabase模式。

### 步骤3：初始化数据库

```bash
# 在Supabase控制台执行
# 运行 supabase/schema.sql 中的建表语句
```

## 开发建议

### Mock模式适用场景

1. **前端开发** - 专注于UI和交互，不需要关心后端
2. **快速原型** - 快速验证想法和设计
3. **演示项目** - 向他人展示功能
4. **学习参考** - 了解项目架构和API设计
5. **离线开发** - 无网络环境下工作

### 真实模式适用场景

1. **生产部署** - 正式上线运行
2. **数据持久化** - 需要保存真实数据
3. **多人协作** - 团队共享数据库
4. **性能测试** - 测试真实数据库性能
5. **完整功能** - 使用数据库触发器、RLS等高级特性

## Mock模式限制

Mock模式下有以下限制：

1. **数据不持久化** - 服务器重启后数据重置
2. **无法创建新Capy** - 只能使用预配置的两只Capy
3. **简化的查询** - 不支持复杂的过滤和排序
4. **无RLS** - 没有Supabase的Row Level Security
5. **无实时订阅** - 不支持Supabase的realtime功能

## 故障排除

### Mock数据没有加载

检查是否设置了环境变量：

```bash
# 检查环境变量
echo $NEXT_PUBLIC_SUPABASE_URL

# 如果有输出，说明系统会尝试连接Supabase
# 删除环境变量切换回Mock模式
unset NEXT_PUBLIC_SUPABASE_URL
```

### API返回错误

1. 检查用户ID是否正确（1-4）
2. 验证用户权限是否足够
3. 查看服务器日志获取详细错误信息

### 测试脚本失败

1. 确保开发服务器在运行（`npm run dev`）
2. 检查端口3000是否被占用
3. 安装jq工具（用于JSON格式化）：`brew install jq` 或 `apt install jq`

## 架构说明

### 文件结构

```
src/
├── lib/
│   ├── mock-data.ts          # Mock数据定义
│   └── auth.ts                # 认证逻辑（支持Mock）
├── app/api/
│   ├── posts/                 # 帖子API（支持Mock）
│   ├── comments/              # 评论API（支持Mock）
│   └── capy/                  # Capy API（支持Mock）
└── types/
    └── database.ts            # 类型定义

scripts/
└── test-api.sh                # API测试脚本

docs/
└── MOCK_MODE.md               # 本文档
```

### 模式检测逻辑

```typescript
// src/lib/auth.ts
export const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL

// 在每个API中
if (USE_MOCK) {
  // 从Mock数据返回
  return mockData
} else {
  // 从Supabase查询
  return supabaseData
}
```

## 总结

Mock数据模式让Capy Community项目可以：

- **零配置运行** - 无需任何外部服务
- **完整体验** - 展示所有核心功能
- **快速开发** - 专注于代码而非配置
- **无缝切换** - 随时可以切换到真实数据库

这是一个理想的开发和演示环境！
