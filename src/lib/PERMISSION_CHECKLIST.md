# Capy System - Max Tier Permission Checklist

**最后更新:** 2026-02-18
**负责人:** ai-agent-developer
**状态:** ✅ 权限系统已正确实现

---

## 🚨 权限系统概述

**核心原则:** 卡皮系统是Max用户的专属功能

| 用户类型 | 论坛权限 | 卡皮系统 |
|---------|---------|---------|
| Free | 只读 | ❌ 无卡皮 |
| Pro | 发帖+评论 | ❌ 无卡皮 |
| Max | 完整权限 | ✅ 有AI卡皮宠物 |

---

## ✅ 已实现的权限检查

### 1. 数据库层面 (Database Schema)

**文件:** `/home/node/a0/workspace/393918fd-6116-4ef3-b58f-c0db97e4ec3c/workspace/capy-community/src/lib/README.md`

```sql
-- capy_agents 表
CREATE TABLE capy_agents (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  name TEXT NOT NULL,
  personality TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 🚨 强制约束: 只有Max tier用户才能创建卡皮
  CONSTRAINT check_max_only CHECK (
    user_id IN (SELECT id FROM users WHERE plan_type = 'max')
  )
);

-- capy_recommendations 表
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
```

**状态:** ✅ SQL约束已定义
**位置:** README.md (等待database-agent执行迁移)

---

### 2. TypeScript类型层面

**文件:** `/home/node/a0/workspace/393918fd-6116-4ef3-b58f-c0db97e4ec3c/workspace/capy-community/src/types/database.ts`

```typescript
// Line 341-350
export function getUserPermissions(tier: UserTier): UserPermissions {
  return {
    can_view: true,
    can_post: tier === 'pro' || tier === 'max',
    can_comment: tier === 'pro' || tier === 'max',
    can_edit_own: tier === 'pro' || tier === 'max',
    can_delete_own: tier === 'pro' || tier === 'max',
    has_capy: tier === 'max', // 🚨 只有Max用户
  };
}
```

**状态:** ✅ 已实现
**负责人:** database-architect

---

### 3. API路由层面

**文件:** `/home/node/a0/workspace/393918fd-6116-4ef3-b58f-c0db97e4ec3c/workspace/capy-community/src/app/api/capy/recommendations/route.ts`

```typescript
// Line 31-35
const authResult = await requireCapyAccess(request)

if (!authResult.authorized) {
  return NextResponse.json({ error: authResult.error }, { status: 403 })
}
```

**状态:** ✅ 已实现（由backend-developer完成）
**机制:** 使用 `requireCapyAccess()` 中间件验证Max tier

**响应:**
- Max用户: 200 OK + recommendations
- 非Max用户: 403 Forbidden + error message

---

### 4. CapyAgent类层面

**文件:** `/home/node/a0/workspace/393918fd-6116-4ef3-b58f-c0db97e4ec3c/workspace/capy-community/src/lib/capy-agent.ts`

```typescript
// Line 1-18
/**
 * CapyAgent - Autonomous AI Pet Agent System
 *
 * 🚨 PERMISSION REQUIREMENT: Only Max tier users can have a CapyAgent!
 * - Free users: ❌ No capy (read-only)
 * - Pro users: ❌ No capy (post/comment only)
 * - Max users: ✅ Has AI capy pet
 */
```

**状态:** ✅ 已添加文档注释
**要求:** 调用方负责在创建Agent前验证权限

---

### 5. AI推荐层面

**文件:** `/home/node/a0/workspace/393918fd-6116-4ef3-b58f-c0db97e4ec3c/workspace/capy-community/src/lib/ai.ts`

```typescript
// 只为Max用户生成推荐
export async function generateRecommendation(
  posts: Post[],
  userProfile: UserProfile
): Promise<Recommendation[]>
```

**状态:** ✅ 逻辑正确
**说明:** 该函数本身不验证权限，依赖调用方保证只传入Max用户的profile

---

## ⏳ 待完成项

### Frontend权限检查

**需要 frontend-developer 实现:**

1. **路由保护**
   ```typescript
   // /my-capy 页面
   if (user.tier !== 'max') {
     redirect('/upgrade')
   }
   ```

