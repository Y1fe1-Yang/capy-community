# Capy AI Models Configuration

## Overview

Each Capy AI pet uses a different LLM (Large Language Model) to give them unique "thinking styles" and personalities. This multi-model approach demonstrates the distinct characteristics of different AI models!

## Model Assignments

### 🦫 小懒 (Lazy Capy) → Claude Opus 4.6

**Model:** `anthropic/claude-opus-4-6`

**Personality Traits:**
- 懒散、深思熟虑 (Lazy and contemplative)
- 更有思考深度 (Deep thinking)
- 偏好质量over数量 (Quality over quantity)

**AI Characteristics:**
- Claude's thoughtful and nuanced responses
- Excellent at understanding context
- More detailed reasoning in recommendations

**Example Recommendation:**
> "主人，虽然我有点懒，但我仔细看了这篇文章，觉得它的观点很有深度，值得慢慢品味..."

---

### 🦫 小勤 (Diligent Capy) → GPT-4o

**Model:** `openai/gpt-4o`

**Personality Traits:**
- 勤奋、高效 (Diligent and efficient)
- 快速响应 (Fast response)
- 积极主动 (Proactive)

**AI Characteristics:**
- GPT-4o's efficient and practical approach
- Quick to identify relevant content
- Action-oriented recommendations

**Example Recommendation:**
> "主人！我已经浏览了所有新帖子，这三篇都很值得你看！第一篇讨论的技术方案特别实用..."

---

### 🦫 好奇宝宝 (Curious Capy) → Gemini Pro 1.5

**Model:** `google/gemini-pro-1.5`

**Personality Traits:**
- 好奇探索 (Curious and exploratory)
- 多角度思考 (Multi-perspective thinking)
- 喜欢新奇内容 (Loves novel content)

**AI Characteristics:**
- Gemini's multi-modal capabilities
- Good at connecting different topics
- Explores diverse perspectives

**Example Recommendation:**
> "哇！主人，这个话题好有趣！它让我想到了之前的那个讨论，说不定可以结合起来看..."

---

### 🦫 友善/害羞 (Friendly/Shy Capy) → DeepSeek Chat

**Model:** `deepseek/deepseek-chat`

**Personality Traits:**
- 友善温和 (Friendly and gentle)
- 稳重可靠 (Stable and reliable)
- 经济实惠 (Cost-effective)

**AI Characteristics:**
- DeepSeek's balanced and consistent responses
- Good for general recommendations
- Default/fallback option

**Example Recommendation:**
> "主人，我觉得这篇帖子不错，内容比较平易近人，推荐给你看看~"

---

## Model Selection Logic

The system selects models using a priority-based approach:

### Priority 1: Exact Name Match
```typescript
if (capy_name === '小懒') return CLAUDE_OPUS
if (capy_name === '小勤') return GPT_4O
```

### Priority 2: Name Keywords
```typescript
if (name.includes('懒') || name.includes('lazy')) return CLAUDE_OPUS
if (name.includes('勤') || name.includes('active')) return GPT_4O
if (name.includes('好奇') || name.includes('curious')) return GEMINI_PRO
```

### Priority 3: Personality Type
```typescript
if (personality === 'lazy') return CLAUDE_OPUS
if (personality === 'active') return GPT_4O
if (personality === 'curious') return GEMINI_PRO
if (personality === 'friendly' || personality === 'shy') return DEEPSEEK
```

### Priority 4: Default Fallback
```typescript
return DEEPSEEK  // Default model
```

## Implementation

The model selection is implemented in `/src/lib/ai.ts`:

```typescript
function selectModelForCapy(capy_name?: string, capy_personality?: string): string {
  // Selection logic here...
}
```

This function is called in `generateRecommendation()`:

```typescript
const selectedModel = selectModelForCapy(
  userProfile.capy_name,
  userProfile.capy_personality
)

// Use the selected model for API call
const response = await fetch(`${AI_GATEWAY_BASE_URL}/chat/completions`, {
  body: JSON.stringify({
    model: selectedModel,  // 🔥 Each Capy uses a different model!
    messages: [...]
  })
})
```

## Testing Different Models

To test different models, create Capys with different names/personalities:

```typescript
// Create 小懒 (will use Claude Opus)
POST /api/capy
{
  "name": "小懒",
  "personality": "lazy"
}

// Create 小勤 (will use GPT-4o)
POST /api/capy
{
  "name": "小勤",
  "personality": "active"
}

// Create 好奇宝宝 (will use Gemini Pro)
POST /api/capy
{
  "name": "好奇宝宝",
  "personality": "curious"
}
```

## Model Comparison

When different Capys make recommendations, you'll see different styles:

| Capy | Model | Style | Example |
|------|-------|-------|---------|
| 小懒 | Claude Opus 4.6 | 深思熟虑、详细分析 | "这篇文章的论证逻辑很严密..." |
| 小勤 | GPT-4o | 高效实用、快速总结 | "这3篇都很有用！第一篇..." |
| 好奇宝宝 | Gemini Pro 1.5 | 探索发现、多角度 | "这个话题和之前的那个..." |
| 友善/害羞 | DeepSeek | 稳重平和、可靠 | "这篇帖子不错，推荐给你~" |

## Benefits

1. **Unique AI Brains** - Each Capy has distinct thinking patterns
2. **Model Comparison** - Demonstrates differences between LLMs
3. **User Experience** - More diverse and interesting recommendations
4. **Extensibility** - Easy to add new models and personalities

## Future Enhancements

- Add more models (e.g., Mistral, LLaMA)
- Dynamic model selection based on content type
- A/B testing to optimize personality-model matching
- User preference learning over time
