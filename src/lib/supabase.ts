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

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

/**
 * Singleton Supabase client instance with full Database typing
 */
export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)

/**
 * Create a new Supabase client instance (for server-side use if needed)
 */
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}
