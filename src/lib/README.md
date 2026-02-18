# Capy Agent System - 核心实现

**创建日期:** 2026-02-18
**实现者:** ai-agent-developer
**状态:** ✅ 核心完成，等待数据库集成

---

## 🚨 权限系统说明

**重要：卡皮系统是Max用户专属功能！**

| 用户类型 | 论坛权限 | 卡皮系统 |
|---------|---------|---------|
| Free | 只读 | ❌ 无卡皮 |
| Pro | 发帖+评论 | ❌ 无卡皮 |
| Max | 完整权限 | ✅ 有AI卡皮宠物 |

**实现要求:**
- API `/api/capy/recommendations` 必须验证 `plan_type === 'max'`
- 前端 `/my-capy` 页面只对Max用户可见
- `capy_agents` 表中的 `user_id` 必须都是Max tier用户
- 非Max用户访问返回 403 Forbidden

---

## 📁 已完成的文件

### 1. `/src/lib/ai.ts` - Gemini AI客户端

**功能:**
- Gemini 2.0 Flash集成
- 基于卡皮性格的个性化推荐
- 智能prompt构建
- JSON响应解析和验证

**关键函数:**
- `generateRecommendation(posts, userProfile)` - 主要AI推荐引擎
- `buildRecommendationPrompt()` - 构建个性化prompt
- `parseRecommendations()` - 解析AI响应

**依赖:**
- `@google/generative-ai` (需要安装)
- `GEMINI_API_KEY` 环境变量

---

### 2. `/src/lib/capy-agent.ts` - CapyAgent核心类

**功能:**
- 实现完整的Agent循环: Perceive → Decide → Act → Remember
- 支持个性化推荐生成
- 可扩展的交互历史记录

**核心方法:**
- `perceive()` - 读取论坛帖子
- `decide()` - AI分析生成推荐
- `act()` - 保存推荐到数据库
- `remember()` - 记录互动历史
- `run()` - 执行完整Agent循环

**设计特点:**
- 清晰的职责分离
- 丰富的日志输出
- 错误处理机制
- 工厂函数支持

---

### 3. `/src/app/api/capy/recommendations/route.ts` - API端点

**端点:**
```
GET /api/capy/recommendations
  - limit: 返回数量 (default: 3)
  - refresh: 强制刷新 (default: false)
```

**功能:**
- 获取用户的AI推荐
- 支持缓存和刷新
- 权限验证 (Max用户专属)
- 错误处理

**返回格式:**
```typescript
{
  recommendations: [
    {
      id: string
      user_id: string
      post_id: string
      post_title: string
      reason: string
      confidence: number
      created_at: string
    }
  ],
  cached: boolean
}
```

---

### 4. `/src/lib/supabase.ts` - 数据库客户端框架

**提供:**
- Supabase客户端创建函数
- TypeScript类型定义框架
- 数据库表接口定义

**注意:** 需要database-agent完成具体实现

---

## 🔗 依赖关系

```
ai.ts (Gemini AI)
    ↓
capy-agent.ts (Agent逻辑)
    ↓
route.ts (API端点)
    ↓
supabase.ts (数据库) ← 需要database-agent完成
```

---

## ⚠️ 待完成的集成点

### 需要 database-agent 完成:

1. **数据库表创建:**
   ```sql
   -- capy_recommendations 表
   -- 注意: 只有Max用户才会有推荐记录
   CREATE TABLE capy_recommendations (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES users(id),
     post_id UUID NOT NULL REFERENCES posts(id),
     post_title TEXT NOT NULL,
     reason TEXT NOT NULL,
     confidence FLOAT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),

     -- 确保只有Max用户才能有推荐
     CONSTRAINT check_max_user CHECK (
       user_id IN (SELECT id FROM users WHERE plan_type = 'max')
     )
   );

   -- capy_agents 表 (存储卡皮信息)
   -- 🚨 CRITICAL: 只有Max用户才能拥有卡皮！
   CREATE TABLE capy_agents (
     user_id UUID PRIMARY KEY REFERENCES users(id),
     name TEXT NOT NULL,
     personality TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),

     -- 强制约束: 只有Max tier用户才能创建卡皮
     CONSTRAINT check_max_only CHECK (
       user_id IN (SELECT id FROM users WHERE plan_type = 'max')
     )
   );

   -- 为性能优化创建索引
   CREATE INDEX idx_capy_recommendations_user_id ON capy_recommendations(user_id);
   CREATE INDEX idx_capy_recommendations_created_at ON capy_recommendations(created_at DESC);
   ```

