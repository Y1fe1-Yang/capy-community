# 多模型AI系统 - 让每只Capy有独特的"AI大脑"

## 概述

Capy Community 的一大创新特性是**每只Capy使用不同的LLM模型**，让它们展现出独特的"思考风格"和个性。

这不仅是技术上的创新，更是为了让每只Capy拥有真正独特的"AI大脑"！

## 模型映射规则

系统根据以下优先级选择模型：

### 优先级1：精确名称匹配

| Capy名称 | 使用模型 | 特点 |
|---------|---------|------|
| 小懒 | Claude Opus 4.6 | 深思熟虑、有深度 |
| 小勤 | GPT-4o | 快速响应、高效 |

### 优先级2：名称关键词

| 关键词 | 使用模型 | 示例名称 |
|-------|---------|---------|
| 懒 / lazy | Claude Opus 4.6 | 懒洋洋、小懒猫 |
| 勤 / active / 活 / diligent | GPT-4o | 小勤快、活力宝宝 |
| 好奇 / curious | Gemini Pro 1.5 | 好奇宝宝、探索者 |

### 优先级3：性格类型

| 性格 (personality) | 使用模型 | 特征 |
|------------------|---------|------|
| lazy（懒散） | Claude Opus 4.6 | 深度思考，细致分析 |
| active（活泼） | GPT-4o | 快速决策，高效执行 |
| curious（好奇） | Gemini Pro 1.5 | 探索性强，多角度思考 |
| friendly/shy（友善/害羞） | DeepSeek | 经济实惠，稳定可靠 |

### 优先级4：默认模型

如果以上都不匹配，使用 **DeepSeek** 作为默认模型。

## 当前Mock数据配置

### 小懒（张三的Capy）

```typescript
{
  name: '小懒',
  personality: 'lazy',
  owner: '张三 (Max用户)',
  使用模型: 'Claude Opus 4.6 (anthropic/claude-opus-4-6)',
  特点: '深思熟虑，喜欢晒太阳，推荐内容有深度'
}
```

**推荐风格：**
- 更注重内容质量和深度
- 推荐理由详细、有思考
- 适合技术、哲学、深度阅读类内容

### 小勤（李四的Capy）

```typescript
{
  name: '小勤',
  personality: 'active',
  owner: '李四 (Max用户)',
  使用模型: 'GPT-4o (openai/gpt-4o)',
  特点: '活泼高效，到处探索，推荐内容丰富多样'
}
```

**推荐风格：**
- 快速响应，效率优先
- 推荐多样化内容
- 适合生活、美食、热门话题

## 代码实现

### 模型选择函数

```typescript
// src/lib/ai.ts

function selectModelForCapy(capy_name?: string, capy_personality?: string): string {
  // 精确匹配
  if (capy_name === '小懒') {
    return 'anthropic/claude-opus-4-6'  // Claude Opus
  }
  if (capy_name === '小勤') {
    return 'openai/gpt-4o'  // GPT-4o
  }

  // 名称关键词匹配
  if (capy_name?.includes('懒')) {
    return 'anthropic/claude-opus-4-6'
  }
  if (capy_name?.includes('勤')) {
    return 'openai/gpt-4o'
  }

  // 性格匹配
  if (capy_personality === 'lazy') {
    return 'anthropic/claude-opus-4-6'
  }
  if (capy_personality === 'active') {
    return 'openai/gpt-4o'
  }

  // 默认
  return 'deepseek/deepseek-chat'
}
```

### AI推荐生成

```typescript
// src/lib/ai.ts

export async function generateRecommendation(
  posts: Post[],
  userProfile: UserProfile
): Promise<Recommendation[]> {
  // 🎯 根据Capy选择不同的LLM模型
  const selectedModel = selectModelForCapy(
    userProfile.capy_name,
    userProfile.capy_personality
  )

  console.log(`[Capy ${userProfile.capy_name}] Using model: ${selectedModel}`)

  // 调用AI Gateway
  const response = await fetch(`${AI_GATEWAY_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AI_GATEWAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: selectedModel,  // 🔥 每只Capy用不同的模型！
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    })
  })

  // 解析并返回推荐
  return parseRecommendations(aiResponse, posts)
}
```

## 测试多模型功能

### 方法1：通过API测试

```bash
# 测试小懒（Claude Opus）
curl -H "x-user-id: 1" http://localhost:3000/api/capy
# 返回: { "capy": { "name": "小懒", "personality": "lazy" } }

curl -H "x-user-id: 1" http://localhost:3000/api/capy/recommendations
# 小懒会使用 Claude Opus 4.6 生成推荐

# 测试小勤（GPT-4o）
curl -H "x-user-id: 2" http://localhost:3000/api/capy
# 返回: { "capy": { "name": "小勤", "personality": "active" } }

curl -H "x-user-id: 2" http://localhost:3000/api/capy/recommendations
# 小勤会使用 GPT-4o 生成推荐
```

### 方法2：查看日志

启动服务器后，调用推荐API时会看到日志：

```bash
npm run dev

# 日志示例
[AI] 🦫 小懒 is using Claude Opus 4.6 (lazy & contemplative)
[Capy 小懒] Using model: anthropic/claude-opus-4-6

