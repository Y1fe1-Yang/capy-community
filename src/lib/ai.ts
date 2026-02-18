/**
 * AI Client for Capy Agent Recommendations
 * Uses HappyCapy AI Gateway (OpenAI-compatible API)
 *
 * @context 相关文档:
 *   - docs/PROJECT_MEMORY.md
 *   - docs/CONTEXT/agent-behavior.md (待创建)
 *
 * @owner ai-agent-developer
 * @last-modified 2026-02-18
 */

// HappyCapy AI Gateway configuration
const AI_GATEWAY_BASE_URL = process.env.AI_GATEWAY_BASE_URL || 'https://ai-gateway.happycapy.ai/api/v1/openai/v1'
const AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY || ''

// Model configuration - Different Capys use different LLMs!
// This allows each Capy to have a unique "AI brain" with distinct thinking styles
const CAPY_MODELS = {
  // Claude Opus 4.6 - For lazy/contemplative personalities
  // 懒散、深思熟虑的Capy用Claude（更有思考深度）
  CLAUDE_OPUS: 'anthropic/claude-opus-4-6',

  // GPT-4o - For active/diligent personalities
  // 勤奋、快速响应的Capy用GPT-4o（更加高效）
  GPT_4O: 'openai/gpt-4o',

  // Gemini Pro - For curious personalities
  // 好奇、探索型的Capy用Gemini（多模态能力强）
  GEMINI_PRO: 'google/gemini-pro-1.5',

  // DeepSeek - Default/fallback for friendly/shy personalities
  // 友善、害羞的Capy用DeepSeek（经济实惠）
  DEEPSEEK: 'deepseek/deepseek-chat',

  // Default fallback
  DEFAULT: 'deepseek/deepseek-chat'
} as const

/**
 * Select the appropriate AI model based on Capy's name and personality
 *
 * Selection priority:
 * 1. Exact name match (e.g., "小懒" -> Claude, "小勤" -> GPT-4o)
 * 2. Name contains keywords (e.g., "懒" in name -> Claude)
 * 3. Personality type (e.g., "lazy" -> Claude, "active" -> GPT-4o)
 * 4. Default fallback (DeepSeek)
 *
 * This multi-model approach allows different Capys to have distinct "thinking styles"
 * and demonstrates the unique characteristics of each LLM!
 *
 * @param capy_name - The name of the Capy (e.g., "小懒", "小勤", "好奇宝宝")
 * @param capy_personality - The personality type (lazy/active/curious/friendly/shy)
 * @returns The model identifier to use with AI Gateway
 */
function selectModelForCapy(capy_name?: string, capy_personality?: string): string {
  // Priority 1: Exact name match
  if (capy_name === '小懒') {
    console.log(`[AI] 🦫 ${capy_name} is using Claude Opus 4.6 (lazy & contemplative)`)
    return CAPY_MODELS.CLAUDE_OPUS
  }
  if (capy_name === '小勤') {
    console.log(`[AI] 🦫 ${capy_name} is using GPT-4o (diligent & efficient)`)
    return CAPY_MODELS.GPT_4O
  }

  // Priority 2: Name contains personality keywords
  if (capy_name) {
    const nameLower = capy_name.toLowerCase()

    // Names with "懒" (lazy) -> Claude Opus
    if (nameLower.includes('懒') || nameLower.includes('lazy')) {
      console.log(`[AI] 🦫 ${capy_name} is using Claude Opus 4.6 (detected "lazy" in name)`)
      return CAPY_MODELS.CLAUDE_OPUS
    }

    // Names with "勤" (diligent) or "活" (active) -> GPT-4o
    if (nameLower.includes('勤') || nameLower.includes('active') ||
        nameLower.includes('活') || nameLower.includes('diligent')) {
      console.log(`[AI] 🦫 ${capy_name} is using GPT-4o (detected "active/diligent" in name)`)
      return CAPY_MODELS.GPT_4O
    }

    // Names with "好奇" (curious) -> Gemini Pro
    if (nameLower.includes('好奇') || nameLower.includes('curious')) {
      console.log(`[AI] 🦫 ${capy_name} is using Gemini Pro (detected "curious" in name)`)
      return CAPY_MODELS.GEMINI_PRO
    }
  }

  // Priority 3: Personality type
  if (capy_personality) {
    const personalityLower = capy_personality.toLowerCase()

    // Lazy personality -> Claude Opus
    if (personalityLower === 'lazy' || personalityLower.includes('懒')) {
      console.log(`[AI] 🦫 Using Claude Opus 4.6 for personality: ${capy_personality}`)
      return CAPY_MODELS.CLAUDE_OPUS
    }

    // Active/diligent personality -> GPT-4o
    if (personalityLower === 'active' || personalityLower.includes('活') ||
        personalityLower.includes('勤') || personalityLower.includes('diligent')) {
      console.log(`[AI] 🦫 Using GPT-4o for personality: ${capy_personality}`)
      return CAPY_MODELS.GPT_4O
    }

    // Curious personality -> Gemini Pro
    if (personalityLower === 'curious' || personalityLower.includes('好奇')) {
      console.log(`[AI] 🦫 Using Gemini Pro for personality: ${capy_personality}`)
      return CAPY_MODELS.GEMINI_PRO
    }

    // Friendly/shy personality -> DeepSeek (default)
    if (personalityLower === 'friendly' || personalityLower === 'shy' ||
        personalityLower.includes('友') || personalityLower.includes('羞')) {
      console.log(`[AI] 🦫 Using DeepSeek for personality: ${capy_personality}`)
      return CAPY_MODELS.DEEPSEEK
    }
  }

  // Default fallback
  console.log(`[AI] 🦫 Using default model (DeepSeek) for ${capy_name || 'unknown'} / ${capy_personality || 'unknown'}`)
  return CAPY_MODELS.DEFAULT
}