2. **实现数据库查询:**
   - `CapyAgent.perceive()` - 查询最新帖子
   - `CapyAgent.act()` - 保存推荐结果
   - API路由中的用户验证和权限检查

3. **Supabase客户端:**
   - 完善 `src/lib/supabase.ts`
   - 配置环境变量
   - 生成TypeScript类型

### 需要 frontend-developer 完成:

1. **推荐展示页面:**
   - 创建 `/my-capy` 页面（🚨 只对Max用户可见）
   - 调用 API: `GET /api/capy/recommendations`
   - 展示推荐内容和理由
   - 非Max用户访问时显示升级提示

2. **UI组件:**
   - RecommendationCard - 单个推荐卡片
   - CapyAvatar - 卡皮头像
   - RefreshButton - 刷新推荐按钮
   - MaxOnlyBadge - Max用户专属标识

3. **权限控制:**
   - 导航栏中的"我的卡皮"链接只对Max用户显示
   - 路由保护: 非Max用户访问 `/my-capy` 重定向到升级页面
   - API调用失败时显示友好的权限提示

---

## 🚀 快速测试

### 1. 安装依赖

```bash
npm install @google/generative-ai @supabase/supabase-js
```

### 2. 配置环境变量

```env
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. 测试AI推荐 (独立测试)

```typescript
// test-agent.ts
import { CapyAgent } from './src/lib/capy-agent'

const agent = new CapyAgent(
  'test-user-1',
  '小懒',
  'test-user-1',
  '懒散随性 - 喜欢轻松有趣的内容'
)

// 模拟数据测试
const mockPosts = [
  {
    id: '1',
    title: '如何提高工作效率？',
    content: '分享一些时间管理技巧...',
    category: 'productivity',
    user_name: '张三',
    score: 10,
    likes_count: 5,
    comment_count: 3,
    created_at: new Date().toISOString()
  }
]

const recommendations = await agent.decide(mockPosts)
console.log(recommendations)
```

### 4. 测试API端点

```bash
# 启动开发服务器
npm run dev

# 访问API
curl http://localhost:3000/api/capy/recommendations?limit=3
```

---

## 📊 性能估算

### AI调用成本:
- Gemini 2.0 Flash: ~$0.0001/请求
- 每用户每天1次推荐: ~$0.003/月/用户
- 100个Max用户: ~$0.30/月

### 响应时间:
- AI推荐生成: 1-3秒
- 数据库查询: <100ms
- 总计: 约2-4秒 (首次)
- 缓存命中: <100ms

---

## 🎯 下一步建议

### 立即可做:
1. database-agent: 创建数据库表
2. frontend-developer: 创建展示页面
3. 集成测试: 端到端流程验证

### 后续优化:
1. **缓存策略:** 推荐结果缓存24小时
2. **批量处理:** 定时任务批量生成推荐
3. **个性化学习:** 根据用户反馈调整推荐
4. **多样性:** 避免重复推荐同一帖子

---

## 💡 关键设计决策

### 为什么用Gemini而不是OpenAI？
- 更低成本 ($0.0001 vs $0.003)
- 免费额度更高
- 性能足够好

### 为什么实时生成而不是定时任务？
- MVP阶段简单优先
- 用户量小时实时生成可接受
- 后期可以改为定时任务

### 为什么限制1-3个推荐？
- 避免信息过载
- 提高推荐质量
- 降低AI成本

---

## 📞 联系和协作

**问题反馈:**
- AI相关: 找 ai-agent-developer
- 数据库: 找 database-agent
- 前端: 找 frontend-developer

**相关文档:**
- [PROJECT_MEMORY.md](../../docs/PROJECT_MEMORY.md)
- [AGENT_TASKS.md](../../docs/AGENT_TASKS.md)

---

**状态更新:** 2026-02-18
✅ CapyAgent核心完成
⏳ 等待数据库集成
⏳ 等待前端集成
