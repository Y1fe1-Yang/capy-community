/**
 * Capy Agent API - Max Tier Exclusive
 *
 * @route GET /api/capy - Get user's Capy Agent
 * @route POST /api/capy - Create a new Capy Agent (Max tier only)
 *
 * IMPORTANT: Only Max tier users can have AI Capy pets
 *
 * @owner backend-developer
 * @last-modified 2026-02-18
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireCapyAccess } from '@/lib/auth'

/**
 * GET /api/capy
 * Get the authenticated user's Capy Agent
 *
 * Requires: Max tier
 */
export async function GET(request: NextRequest) {
  try {
    // Verify Max tier access
    const authResult = await requireCapyAccess(request)

    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 })
    }

    const { user } = authResult

    // Fetch user's Capy Agent
    const { data: capy, error } = await supabase
      .from('capy_agents')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No Capy found
        return NextResponse.json({ capy: null })
      }
      console.error('Error fetching Capy Agent:', error)
      return NextResponse.json({ error: 'Failed to fetch Capy Agent' }, { status: 500 })
    }

    return NextResponse.json({ capy })
  } catch (error) {
    console.error('Unexpected error in GET /api/capy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/capy
 * Create a new Capy Agent for the user
 *
 * Requires: Max tier
 * Note: Each user can only have one Capy Agent
 *
 * Body:
 * - name: string (required, 1-50 chars)
 * - personality: 'lazy' | 'diligent' (required)
 * - config: object (optional) - Custom configuration for the Capy
 */
export async function POST(request: NextRequest) {
  try {
    // Verify Max tier access
    const authResult = await requireCapyAccess(request)

    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 })
    }

    const { user } = authResult

    // Check if user already has a Capy
    const { data: existingCapy, error: checkError } = await supabase
      .from('capy_agents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingCapy) {
      return NextResponse.json(
        { error: 'You already have a Capy Agent. Each Max user can only have one Capy.' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { name, personality, config } = body

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (name.length > 50) {
      return NextResponse.json({ error: 'Name must be 50 characters or less' }, { status: 400 })
    }

    if (!personality || !['lazy', 'diligent'].includes(personality)) {
      return NextResponse.json(
        { error: 'Personality must be either "lazy" or "diligent"' },
        { status: 400 }
      )
    }

    // Create Capy Agent
    const newCapy = {
      user_id: user.id,
      name: name.trim(),
      personality,
      config: config || {},
      memory: {},
    }

    const { data: capy, error } = await supabase
      .from('capy_agents')
      .insert(newCapy)
      .select('*')
      .single()

    if (error) {
      console.error('Error creating Capy Agent:', error)
      return NextResponse.json({ error: 'Failed to create Capy Agent' }, { status: 500 })
    }

    return NextResponse.json({ capy }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/capy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
