/**
 * Posts API - List and Create
 *
 * @route GET /api/posts - Get paginated list of posts
 * @route POST /api/posts - Create a new post (requires Pro/Max tier)
 *
 * @owner backend-developer
 * @last-modified 2026-02-18
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import type { PostCreate } from '@/types/database'

/**
 * GET /api/posts
 * Fetch paginated list of posts with author information
 *
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - category: string (optional)
 * - sort: 'hot' | 'new' | 'top' (default: 'hot')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'hot'

    const offset = (page - 1) * limit

    let query = supabase
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
      `,
        { count: 'exact' }
      )
      .eq('is_deleted', false)

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category)
    }

    // Sort
    if (sort === 'hot') {
      query = query.order('hotness', { ascending: false })
    } else if (sort === 'new') {
      query = query.order('created_at', { ascending: false })
    } else if (sort === 'top') {
      query = query.order('likes_count', { ascending: false })
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: posts, error, count } = await query

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    return NextResponse.json({
      posts: posts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/posts
 * Create a new post
 *
 * Requires: Pro or Max tier
 *
 * Body:
 * - title: string (required, 1-200 chars)
 * - content: string (required)
 * - category: string (required)
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
    const { title, content, category } = body

    // Validate input
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (title.length > 200) {
      return NextResponse.json({ error: 'Title must be 200 characters or less' }, { status: 400 })
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    // Create post
    const newPost: PostCreate = {
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      author_id: user.id,
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert(newPost)
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
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
