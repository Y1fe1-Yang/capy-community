/**
 * My Capy Page - Max Tier Exclusive
 *
 * @route /my-capy
 * @access Max tier only
 *
 * Shows user's Capy Agent information and interactions
 */

'use client'

import { useEffect, useState } from 'react'
import { CapyAgent } from '@/types/database'
import CapyStatusCard from '@/components/capy/CapyStatusCard'
import RecommendationCard from '@/components/capy/RecommendationCard'
import InteractionTimeline from '@/components/capy/InteractionTimeline'

export default function MyCapyPage() {
  const [capy, setCapy] = useState<CapyAgent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCapy()
  }, [])

  const fetchCapy = async () => {
    try {
      // For development: use mock user ID
      const response = await fetch('/api/capy', {
        headers: {
          'X-User-ID': 'mock-max-user-id' // TODO: Replace with real auth
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch Capy')
      }

      const data = await response.json()
      setCapy(data.capy)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Capy')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🦫</div>
          <p className="text-amber-800 font-medium">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-6xl mb-4 text-center">😢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">无法访问</h2>
          <p className="text-red-600 mb-4 text-center">{error}</p>
          <p className="text-gray-600 text-sm text-center">
            需要Max会员才能拥有Capy AI宠物
          </p>
        </div>
      </div>
    )
  }

  if (!capy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🦫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">还没有Capy</h2>
          <p className="text-gray-600 mb-6">
            创建你的专属Capy AI宠物吧！
          </p>
          <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all">
            创建Capy
          </button>
        </div>
      </div>
    )
  }

  const personalityEmoji = {
    lazy: '😴',
    active: '⚡',
    curious: '🔍',
    friendly: '🤗',
    shy: '😊'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🦫</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {capy.name}
                </h1>
                <p className="text-sm text-amber-700 flex items-center gap-1">
                  <span>{personalityEmoji[capy.personality]}</span>
                  <span className="capitalize">{capy.personality}</span>
                  性格
                </p>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full text-white font-medium text-sm">
              Max会员专属
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Capy Info & Status */}
          <div className="lg:col-span-1 space-y-6">
            {/* Capy Avatar Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
              <div className="text-center">
                <div className="text-8xl mb-4 animate-pulse">🦫</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{capy.name}</h2>
                {capy.bio && (
                  <p className="text-gray-600 text-sm italic mb-4">&quot;{capy.bio}&quot;</p>
                )}
                <div className="flex justify-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                    {personalityEmoji[capy.personality]} {capy.personality}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {capy.is_active ? '活跃' : '休息中'}
                  </span>
                </div>
                {capy.last_active_at && (
                  <p className="text-xs text-gray-500">
                    最后活动: {new Date(capy.last_active_at).toLocaleString('zh-CN')}
                  </p>
                )}
              </div>
            </div>

            {/* Status Card */}
            <CapyStatusCard capyId={capy.id} />
          </div>

          {/* Right Column - Interactions & Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📅</span>
                <h2 className="text-xl font-bold text-gray-800">今日活动</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-3xl font-bold text-amber-600">0</div>
                  <div className="text-sm text-gray-600">阅读帖子</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">0</div>
                  <div className="text-sm text-gray-600">生成推荐</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-3xl font-bold text-amber-600">0</div>
                  <div className="text-sm text-gray-600">Capy互动</div>
                </div>
              </div>
            </div>

            {/* Recommendations Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💡</span>
                <h2 className="text-xl font-bold text-gray-800">Capy的推荐</h2>
              </div>
              <RecommendationCard capyId={capy.id} />
            </div>

            {/* Interactions Timeline */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💬</span>
                <h2 className="text-xl font-bold text-gray-800">互动日记</h2>
              </div>
              <InteractionTimeline capyId={capy.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
