# Peter Steinberger开发方法论 - 实战指南

> 基于Lex Fridman播客访谈提炼的实战开发方法

---

## 📋 目录

1. [核心理念](#核心理念)
2. [开发流程](#开发流程)
3. [工具选择](#工具选择)
4. [多Agent协作](#多agent协作)
5. [实战应用到Capy项目](#实战应用到capy项目)

---

## 🎯 核心理念

### 1. Agentic Engineering vs Vibe Coding

**Peter的定义：**

```
❌ Vibe Coding（混乱模式）:
- 深夜3点随便prompt
- 没有计划
- 第二天需要清理代码
- 效率低

✅ Agentic Engineering（工程模式）:
- 有意识的AI引导开发
- 清晰的任务拆解
- Agent间协作
- 高效产出
```

**应用原则：**
```typescript
// Bad: Vibe Coding
"帮我做一个社区论坛，要功能完整、好看、性能好"
→ AI给你一堆代码，不知道从何下手

// Good: Agentic Engineering
"Step 1: 创建Next.js项目骨架，只包含路由和基础Layout"
→ 清晰的小任务，AI能精确完成
→ 你能理解和验证

"Step 2: 创建Supabase数据库，只包含users和posts表"
→ 继续下一个小任务
```

---

### 2. Agent自我意识（Self-Awareness）

**Peter的核心创新：**

> "Agent知道自己的源代码在哪，知道自己能做什么"

**传统方式：**
```
你: "帮我修复这个bug"
AI: "请把代码贴给我"
你: [复制粘贴一堆代码]
AI: [分析并修复]
```

**Peter方式：**
```
你: "检查你自己的代码，找出bug并修复"
Agent:
  1. 读取自己的源代码文件
  2. 分析代码结构
  3. 找到问题
  4. 自己修改文件
  5. 报告完成
```

**如何实现：**

```typescript
// 给Agent提供"自我认知"

const agentPrompt = `
你是一个开发Agent，你可以：

1. 读取项目文件：
   - 源代码: src/**/*.ts
   - 配置: package.json, tsconfig.json
   - 文档: docs/**/*.md

2. 你的能力：
   - 读文件: Read tool
   - 写文件: Write tool
   - 编辑文件: Edit tool
   - 执行命令: Bash tool
   - 搜索代码: Grep tool

3. 你的任务流程：
   a. 理解当前状态（读取相关文件）
   b. 规划改动
   c. 执行改动
   d. 验证结果

现在的任务：${task}

请先读取相关文件，理解现状，然后执行。
`
```

---

### 3. 多Agent并行协作

**Peter的实践：**

> "我同时运行4-10个agents，取决于任务复杂度和我的精力"

**架构示意：**

```
你（Team Lead）
  │
  ├─ Agent 1: Frontend Developer
  │    ├─ 负责UI组件
  │    ├─ 读写 src/components/**
  │    └─ 完成后通知Agent 4
  │
  ├─ Agent 2: Backend Developer
  │    ├─ 负责API路由
  │    ├─ 读写 src/app/api/**
  │    └─ 完成后通知Agent 4
  │
  ├─ Agent 3: Database Developer
  │    ├─ 负责Schema和迁移
  │    ├─ 读写 supabase/migrations/**
  │    └─ 完成后通知Agent 1和2
  │
  └─ Agent 4: Code Reviewer
       ├─ 审查所有PR
       ├─ 提出改进建议
       └─ 批准或要求修改
```

**关键：Agents之间的通信**

```typescript
// Agent 3完成数据库后，通知Agent 1

// Agent 3发送消息
await sendMessage({
  type: 'message',
  recipient: 'frontend-agent',
  content: '数据库schema已完成，posts表包含以下字段：id, title, content, user_id, created_at',
  summary: '数据库就绪'
})

// Agent 1收到消息后
// 根据schema开始实现前端组件
```

---

### 4. 渐进式开发（Progressive Development）

**Peter的做法：**

```
第1步：1小时原型
  - 最简单的可运行版本
  - 验证核心假设
  - 代码可以很丑

第2步：迭代优化
  - 发现问题
  - 重构
  - 增加功能

第3步：生产就绪
  - 错误处理
  - 性能优化
  - 安全加固
```

**应用到我们的项目：**

```
第1步：论坛原型（1-2小时）
  □ Next.js项目
  □ 写死4个用户
  □ 写死10个帖子
  □ 显示列表
  → 目标：能看到页面

第2步：数据库集成（2-3小时）
  □ Supabase连接
  □ 真实数据读写
  □ 登录功能
  → 目标：能发帖

第3步：Agent系统（1天）
  □ 简单的推荐逻辑
  □ AI调用
  □ 结果展示
  → 目标：Agent能工作

第4步：完善优化（1-2天）
  □ 错误处理
  □ 权限控制
  □ UI美化
  → 目标：生产可用
```

---

### 5. 代码审查哲学

**Peter的金句：**

> "我不读代码中无聊的部分，大多数软件只是把数据从一种形式转换成另一种"

**他的审查策略：**

```
重点审查：
✅ 数据库操作（影响数据完整性）
✅ 安全相关（认证、授权）
✅ 核心业务逻辑
✅ Agent决策代码

快速略过：
⏭️ UI样式代码（交给Agent）
⏭️ 数据转换代码（标准操作）
⏭️ 配置文件（模板化）
⏭️ 测试代码（Agent生成）
```

**应用：**

```typescript
// 你需要仔细review的

// ❗ 数据库操作
async function createPost(userId, content) {
  // 检查：权限、注入、事务
  return await db.posts.create({ userId, content })
}

// ❗ Agent决策逻辑
async function analyzePostRelevance(posts, userProfile) {
  // 检查：prompt质量、结果解析
  return await callAI(prompt)
}

// 你可以快速略过的

// ✅ UI组件（Agent生成）
function PostCard({ post }) {
  return <div>{post.title}</div>
}

// ✅ 数据转换（标准操作）
function formatDate(date) {
  return new Date(date).toLocaleDateString()
}
```

---

## 🔧 工具选择

### Peter的工具栈

```
主力工具：
- Claude Code（主要开发环境）
- Terminal（命令行优先）
- 7个AI订阅（同时使用）

偶尔使用：
- Cursor（IDE集成）
- 其他AI服务（对比质量）

不依赖：
- 重度IDE（避免锁定）
- 复杂工具链
```

### 应用到我们的项目

```yaml
核心工具：
  主开发: Claude Code
  版本控制: Git + GitHub
  AI服务: Gemini 2.0 Flash (你的300刀)

辅助工具：
  数据库: Supabase (免费)
  部署: Vercel (前端) + Google Cloud Run (后端)
  监控: Google Cloud Logging

避免过度依赖：
  ❌ 复杂框架
  ❌ 过多依赖包
  ❌ 重型IDE
```

---

## 🤝 多Agent协作实战

### 方法1：Claude Code Team系统

**创建开发团队：**

```typescript
// Step 1: 创建团队
TeamCreate({
  team_name: 'capy-community-dev',
  description: '开发Capy社区项目'
})

// Step 2: 启动agents
Task({
  subagent_type: 'general-purpose',
  team_name: 'capy-community-dev',
  name: 'database-agent',
  prompt: `
    你是数据库开发专家。

    任务：创建Supabase数据库schema

    步骤：
    1. 读取 docs/schema-design.md
    2. 创建migration文件
    3. 创建测试数据
    4. 完成后通知 backend-agent

    你可以：
    - 写文件到 supabase/migrations/
    - 执行SQL命令
    - 发送消息给其他agents
  `
})

Task({
  subagent_type: 'general-purpose',
  team_name: 'capy-community-dev',
  name: 'backend-agent',
  prompt: `
    你是后端开发专家。

    任务：实现API路由

    等待：database-agent 完成后开始

    步骤：
    1. 读取schema了解数据结构
    2. 实现CRUD API
    3. 完成后通知 frontend-agent
  `
})

Task({
  subagent_type: 'general-purpose',
  team_name: 'capy-community-dev',
  name: 'frontend-agent',
  prompt: `
    你是前端开发专家。

    任务：实现UI组件

    等待：backend-agent 完成后开始

    步骤：
    1. 读取API文档
    2. 实现页面和组件
    3. 完成后通知 code-reviewer
  `
})

Task({
  subagent_type: 'general-purpose',
  team_name: 'capy-community-dev',
  name: 'code-reviewer',
  prompt: `
    你是代码审查专家。

    任务：审查所有代码

    重点审查：
    - 数据库操作的安全性
    - API的权限控制
    - 错误处理

    快速略过：
    - UI样式
    - 数据格式化

    发现问题时要求agents修改。
  `
})
```

**Agents自主工作流程：**

```
时间轴：

00:00 - 你创建团队，启动4个agents
00:01 - database-agent 开始工作
00:15 - database-agent 完成，发消息给 backend-agent
00:16 - backend-agent 开始工作
00:45 - backend-agent 完成，发消息给 frontend-agent
00:46 - frontend-agent 开始工作
01:30 - frontend-agent 完成，发消息给 code-reviewer
01:31 - code-reviewer 审查，发现3个问题
01:32 - code-reviewer 发消息给 frontend-agent 要求修改
01:35 - frontend-agent 修改完成
01:36 - code-reviewer 批准
01:37 - code-reviewer 发消息给你："所有任务完成！"

你的工作：
- 00:00 创建团队
- 01:37 review最终结果
- 总计：你只花了5分钟

Agents工作：1.5小时（但你在干别的）
```

---

### 方法2：顺序式Agent协作

**如果Team系统太复杂，用这个：**

```typescript
// 你手动协调agents

// Round 1: Database
await runAgent({
  task: 'database-setup',
  prompt: '创建数据库schema'
})
// 你review结果
✅ 看起来不错

// Round 2: Backend
await runAgent({
  task: 'backend-api',
  prompt: '基于刚才的schema实现API',
  context: '数据库已就绪'
})
// 你review结果
❌ 发现权限漏洞

// Round 2.1: 修复
await runAgent({
  task: 'backend-fix',
  prompt: '修复权限漏洞：所有API都要验证user_id'
})
✅ 修复完成

// Round 3: Frontend
await runAgent({
  task: 'frontend-ui',
  prompt: '实现前端页面'
})
```

**优点：**
- 简单直接
- 你完全控制
- 容易debug

**缺点：**
- 慢（串行）
- 需要你一直在场

---

## 🚀 实战应用到Capy项目

### 开发路线图（Peter式）

#### Week 1: 快速原型（Agentic Engineering）

**Day 1: 基础设施（2小时）**

```bash
# Task 1.1: 项目初始化（Agent自动）
npx create-next-app@latest capy-community

# Task 1.2: 数据库（Agent自动）
# Agent读取schema设计
# Agent创建Supabase表
# Agent插入测试数据

# 你的工作：验证可以访问
```

**Day 2: 论坛MVP（4小时）**

```typescript
// 并行启动3个agents

Agent 1: 实现帖子列表
Agent 2: 实现发帖功能
Agent 3: 实现评论功能

// 3个agents同时工作
// 你只需要最后review
```

**Day 3: Agent系统原型（6小时）**

```typescript
// 关键：先做最简单版本

Agent 1: 写CapyAgent基础类
  - 只实现读帖子
  - 只实现调用AI
  - 只实现生成推荐
  → 不管性能，不管优雅，先跑起来

Agent 2: 写AI调用代码
  - 简单的prompt
  - 调用Gemini
  - 返回结果
  → 先硬编码，后面再优化

// 目标：1只卡皮能推荐1个帖子
```

**Day 4-5: 迭代优化**

```typescript
// 基于Day 3的原型改进

优化1: 推荐更智能
  - 分析用户档案
  - 多个帖子对比

优化2: 添加卡皮互动
  - 简单的对话生成
  - 2只卡皮的互动

优化3: 前端展示
  - 推荐卡片
  - 日记页面
```

**Day 6-7: 部署和测试**

```bash
# Agent协助部署

Agent 1: 配置Vercel
Agent 2: 配置Google Cloud
Agent 3: 设置定时任务
Agent 4: 写测试用例

# 你的工作：
# - 提供API keys
# - 测试4个用户场景
# - 确认没有重大bug
```

---

### 具体任务拆解示例

#### 任务：实现论坛发帖功能

**❌ 错误方式（Vibe Coding）：**

```
你: "帮我实现论坛发帖功能"

Agent: [给你500行代码]

你: 😵 不知道怎么用
```

**✅ Peter方式（Agentic Engineering）：**

```
你: "Task 1: 创建发帖API"

Agent 1 prompt:
"""
实现 POST /api/posts

要求：
1. 接收参数：title, content, tags
2. 验证用户权限（Pro/Max才能发）
3. 插入到Supabase posts表
4. 返回新帖子ID

只写这个API，不要写前端。
"""

Agent 1: ✅ 完成（10分钟）

---

你: "Task 2: 创建发帖表单组件"

Agent 2 prompt:
"""
实现 src/components/forum/PostForm.tsx

要求：
1. 输入框：标题、内容、标签
2. 调用 POST /api/posts
3. 成功后跳转到帖子详情

只写表单，不要管样式。
"""

Agent 2: ✅ 完成（15分钟）

---

你: "Task 3: 美化表单"

Agent 3 prompt:
"""
优化 PostForm.tsx 的样式

要求：
1. 使用Tailwind CSS
2. 响应式设计
3. 添加加载状态

不要改逻辑，只改样式。
"""

Agent 3: ✅ 完成（10分钟）

---

总计：35分钟完成
你的工作：定义3个任务，review 3次
```

---

## 📊 Peter方式 vs 传统方式对比

### 传统方式

```
你: "做一个社区论坛"
AI: [生成大量代码]
你: 😵 不知道从哪开始
你: 花2小时理解代码
你: 发现bug
你: 不知道怎么改
循环...

总耗时：1-2周
代码质量：不可控
学习效果：差
```

### Peter方式

```
Day 1:
  你: 拆解成10个小任务
  你: 启动3个agents并行工作
  Agents: 完成基础功能
  你: Review（30分钟）

Day 2:
  你: 定义5个优化任务
  Agents: 并行优化
  你: Review（20分钟）

Day 3:
  你: 定义部署任务
  Agents: 完成部署
  你: 测试（1小时）

总耗时：3天
代码质量：可控（你review了关键部分）
学习效果：好（你理解架构）
```

---

## 🎯 关键原则总结

### 1. 任务拆解要细

```
❌ "实现论坛功能"
✅ "创建posts表"
✅ "实现GET /api/posts"
✅ "实现POST /api/posts"
✅ "创建帖子列表组件"
✅ "创建发帖表单"
```

### 2. 一次一件事

```
❌ "帮我实现发帖功能并优化性能"
✅ "先实现发帖功能"
✅ "功能完成后，再优化性能"
```

### 3. 验证每一步

```
完成一个任务 → 立即验证
✅ 能运行 → 继续下一个
❌ 有问题 → 立即修复，再继续
```

### 4. 并行 > 串行

```
如果3个任务独立：
❌ 串行：任务1 → 任务2 → 任务3（3小时）
✅ 并行：3个agents同时做（1小时）
```

### 5. 重点审查，快速略过

```
你的精力有限，聚焦在：
✅ 数据库操作
✅ 安全相关
✅ 核心逻辑

快速略过：
⏭️ UI样式
⏭️ 格式化代码
⏭️ 配置文件
```

---

## 🛠️ 实战清单

当你开始开发Capy项目时，按这个清单执行：

### 开始前

- [ ] 明确今天的目标（1-3个具体功能）
- [ ] 把目标拆解成5-10个小任务
- [ ] 确认每个任务可以在1小时内完成

### 开发中

- [ ] 一次只启动1-3个agents
- [ ] 每个agent有清晰的任务描述
- [ ] Agents完成后立即验证
- [ ] 重点审查关键代码
- [ ] 发现问题立即让agent修复

### 一天结束

- [ ] Review今天的所有代码
- [ ] 提交到Git（清晰的commit message）
- [ ] 记录明天的任务
- [ ] 如果写了凌晨3点后的代码，第二天重写 😄

---

## 📚 延伸阅读

### Peter访谈关键时刻

1. **Agentic Engineering定义**
   - 时间戳：[访谈中的位置]
   - 金句："It's not vibe coding, it's agentic engineering"

2. **多Agent协作**
   - 时间戳：[访谈中的位置]
   - 金句："Between four and 10 agents, depending on sleep"

3. **代码审查哲学**
   - 时间戳：[访谈中的位置]
   - 金句："I don't read the boring parts of code"

### 推荐资源

- Claude Code文档：https://docs.anthropic.com/claude/docs
- AI Town源码：https://github.com/a16z-infra/ai-town
- Peter的OpenClaw：https://github.com/[待补充]

---

## 🎬 下一步

现在你已经理解了Peter的方法论，可以开始：

1. **选择开发方式：**
   - [ ] 多Agent并行（Team系统）
   - [ ] 顺序式Agent协作（简单）

2. **准备环境：**
   - [ ] 本地开发
   - [ ] 云端开发（Google Cloud VM）

3. **开始第一个任务：**
   - [ ] 创建Next.js项目
   - [ ] 或者你想从其他开始？

**告诉我你的选择，我们立即开始！** 🚀
