# 上下文管理系统 - 避免AI遗忘

> **核心问题：** AI没有持久记忆，每次对话都是"失忆"的
> **解决方案：** 外部化记忆，让AI能"找到"而非"记住"

---

## 🧠 问题分析

### AI的记忆限制

```
问题1: 会话结束即遗忘
  你今天: "创建用户表，用UUID主键"
  明天AI: "啊？我不知道用户表是什么结构"

问题2: 上下文窗口有限
  你: [贴了3000行讨论]
  AI: "我只能处理前2000行，后面的忘了"

问题3: 无法跨Agent共享
  Agent A: "我实现了posts API"
  Agent B: "posts API是什么？我不知道"
```

### 传统方案的问题

```
❌ 方案1: 让AI记住
  "请记住用户表用UUID"
  → AI下次还是会忘

❌ 方案2: 每次都告诉AI
  每次对话都贴一遍所有信息
  → Token浪费，效率低

❌ 方案3: 依赖向量数据库
  把所有对话存RAG
  → 过度工程化，对小项目不友好
```

---

## ✅ 我们的方案：结构化外部记忆

### 核心理念

> **"Don't make AI remember, make AI able to find"**
> 不让AI记住，让AI能找到

### 四层记忆系统

```
Layer 1: 项目记忆 (PROJECT_MEMORY.md)
  - 项目是什么？
  - 当前状态？
  - 关键决策？
  → Agent必读，5分钟快速了解全局

Layer 2: 任务队列 (AGENT_TASKS.md)
  - 有哪些任务？
  - 我该做什么？
  - 其他人在做什么？
  → Agent找到自己的工作

Layer 3: 上下文片段 (docs/CONTEXT/*.md)
  - 数据库设计细节
  - API接口规范
  - Agent行为逻辑
  → Agent深入理解特定主题

Layer 4: 工作日志 (.agent-logs/*.log)
  - 谁做了什么？
  - 什么时候做的？
  - 结果如何？
  → Agent了解历史

```

---

## 📁 文件结构

```
docs/
├── PROJECT_MEMORY.md       # Layer 1: 项目记忆
├── AGENT_TASKS.md          # Layer 2: 任务队列
├── CONTEXT_SYSTEM.md       # 本文件：系统说明
│
├── CONTEXT/                # Layer 3: 上下文片段
│   ├── architecture.md     # 架构设计
│   ├── database-schema.md  # 数据库设计
│   ├── api-design.md       # API规范
│   ├── agent-behavior.md   # Agent行为逻辑
│   ├── user-permissions.md # 权限系统
│   └── ui-components.md    # UI组件规范
│
└── DECISIONS.md            # 重大决策记录

.agent-logs/                # Layer 4: 工作日志
├── 2026-02-18.log
├── 2026-02-19.log
└── decisions.log
```

---

## 🎯 Agent启动协议

### 任何Agent开始工作前必须执行

```typescript
async function agentBootstrap() {
  console.log('🚀 Agent启动...')

  // Step 1: 读取项目记忆（必读）
  const projectMemory = await readFile('docs/PROJECT_MEMORY.md')
  console.log('✅ 已加载项目记忆')

  // Step 2: 读取任务队列
  const tasks = await readFile('docs/AGENT_TASKS.md')
  const myTask = findMyTask(tasks, this.name)
  console.log(`✅ 找到我的任务: ${myTask.id}`)

  // Step 3: 读取相关上下文
  const contextFiles = myTask.relatedDocs || []
  for (const file of contextFiles) {
    const context = await readFile(`docs/CONTEXT/${file}`)
    console.log(`✅ 已加载上下文: ${file}`)
  }

  // Step 4: 读取最近日志
  const recentLogs = await readFile('.agent-logs/latest.log')
  console.log('✅ 已了解最新进展')

  console.log('🎯 Agent就绪，开始工作')

  return {
    projectMemory,
    myTask,
    contexts: contextFiles,
    recentLogs
  }
}
```

**时间成本：** 15分钟启动成本，避免1小时返工

---

## 📝 上下文片段编写规范

### 模板：CONTEXT/[topic].md

```markdown
# [主题名称]

**创建时间：** YYYY-MM-DD
**最后更新：** YYYY-MM-DD
**相关任务：** Task X.Y, Task A.B
**相关文件：** src/xxx.ts, src/yyy.ts

---

## 🎯 这个文档讲什么？

1-2句话概述

---

## 📋 详细说明

### 核心概念

### 设计决策

### 实现细节

### 代码示例

```typescript
// 示例代码
```

### 注意事项

---

## 🔗 相关文档

- docs/CONTEXT/xxx.md
- docs/PROJECT_MEMORY.md

---

## 📝 更新日志

[YYYY-MM-DD] 初始版本
[YYYY-MM-DD] 更新了XXX
```

