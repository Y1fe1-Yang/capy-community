/**
 * Supabase Client Configuration
 *
 * @context 相关文档:
 *   - docs/PROJECT_MEMORY.md
 *
 * @depends:
 *   - Environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   - @/types/database for Database types
 *
 * @owner backend-developer
 * @last-modified 2026-02-18
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Mock模式：如果没有配置Supabase，创建一个假的client（不会被使用）
const USE_MOCK = !supabaseUrl || !supabaseAnonKey

/**
 * Singleton Supabase client instance with full Database typing
 * 在Mock模式下，这个client不会被使用，API会直接返回Mock数据
 */
export const supabase = USE_MOCK
  ? createSupabaseClient<Database>('https://mock.supabase.co', 'mock-key')
  : createSupabaseClient<Database>(supabaseUrl!, supabaseAnonKey!)

/**
 * Create a new Supabase client instance (for server-side use if needed)
 */
export function createClient() {
  if (USE_MOCK) {
    return createSupabaseClient<Database>('https://mock.supabase.co', 'mock-key')
  }

  return createSupabaseClient<Database>(supabaseUrl!, supabaseAnonKey!)
}
