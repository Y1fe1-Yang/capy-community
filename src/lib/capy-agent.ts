/**
 * CapyAgent - Autonomous AI Pet Agent System
 *
 * Core agent implementing the Perceive-Decide-Act-Remember loop
 *
 * 🚨 PERMISSION REQUIREMENT: Only Max tier users can have a CapyAgent!
 * - Free users: ❌ No capy (read-only)
 * - Pro users: ❌ No capy (post/comment only)
 * - Max users: ✅ Has AI capy pet
 *
 * @context 相关文档:
 *   - docs/PROJECT_MEMORY.md
 *   - docs/CONTEXT/agent-behavior.md (待创建)
 *   - src/types/database.ts (getUserPermissions function)
 *
 * @depends:
 *   - src/lib/ai.ts (AI recommendation engine)
 *   - src/lib/supabase.ts
 *
 * @owner ai-agent-developer
 * @last-modified 2026-02-18
 */

import { generateRecommendation, Post, UserProfile, Recommendation } from './ai'

/**
 * CapyAgent represents a single AI pet agent for a Max user
 *
 * 🚨 IMPORTANT: This agent should ONLY be instantiated for Max tier users.
 * The caller is responsible for verifying user permissions before creating an agent.
 */
export class CapyAgent {
  constructor(
    public id: string,
    public name: string,
    public ownerId: string,
    public personality: string
  ) {}

  /**
   * PERCEIVE: Read recent posts from the community
   *
   * @param limit - Number of recent posts to fetch (default: 10)
   * @returns Array of posts
   */
  async perceive(limit: number = 10): Promise<Post[]> {
    try {
      // TODO: This will be implemented by database-agent
      // For now, we define the interface that database-agent needs to implement

      // Expected implementation:
      // 1. Query Supabase for recent posts
      // 2. Use posts_with_user view for efficient joins
      // 3. Order by created_at DESC or hotness DESC
      // 4. Limit to specified number

      console.log(`[CapyAgent ${this.name}] Perceiving recent posts (limit: ${limit})`)

      // Placeholder - will be replaced with actual database query
      return []
    } catch (error) {
      console.error(`[CapyAgent ${this.name}] Error in perceive:`, error)
      throw new Error('Failed to perceive posts')
    }
  }

  /**
   * DECIDE: Analyze posts and generate recommendations using AI
   *
   * @param posts - Array of posts to analyze
   * @returns Array of recommendations (1-3 items)
   */
  async decide(posts: Post[]): Promise<Recommendation[]> {
    try {
      console.log(`[CapyAgent ${this.name}] Analyzing ${posts.length} posts...`)

      // Build user profile
      const userProfile: UserProfile = {
        id: this.ownerId,
        name: '', // Will be fetched from database
        plan_type: 'max',
        capy_name: this.name,
        capy_personality: this.personality
      }

      // Call AI to generate recommendations
      const recommendations = await generateRecommendation(posts, userProfile)

      console.log(`[CapyAgent ${this.name}] Generated ${recommendations.length} recommendations`)

      return recommendations
    } catch (error) {
      console.error(`[CapyAgent ${this.name}] Error in decide:`, error)
      throw new Error('Failed to generate recommendations')
    }
  }

  /**
   * ACT: Save recommendations to database
   *
   * @param recommendations - Array of recommendations to save
   */
  async act(recommendations: Recommendation[]): Promise<void> {
    try {
      console.log(`[CapyAgent ${this.name}] Saving ${recommendations.length} recommendations...`)

      // TODO: This will be implemented by database-agent
      // Expected implementation:
      // 1. Insert recommendations into capy_recommendations table
      // 2. Include: user_id, post_id, reason, confidence, created_at
      // 3. Handle duplicates (upsert or skip)

      // Placeholder - will be replaced with actual database insert
      console.log(`[CapyAgent ${this.name}] Recommendations saved successfully`)
    } catch (error) {
      console.error(`[CapyAgent ${this.name}] Error in act:`, error)
      throw new Error('Failed to save recommendations')
    }
  }

  /**
   * REMEMBER: Record interaction history for future learning
   *
   * @param interaction - Interaction data to remember
   */
  async remember(interaction: any): Promise<void> {
    try {
      console.log(`[CapyAgent ${this.name}] Recording interaction...`)

      // TODO: Future enhancement - interaction history
      // Expected implementation:
      // 1. Insert into capy_interactions table
      // 2. Include: type, data, timestamp
      // 3. Use for future personalization

      // For MVP, this is a placeholder
      console.log(`[CapyAgent ${this.name}] Interaction recorded`)
    } catch (error) {
      console.error(`[CapyAgent ${this.name}] Error in remember:`, error)
      // Non-critical, don't throw
    }
  }

  /**
   * RUN: Execute the full agent cycle (Perceive -> Decide -> Act -> Remember)
   *
   * This is the main entry point for running the agent
   */
  async run(): Promise<Recommendation[]> {
    try {
      console.log(`[CapyAgent ${this.name}] Starting agent cycle...`)

      // Step 1: Perceive - Read recent posts
      const posts = await this.perceive(10)

      if (posts.length === 0) {
        console.log(`[CapyAgent ${this.name}] No posts to analyze, skipping cycle`)
        return []
      }

      // Step 2: Decide - Generate recommendations
      const recommendations = await this.decide(posts)

      if (recommendations.length === 0) {
        console.log(`[CapyAgent ${this.name}] No recommendations generated`)
        return []
      }

      // Step 3: Act - Save recommendations
      await this.act(recommendations)

      // Step 4: Remember - Record this cycle
      await this.remember({
        type: 'recommendation_cycle',
        posts_analyzed: posts.length,
        recommendations_generated: recommendations.length,
        timestamp: new Date().toISOString()
      })

      console.log(`[CapyAgent ${this.name}] Agent cycle completed successfully`)

      return recommendations
    } catch (error) {
      console.error(`[CapyAgent ${this.name}] Error in agent cycle:`, error)
      throw error
    }
  }
}

/**
 * Factory function to create a CapyAgent from database data
 *
 * @param userId - User ID (owner of the capy)
 * @param capy - Capy data from database
 */
export function createCapyAgent(userId: string, capy: any): CapyAgent {
  return new CapyAgent(
    userId, // Use user_id as agent id
    capy.name || '小卡皮',
    userId,
    capy.personality || '好奇友善'
  )
}

/**
 * Get default capy personality based on user preferences
 *
 * For MVP: Simple personality mapping
 * Future: More sophisticated personality system
 */
export function getDefaultPersonality(userName: string): string {
  // Simple heuristic for demo
  const personalities = [
    '好奇友善 - 喜欢探索新话题',
    '谨慎细心 - 专注高质量内容',
    '活泼开朗 - 偏好热门讨论',
    '沉稳理性 - 关注深度分析'
  ]

  // Use name hash to pick a personality (consistent for same user)
  const hash = userName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return personalities[hash % personalities.length]
}