[AI] 🦫 小勤 is using GPT-4o (diligent & efficient)
[Capy 小勤] Using model: openai/gpt-4o
```

## AI Gateway配置

需要配置环境变量连接到AI Gateway：

```bash
# .env.local
AI_GATEWAY_BASE_URL=https://ai-gateway.happycapy.ai/api/v1/openai/v1
AI_GATEWAY_API_KEY=your-api-key-here
```

AI Gateway支持的模型格式：
- `anthropic/claude-opus-4-6` - Claude Opus 4.6
- `openai/gpt-4o` - GPT-4o
- `google/gemini-pro-1.5` - Gemini Pro 1.5
- `deepseek/deepseek-chat` - DeepSeek Chat

## 扩展新模型

要添加新的Capy和模型映射：

### 步骤1：在Mock数据中添加新Capy

```typescript
// src/lib/mock-data.ts

export const mockCapys: CapyAgent[] = [
  // ... 现有的小懒、小勤
  {
    id: 'capy3',
    user_id: '5',
    name: '好奇宝宝',
    personality: 'curious' as CapyPersonality,
    // ... 其他配置
  }
]
```

### 步骤2：模型会自动映射

由于 `selectModelForCapy` 函数已经支持关键词匹配，新的"好奇宝宝"会自动使用Gemini Pro：

```typescript
// 自动识别
if (capy_name?.includes('好奇') || capy_personality === 'curious') {
  return 'google/gemini-pro-1.5'  // Gemini Pro
}
```

### 步骤3：测试

```bash
curl -H "x-user-id: 5" http://localhost:3000/api/capy/recommendations
# 日志: [AI] 🦫 好奇宝宝 is using Gemini Pro (detected "curious" in name)
```

## 模型特点对比

| 特性 | Claude Opus 4.6 | GPT-4o | Gemini Pro 1.5 | DeepSeek |
|-----|----------------|--------|----------------|----------|
| 响应速度 | 中等 | 快 | 快 | 最快 |
| 思考深度 | 极高 | 高 | 高 | 中等 |
| 创意性 | 极高 | 高 | 极高 | 中等 |
| 成本 | 高 | 中 | 中 | 低 |
| 适合Capy | 懒散、深思型 | 活泼、高效型 | 好奇、探索型 | 友善、经济型 |

## 为什么使用多模型？

### 1. 展示AI多样性

不同LLM有不同的"思考方式"：
- Claude更擅长深度分析和细致推理
- GPT-4o更擅长快速决策和广泛知识
- Gemini更擅长多角度思考和创意
- DeepSeek更擅长成本效益和稳定性

### 2. 增强用户体验

每只Capy都有独特的"AI大脑"，让用户感受到：
- 小懒的推荐更有深度和思考
- 小勤的推荐更快速和全面
- 不同Capy真的"想法不同"

### 3. 技术展示

这是一个很好的技术展示案例：
- 单一代码库支持多个LLM
- 智能模型选择策略
- OpenAI兼容的API统一接口

### 4. 灵活扩展

未来可以：
- 添加更多模型（如Llama、Mistral等）
- 让用户选择Capy的"AI大脑"
- 根据任务类型动态切换模型
- A/B测试不同模型效果

## 常见问题

### Q: Mock模式下会真正调用AI吗？

A: Mock模式只提供静态的推荐数据。真正的AI调用需要：
1. 配置AI Gateway环境变量
2. 连接真实的Supabase
3. 调用 `/api/capy/recommendations` API

### Q: 如何添加新的LLM模型？

A: 在 `src/lib/ai.ts` 的 `CAPY_MODELS` 中添加：

```typescript
const CAPY_MODELS = {
  // ... 现有模型
  NEW_MODEL: 'provider/model-name',
} as const
```

然后在 `selectModelForCapy` 函数中添加选择逻辑。

### Q: 可以让用户自己选择模型吗？

A: 可以！未来可以在Capy创建/配置界面添加模型选择器：

```typescript
// 用户配置
{
  capy_name: '我的Capy',
  personality: 'custom',
  preferred_model: 'anthropic/claude-opus-4-6'  // 用户选择
}

// 在 selectModelForCapy 中优先使用用户选择
if (userProfile.preferred_model) {
  return userProfile.preferred_model
}
```

### Q: 不同模型的成本如何？

A: 通过AI Gateway，成本由Gateway提供商管理。大致比例：
- Claude Opus 4.6: 最贵
- GPT-4o: 中等
- Gemini Pro: 中等
- DeepSeek: 最便宜

建议：
- 免费用户：使用DeepSeek
- 付费用户：可选择更高级的模型

## 总结

多模型AI系统让Capy Community的每只Capy都拥有独特的"AI大脑"：

- **小懒** 用 Claude Opus 深思熟虑
- **小勤** 用 GPT-4o 快速高效
- **好奇宝宝** 用 Gemini Pro 探索创新

这不仅是技术实现，更是为用户创造了真正有个性的AI宠物体验！

## 相关文件

- `/home/node/a0/workspace/393918fd-6116-4ef3-b58f-c0db97e4ec3c/workspace/capy-community/src/lib/ai.ts` - AI调用和模型选择逻辑
- `/home/node/a0/workspace/393918fd-6116-4ef3-b58f-c0db97e4ec3c/workspace/capy-community/src/lib/capy-agent.ts` - Capy Agent核心逻辑
- `/home/node/a0/workspace/393918fd-6116-4ef3-b58f-c0db97e4ec3c/workspace/capy-community/src/lib/mock-data.ts` - Mock数据配置
- `/home/node/a0/workspace/393918fd-6116-4ef3-b58f-c0db97e4ec3c/workspace/capy-community/docs/MOCK_MODE.md` - Mock模式使用指南
