/**
 * Authentication and Authorization Utilities
 *
 * @context 权限验证中间件
 * @depends:
 *   - @/lib/supabase for database client
 *   - @/types/database for type definitions
 *
 * @owner backend-developer
 * @last-modified 2026-02-18
 */

import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { UserTier } from '@/types/database'
import { getMockUser } from '@/lib/mock-data'

// 检测是否使用Mock模式（没有配置Supabase）
export const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL

export interface AuthUser {
  id: string
  email: string
  name: string
  tier: UserTier
}

/**
 * Extract user ID from request headers
 * In production, this would validate JWT tokens
 * For now, we accept X-User-ID header for testing
 */
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  const userId = request.headers.get('x-user-id')

  if (!userId) {
    return null
  }

  // Mock模式：从Mock数据获取用户
  if (USE_MOCK) {
    const user = getMockUser(userId)
    if (!user) {
      return null
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier,
    }
  }

  // 真实模式：从Supabase获取
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, tier')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return null
  }

  return user as AuthUser
}

/**
 * Require authentication and minimum tier level
 * @param request - Next.js request object
 * @param minTier - Minimum required tier ('free', 'pro', 'max')
 * @returns AuthUser if authorized, null otherwise
 */
export async function requireAuth(
  request: NextRequest,
  minTier: UserTier = 'free'
): Promise<{ authorized: true; user: AuthUser } | { authorized: false; error: string }> {
  const user = await getUserFromRequest(request)

  if (!user) {
    return { authorized: false, error: 'Unauthorized: No user ID provided' }
  }

  // Check tier level
  const tierLevels: Record<UserTier, number> = {
    free: 0,
    pro: 1,
    max: 2,
  }

  if (tierLevels[user.tier] < tierLevels[minTier]) {
    return {
      authorized: false,
      error: `Insufficient permissions: ${minTier} tier required, current tier is ${user.tier}`,
    }
  }

  return { authorized: true, user }
}

/**
 * Check if user can perform write operations (post/comment)
 */
export function canUserWrite(tier: UserTier): boolean {
  return tier === 'pro' || tier === 'max'
}

/**
 * Check if user is Max tier (full permissions)
 */
export function isMaxTier(tier: UserTier): boolean {
  return tier === 'max'
}

/**
 * Check if user has access to Capy Agent features
 * IMPORTANT: Only Max tier users can have AI Capy pets
 */
export function hasCapyAccess(tier: UserTier): boolean {
  return tier === 'max'
}

/**
 * Require Max tier for Capy-related operations
 * @returns AuthUser if Max tier, error otherwise
 */
export async function requireCapyAccess(
  request: NextRequest
): Promise<{ authorized: true; user: AuthUser } | { authorized: false; error: string }> {
  const authResult = await requireAuth(request, 'max')

  if (!authResult.authorized) {
    return {
      authorized: false,
      error: 'Capy Agent access requires Max tier subscription',
    }
  }

  return authResult
}

/**
 * Verify user owns a resource
 */
export async function verifyOwnership(
  userId: string,
  resourceId: string,
  resourceType: 'post' | 'comment'
): Promise<boolean> {
  if (resourceType === 'post') {
    const { data, error } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', resourceId)
      .single()

    return !error && data?.author_id === userId
  }

  if (resourceType === 'comment') {
    const { data, error } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', resourceId)
      .single()

    return !error && data?.author_id === userId
  }

  return false
}