---

## 🔄 自我更新机制

### 触发条件

```
何时创建新的上下文片段？

1. 新的架构决策
   例: 决定用Supabase而非Firebase
   → 创建 CONTEXT/why-supabase.md

2. 复杂的技术方案
   例: Agent间通信机制
   → 创建 CONTEXT/agent-communication.md

3. 重要的代码规范
   例: API返回格式
   → 创建 CONTEXT/api-conventions.md

4. 踩过的坑
   例: Supabase RLS配置问题
   → 创建 CONTEXT/troubleshooting-supabase.md
```

### 更新流程

```typescript
async function createContextDoc(topic, content) {
  // 1. 创建文件
  const filename = `docs/CONTEXT/${topic}.md`
  await writeFile(filename, content)

  // 2. 更新PROJECT_MEMORY引用
  await updateProjectMemory({
    section: '重要文档',
    add: `- [${topic}](./CONTEXT/${topic}.md)`
  })

  // 3. 记录日志
  await appendLog({
    type: 'context_created',
    topic,
    filename,
    timestamp: new Date()
  })

  console.log(`✅ 创建上下文文档: ${filename}`)
}
```

---

## 📊 Agent工作日志规范

### 日志格式

```log
[时间] [Agent名称] [任务ID]
状态: ✅成功 / ❌失败 / ⚠️警告
描述: 简短描述
文件: 修改/创建的文件列表
决策: 如果有重要决策
问题: 如果遇到问题
耗时: X分钟

---
```

### 示例

```log
[2026-02-18 10:30:00] database-agent Task-1.2
状态: ✅成功
描述: 创建users表和posts表
文件:
  - supabase/migrations/001_create_users.sql
  - supabase/migrations/002_create_posts.sql
决策:
  - 使用UUID而非自增ID（考虑未来分布式）
  - posts表添加soft_delete字段（而非真删除）
耗时: 25分钟

---

[2026-02-18 11:00:00] frontend-agent Task-2.1
状态: ⚠️警告
描述: 实现帖子列表页面，遇到样式问题
文件:
  - src/app/forum/page.tsx
  - src/components/forum/PostCard.tsx
问题:
  - Tailwind的responsive breakpoints在小屏不生效
  - 需要调整md:grid-cols-2配置
解决: 改用lg:grid-cols-2
耗时: 40分钟

---
```

### 自动化日志

```typescript
// Agent工作包装器

async function executeTask(taskId, workFn) {
  const startTime = Date.now()

  await appendLog(`[${new Date()}] ${this.name} ${taskId}`)
  await appendLog(`状态: 🔄进行中`)

  try {
    const result = await workFn()

    const duration = Math.round((Date.now() - startTime) / 60000)

    await appendLog(`状态: ✅成功`)
    await appendLog(`描述: ${result.description}`)
    await appendLog(`文件:`)
    for (const file of result.files) {
      await appendLog(`  - ${file}`)
    }
    if (result.decisions) {
      await appendLog(`决策:`)
      for (const decision of result.decisions) {
        await appendLog(`  - ${decision}`)
      }
    }
    await appendLog(`耗时: ${duration}分钟`)
    await appendLog(`---\n`)

    return result

  } catch (error) {
    await appendLog(`状态: ❌失败`)
    await appendLog(`错误: ${error.message}`)
    await appendLog(`---\n`)
    throw error
  }
}
```

---

## 🔍 上下文检索系统

### Agent如何找到需要的信息？

```typescript
class ContextFinder {

  // 方法1: 基于任务自动推荐
  async findByTask(taskId) {
    // 读取任务描述
    const task = await getTask(taskId)

    // 提取关键词
    const keywords = extractKeywords(task.description)

    // 匹配上下文文档
    const docs = await matchDocs(keywords)

    return docs
  }

  // 方法2: 基于文件路径推荐
  async findByFile(filepath) {
    // 例: 正在修改 src/agents/capy-agent.ts
    // → 自动推荐 docs/CONTEXT/agent-behavior.md

    const mapping = {
      'src/agents/**': ['agent-behavior.md', 'agent-communication.md'],
      'src/app/api/**': ['api-design.md', 'api-conventions.md'],
      'supabase/**': ['database-schema.md', 'supabase-config.md']
    }

    return findMatchingDocs(filepath, mapping)
  }

  // 方法3: 直接搜索
  async search(query) {
    // 简单的全文搜索
    const allDocs = await getAllContextDocs()

    const results = allDocs.filter(doc =>
      doc.content.toLowerCase().includes(query.toLowerCase())
    )

    return results
  }
}
```