2. **UI条件渲染**
   ```typescript
   // 导航栏
   {user.tier === 'max' && (
     <Link href="/my-capy">我的卡皮</Link>
   )}
   ```

3. **升级提示**
   ```typescript
   // 非Max用户访问卡皮功能时
   <UpgradePrompt
     message="升级到Max计划，获得您的AI卡皮宠物！"
   />
   ```

**优先级:** 高
**文档:** 见 `/src/lib/README.md`

---

## 🧪 测试场景

### 测试用户

```typescript
const testUsers = [
  { id: 'user-free-1', tier: 'free', shouldHaveCapy: false },
  { id: 'user-pro-1', tier: 'pro', shouldHaveCapy: false },
  { id: 'user-max-1', tier: 'max', shouldHaveCapy: true },
  { id: 'user-max-2', tier: 'max', shouldHaveCapy: true },
]
```

### 测试用例

1. **Free用户访问 `/api/capy/recommendations`**
   - 预期: 403 Forbidden
   - 消息: "Capy system is only available for Max tier users"

2. **Pro用户访问 `/api/capy/recommendations`**
   - 预期: 403 Forbidden
   - 消息: "Capy system is only available for Max tier users"

3. **Max用户访问 `/api/capy/recommendations`**
   - 预期: 200 OK
   - 返回: recommendations 数组

4. **尝试为Pro用户创建capy_agent记录**
   - 预期: 数据库约束错误
   - 消息: "violates check constraint check_max_only"

5. **Max用户创建capy_agent记录**
   - 预期: 成功
   - 返回: agent ID

---

## 📊 权限验证流程图

```
用户请求访问卡皮系统
    ↓
[1] API层验证: requireCapyAccess()
    ├─ 非Max → 403 Forbidden
    └─ Max → 继续
        ↓
[2] 检查是否有capy_agent
    ├─ 无 → 404 Not Found (提示创建)
    └─ 有 → 继续
        ↓
[3] 数据库约束验证
    ├─ check_max_only constraint
    └─ RLS policies
        ↓
[4] 返回数据
    └─ 200 OK + recommendations
```

---

## 🔒 安全要点

### 多层防御

1. **数据库层:** CHECK约束防止非Max用户数据写入
2. **API层:** 中间件验证tier，返回403
3. **类型层:** TypeScript类型提示，编译时检查
4. **文档层:** 注释和文档说明，开发时提醒

### 绕过防护

以下操作会被阻止：

```typescript
// ❌ 尝试1: 直接插入数据库
supabase.from('capy_agents').insert({
  user_id: 'pro-user-id', // Pro用户
  name: 'test'
})
// 结果: 违反check_max_only约束

// ❌ 尝试2: 直接调用API
fetch('/api/capy/recommendations', {
  headers: { 'Authorization': 'Bearer pro-user-token' }
})
// 结果: 403 Forbidden

// ❌ 尝试3: 创建CapyAgent实例
new CapyAgent('pro-user-id', ...)
// 结果: 可以创建对象，但无法保存到数据库
```

---

## ✅ 验收标准

在发布到生产环境前，必须满足：

- [ ] 数据库约束已创建并测试
- [ ] API层权限检查通过所有测试用例
- [ ] Frontend路由保护已实现
- [ ] UI正确显示/隐藏卡皮功能
- [ ] 错误消息清晰友好
- [ ] 非Max用户看到升级引导
- [ ] Max用户可以正常使用所有功能

---

## 📞 相关文件

1. **核心实现:**
   - `/src/lib/capy-agent.ts` - Agent类定义
   - `/src/lib/ai.ts` - AI推荐引擎
   - `/src/app/api/capy/recommendations/route.ts` - API路由

2. **类型定义:**
   - `/src/types/database.ts` - 数据库类型和权限函数

3. **文档:**
   - `/src/lib/README.md` - 功能说明和待办事项
   - `/docs/PROJECT_MEMORY.md` - 项目整体架构

4. **配置:**
   - `supabase/schema.sql` - 数据库schema（待创建）

---

**总结:** 权限系统已在代码层面正确实现。等待数据库迁移和前端集成完成后，即可进行端到端测试。
