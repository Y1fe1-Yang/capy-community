/**
 * Capy Recommendations API - Max Tier Exclusive
 *
 * @route GET /api/capy/recommendations - Get Capy's post recommendations for the user
 *
 * IMPORTANT: Only Max tier users have Capy Agents that can make recommendations
 * - Free users: ❌ No access (read-only, no capy)
 * - Pro users: ❌ No access (can post/comment, but no capy)
 * - Max users: ✅ Full access (has AI capy pet)
 *
 * @owner backend-developer
 * @last-modified 2026-02-18
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireCapyAccess, USE_MOCK } from '@/lib/auth'
import { getUserCapy, mockRecommendations, getPostWithAuthor } from '@/lib/mock-data'

/**
 * GET /api/capy/recommendations
 * Get personalized post recommendations from user's Capy Agent
 *
 * Requires: Max tier
 *
 * Query params:
 * - limit: number (default: 10, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify Max tier access
    const authResult = await requireCapyAccess(request)

    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 })
    }

    const { user } = authResult

    // Get query params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))

    // Mock模式：从Mock数据获取推荐
    if (USE_MOCK) {
      const capy = getUserCapy(user.id)
      if (!capy) {
        return NextResponse.json(
          { error: 'You must create a Capy Agent first to receive recommendations' },
          { status: 404 }
        )
      }

      // 获取该Capy的推荐
      const userRecommendations = mockRecommendations
        .filter((rec) => rec.capy_id === capy.id)
        .slice(0, limit)
        .map((rec) => {
          const post = getPostWithAuthor(rec.post_id)
          return {
            id: rec.id,
            post_id: rec.post_id,
            reason: rec.reason,
            confidence: rec.confidence_score,
            created_at: rec.created_at,
            posts: post
              ? {
                  id: post.id,
                  title: post.title,
                  content: post.content,
                  author_id: post.user_id,
                  created_at: post.created_at,
                  users: {
                    id: post.author.user_id,
                    name: post.author.username,
                    tier: post.author_tier,
                  },
                }
              : null,
          }
        })

      return NextResponse.json({ recommendations: userRecommendations })
    }

    // 真实模式：从Supabase获取
    const { data: capy, error: capyError } = await supabase
      .from('capy_agents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (capyError || !capy) {
      return NextResponse.json(
        { error: 'You must create a Capy Agent first to receive recommendations' },
        { status: 404 }
      )
    }

    // Fetch recommendations
    const { data: recommendations, error } = await supabase
      .from('capy_recommendations')
      .select(
        `
        id,
        post_id,
        post_title,
        reason,
        confidence,
        created_at,
        posts:post_id (
          id,
          title,
          content,
          category,
          author_id,
          likes_count,
          comment_count,
          hotness,
          created_at,
          users:author_id (
            id,
            name,
            tier
          )
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching Capy recommendations:', error)
      return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
    }

    return NextResponse.json({ recommendations: recommendations || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/capy/recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