### 使用示例

```typescript
// Agent开始工作时

async function startWork(taskId) {
  // 1. 自动找到相关文档
  const contexts = await contextFinder.findByTask(taskId)

  console.log('📚 相关文档:')
  for (const ctx of contexts) {
    console.log(`  - ${ctx.filename}`)
    await readFile(ctx.path) // 读取并理解
  }

  // 2. 开始工作
  await doWork()

  // 3. 如果遇到不理解的，再搜索
  if (confused) {
    const moreContexts = await contextFinder.search('权限系统')
    // 找到更多资料
  }
}
```

---

## 🎓 最佳实践

### DO: 应该做的

```
✅ 每次重要讨论后，立即写成文档
  讨论: "我们用Supabase RLS做权限"
  → 立即创建 CONTEXT/permissions-with-rls.md

✅ 文档要自包含（self-contained）
  读者不需要翻其他文档就能理解这个

✅ 包含代码示例
  不只是抽象描述，给具体例子

✅ 记录决策理由
  不只说"用UUID"，要说"为什么用UUID"

✅ 定期回顾和更新
  每周review一次，删除过时的
```

### DON'T: 不应该做的

```
❌ 不要依赖AI记忆
  "你还记得上次我们说的XXX吗？"
  → AI不记得，写成文档

❌ 不要写过长的文档
  单个文档>5000字就该拆分
  → 拆成多个主题文档

❌ 不要重复信息
  不要在多个文档里写同样的内容
  → 一个地方写，其他地方链接

❌ 不要忘记更新
  架构变了，文档没更新
  → 定期review
```

---

## 🔧 工具支持

### 自动化脚本

```bash
# 1. 快速创建上下文文档
./scripts/create-context.sh [topic]

# 2. 搜索上下文
./scripts/search-context.sh [keyword]

# 3. 生成最近工作报告
./scripts/recent-activity.sh [days]

# 4. 检查文档一致性
./scripts/check-docs.sh
```

### Agent辅助工具

```typescript
// src/lib/context-helper.ts

export class ContextHelper {
  // 快速读取项目记忆
  async getProjectMemory() { }

  // 获取我的任务
  async getMyTask(agentName) { }

  // 记录工作日志
  async logWork(entry) { }

  // 创建上下文文档
  async createContext(topic, content) { }

  // 搜索
  async search(query) { }
}
```

---

## 📈 效果评估

### 成功指标

```
指标1: Agent启动时间
  目标: <15分钟
  测量: 从启动到开始实际工作的时间

指标2: 返工率
  目标: <10%
  测量: 因为理解错误需要重做的任务比例

指标3: 上下文查阅率
  目标: >80%
  测量: Agent主动阅读文档的比例

指标4: 文档覆盖率
  目标: >90%
  测量: 重要决策有文档记录的比例
```

### 持续改进

```
每周回顾:
1. 哪些信息Agents经常找不到？
   → 补充文档

2. 哪些文档从不被读？
   → 删除或合并

3. 哪些任务经常返工？
   → 改进文档质量

4. Agents提出了哪些问题？
   → 说明文档不够清晰
```

---

## 🎯 快速上手

### 人类：如何维护这个系统？

```
1. 每次重要讨论后（5分钟）
   写入 PROJECT_MEMORY.md 或创建 CONTEXT/xxx.md

2. 每次分配任务时（3分钟）
   更新 AGENT_TASKS.md

3. 每天结束时（10分钟）
   查看 .agent-logs/today.log
   更新 PROJECT_MEMORY.md 的进度

4. 每周回顾（30分钟）
   清理过时文档
   补充缺失文档
```

### Agent：如何使用这个系统？

```
1. 启动时（15分钟）
   按顺序读取:
   - PROJECT_MEMORY.md
   - AGENT_TASKS.md
   - 相关CONTEXT/*.md
   - .agent-logs/latest.log

2. 工作中（持续）
   遇到疑问 → 搜索CONTEXT/
   不确定 → 检查DECISIONS.md

3. 完成时（5分钟）
   写入工作日志
   更新任务状态
   如有新发现 → 创建新文档
```

---

## 🚀 下一步

已创建的文档：
- ✅ PROJECT_MEMORY.md
- ✅ AGENT_TASKS.md
- ✅ CONTEXT_SYSTEM.md (本文件)

待创建的文档：
- [ ] CONTEXT/architecture.md
- [ ] CONTEXT/database-schema.md
- [ ] CONTEXT/agent-behavior.md
- [ ] DECISIONS.md

**现在可以开始实际开发了！**

每个Agent开始工作前，先读这些文档，就能避免遗忘问题。
