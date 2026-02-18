/**
 * Comments API - List and Create
 *
 * @route GET /api/comments?post_id=xxx - Get comments for a post
 * @route POST /api/comments - Create a new comment (requires Pro/Max tier)
 *
 * @owner backend-developer
 * @last-modified 2026-02-18
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth, USE_MOCK } from '@/lib/auth'
import type { CommentCreate } from '@/types/database'
import { getPostComments, addMockComment, mockPosts, mockUsers, mockProfiles } from '@/lib/mock-data'

/**
 * GET /api/comments
 * Fetch comments for a specific post with author information
 *
 * Query params:
 * - post_id: string (required) - The post ID to fetch comments for
 * - page: number (default: 1)
 * - limit: number (default: 50, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('post_id')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))

    if (!postId) {
      return NextResponse.json({ error: 'post_id query parameter is required' }, { status: 400 })
    }

    const offset = (page - 1) * limit

    // Mock模式：从Mock数据获取评论
    if (USE_MOCK) {
      const allComments = getPostComments(postId)

      // 添加作者信息
      const commentsWithAuthors = allComments.map((comment) => {
        const user = mockUsers.find((u) => u.id === comment.user_id)
        const profile = mockProfiles.find((p) => p.user_id === comment.user_id)
        return {
          ...comment,
          author_id: comment.user_id,
          likes_count: 0,
          users: user && profile ? { id: user.id, name: user.name, email: user.email, tier: user.tier } : null,
        }
      })

      const paginatedComments = commentsWithAuthors.slice(offset, offset + limit)

      return NextResponse.json({
        comments: paginatedComments,
        pagination: {
          page,
          limit,
          total: allComments.length,
          totalPages: Math.ceil(allComments.length / limit),
        },
      })
    }

    // 真实模式：从Supabase获取
    const { data: comments, error, count } = await supabase
      .from('comments')
      .select(
        `
        id,
        post_id,
        author_id,
        content,
        likes_count,
        created_at,
        updated_at,
        is_deleted,
        users:author_id (
          id,
          name,
          email,
          tier
        )
      `,
        { count: 'exact' }
      )
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }

    return NextResponse.json({
      comments: comments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/comments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/comments
 * Create a new comment
 *
 * Requires: Pro or Max tier
 *
 * Body:
 * - post_id: string (required)
 * - content: string (required)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and permissions
    const authResult = await requireAuth(request, 'pro')

    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 })
    }

    const { user } = authResult

    // Parse request body
    const body = await request.json()
    const { post_id, content } = body

    // Validate input
    if (!post_id || typeof post_id !== 'string' || post_id.trim().length === 0) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 })
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Mock模式：添加评论
    if (USE_MOCK) {
      // 验证帖子是否存在
      const post = mockPosts.find((p) => p.id === post_id)
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }

      if (post.is_deleted) {
        return NextResponse.json({ error: 'Cannot comment on deleted post' }, { status: 400 })
      }

      // 创建评论
      const newComment = addMockComment({
        post_id,
        user_id: user.id,
        content: content.trim(),
      })

      // 添加作者信息
      const userProfile = mockProfiles.find((p) => p.user_id === user.id)
      const commentWithAuthor = {
        ...newComment,
        author_id: newComment.user_id,
        likes_count: 0,
        users: {
          id: user.id,
          name: user.name,
          email: user.email,
          tier: user.tier,
        },
      }

      return NextResponse.json({ comment: commentWithAuthor }, { status: 201 })
    }

    // 真实模式：验证帖子并创建评论
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, is_deleted')
      .eq('id', post_id)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.is_deleted) {
      return NextResponse.json({ error: 'Cannot comment on deleted post' }, { status: 400 })
    }

    // Create comment
    const newComment: CommentCreate = {
      post_id,
      content: content.trim(),
      author_id: user.id,
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert(newComment)
      .select(
        `
        id,
        post_id,
        author_id,
        content,
        likes_count,
        created_at,
        updated_at,
        is_deleted,
        users:author_id (
          id,
          name,
          email,
          tier
        )
      `
      )
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }

    // Increment comment count on the post (optimistic update)
    await supabase.rpc('increment_comment_count', { post_id })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/comments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
