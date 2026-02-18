/**
 * Posts API - Single Post Operations
 *
 * @route GET /api/posts/[id] - Get a single post with details
 * @route DELETE /api/posts/[id] - Delete a post (soft delete, requires ownership or Max tier)
 *
 * @owner backend-developer
 * @last-modified 2026-02-18
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth, verifyOwnership, isMaxTier } from '@/lib/auth'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/posts/[id]
 * Fetch a single post with author information
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const { data: post, error } = await supabase
      .from('posts')
      .select(
        `
        id,
        title,
        content,
        category,
        author_id,
        likes_count,
        comment_count,
        hotness,
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
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }
      console.error('Error fetching post:', error)
      return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Unexpected error in GET /api/posts/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/posts/[id]
 * Soft delete a post
 *
 * Requires: Post author OR Max tier
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // Verify authentication
    const authResult = await requireAuth(request, 'free')

    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 })
    }

    const { user } = authResult

    // Check if user is Max tier (can delete any post) or owns the post
    const isOwner = await verifyOwnership(user.id, id, 'post')
    const canDelete = isMaxTier(user.tier) || isOwner

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own posts unless you have Max tier' },
        { status: 403 }
      )
    }

    // Soft delete the post
    const { error } = await supabase
      .from('posts')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('is_deleted', false)

    if (error) {
      console.error('Error deleting post:', error)
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/posts/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