/**
 * Post interface matching the database schema
 */
export interface Post {
  id: string
  title: string
  content: string
  category: string
  user_name: string
  score: number
  likes_count: number
  comment_count: number
  created_at: string
}

/**
 * User profile for personalization
 */
export interface UserProfile {
  id: string
  name: string
  plan_type: string
  capy_name?: string
  capy_personality?: string
}

/**
 * AI recommendation result
 */
export interface Recommendation {
  post_id: string
  post_title: string
  reason: string
  confidence: number
}

/**
 * Generate personalized recommendations using Gemini AI
 *
 * @param posts - Array of recent posts from the community
 * @param userProfile - User profile including capy personality
 * @returns Array of recommendations (1-3 posts)
 */
export async function generateRecommendation(
  posts: Post[],
  userProfile: UserProfile
): Promise<Recommendation[]> {
  try {
    // Build the prompt based on capy personality
    const prompt = buildRecommendationPrompt(posts, userProfile)

    // 🎯 根据Capy选择不同的LLM模型！
    const selectedModel = selectModelForCapy(userProfile.capy_name, userProfile.capy_personality)

    console.log(`[Capy ${userProfile.capy_name}] Using model: ${selectedModel}`)

    // Call AI Gateway (OpenAI-compatible API)
    const response = await fetch(`${AI_GATEWAY_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_GATEWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel, // 🔥 每只Capy用不同的模型！
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('AI Gateway error:', error)
      throw new Error(`AI Gateway returned ${response.status}: ${error}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || ''

    // Parse the AI response
    const recommendations = parseRecommendations(aiResponse, posts)

    return recommendations
  } catch (error) {
    console.error('Error generating recommendations:', error)
    throw new Error('Failed to generate recommendations')
  }
}

/**
 * Build the prompt for Gemini based on capy personality
 */
function buildRecommendationPrompt(posts: Post[], userProfile: UserProfile): string {
  const capy_name = userProfile.capy_name || '小卡皮'
  const personality = userProfile.capy_personality || '好奇友善'

  // Create post summaries
  const postSummaries = posts.map((post, index) =>
    `[${index + 1}] ID: ${post.id}
标题: ${post.title}
分类: ${post.category}
内容摘要: ${post.content.substring(0, 150)}...
作者: ${post.user_name}
热度: ${post.score}分 | ${post.likes_count}个赞 | ${post.comment_count}条评论
发布时间: ${post.created_at}`
  ).join('\n\n')

  const prompt = `你是一只名叫"${capy_name}"的AI卡皮宠物，你的性格是: ${personality}

你的主人是"${userProfile.name}"，你需要帮助主人在社区论坛中找到感兴趣的内容。

以下是最近的${posts.length}个帖子:

${postSummaries}

请根据你的性格和主人可能感兴趣的内容，从上述帖子中推荐1-3个最值得阅读的帖子。

要求:
1. 推荐数量: 1-3个帖子
2. 推荐理由: 要体现你的性格特点
3. 输出格式必须是JSON数组，每个推荐包含:
   - post_id: 帖子ID (字符串)
   - post_title: 帖子标题
   - reason: 推荐理由 (50字以内，用第一人称"我"，体现你的性格)
   - confidence: 置信度 (0-1之间的数字)

示例输出:
[
  {
    "post_id": "xxx-xxx-xxx",
    "post_title": "帖子标题",
    "reason": "主人，我觉得这个话题很有趣！",
    "confidence": 0.85
  }
]

请直接输出JSON数组，不要包含任何其他文字或markdown标记。`

  return prompt
}

/**
 * Parse the AI response into structured recommendations
 */
function parseRecommendations(response: string, posts: Post[]): Recommendation[] {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '')
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '')
    }

    // Parse JSON
    const parsed = JSON.parse(cleaned)

    // Validate and normalize
    const recommendations: Recommendation[] = Array.isArray(parsed) ? parsed : [parsed]

    // Validate each recommendation
    return recommendations
      .filter(rec => rec.post_id && rec.post_title && rec.reason)
      .map(rec => ({
        post_id: rec.post_id,
        post_title: rec.post_title,
        reason: rec.reason.substring(0, 100), // Limit reason length
        confidence: Math.min(Math.max(rec.confidence || 0.5, 0), 1) // Clamp 0-1
      }))
      .slice(0, 3) // Max 3 recommendations
  } catch (error) {
    console.error('Error parsing recommendations:', error)
    console.error('Raw response:', response)

    // Fallback: Return empty array instead of throwing
    return []
  }
}
