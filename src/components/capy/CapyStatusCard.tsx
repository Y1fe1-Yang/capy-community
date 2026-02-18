/**
 * Capy Status Card Component
 *
 * Displays Capy's activity metrics and statistics
 * - Posts read today
 * - Recommendations made
 * - Interactions with other Capys
 * - Activity level indicator
 */

'use client'

import { useEffect, useState } from 'react'

interface CapyStatusCardProps {
  capyId: string
}

interface CapyStats {
  posts_read_today: number
  recommendations_made: number
  interactions_count: number
  total_posts_read: number
  activity_level: 'low' | 'medium' | 'high'
  last_active_at: string | null
}

export default function CapyStatusCard({ capyId }: CapyStatusCardProps) {
  const [stats, setStats] = useState<CapyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [capyId])

  const fetchStats = async () => {
    try {
      // Fetch Capy statistics
      const response = await fetch(`/api/capy/stats?capy_id=${capyId}`, {
        headers: {
          'X-User-ID': 'mock-max-user-id' // TODO: Replace with real auth
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        // If API not ready, use mock data
        setStats({
          posts_read_today: 0,
          recommendations_made: 0,
          interactions_count: 0,
          total_posts_read: 0,
          activity_level: 'low',
          last_active_at: new Date().toISOString()
        })
      }
    } catch (err) {
      // Use mock data on error
      setStats({
        posts_read_today: 0,
        recommendations_made: 0,
        interactions_count: 0,
        total_posts_read: 0,
        activity_level: 'low',
        last_active_at: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const activityLevelConfig = {
    low: { label: '休息中', color: 'text-gray-600', bg: 'bg-gray-100', emoji: '😴' },
    medium: { label: '活跃', color: 'text-amber-600', bg: 'bg-amber-100', emoji: '👍' },
    high: { label: '超活跃', color: 'text-orange-600', bg: 'bg-orange-100', emoji: '⚡' }
  }

  const activityConfig = activityLevelConfig[stats.activity_level]

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📊</span>
        <h3 className="text-lg font-bold text-gray-800">活动统计</h3>
      </div>

      {/* Activity Level */}
      <div className={`${activityConfig.bg} rounded-xl p-4 mb-4 border border-amber-200`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 mb-1">活跃度</p>
            <p className={`text-lg font-bold ${activityConfig.color} flex items-center gap-2`}>
              <span>{activityConfig.emoji}</span>
              <span>{activityConfig.label}</span>
            </p>
          </div>
          <div className="text-4xl">{activityConfig.emoji}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        {/* Today's Posts Read */}
        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📖</div>
            <div>
              <p className="text-xs text-gray-600">今日阅读</p>
              <p className="text-sm font-semibold text-gray-800">
                {stats.posts_read_today} 篇帖子
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations Made */}
        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="text-xs text-gray-600">生成推荐</p>
              <p className="text-sm font-semibold text-gray-800">
                {stats.recommendations_made} 条
              </p>
            </div>
          </div>
        </div>

        {/* Interactions Count */}
        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="text-2xl">💬</div>
            <div>
              <p className="text-xs text-gray-600">Capy互动</p>
              <p className="text-sm font-semibold text-gray-800">
                {stats.interactions_count} 次
              </p>
            </div>
          </div>
        </div>

        {/* Total Posts Read */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📚</div>
            <div>
              <p className="text-xs text-gray-600">累计阅读</p>
              <p className="text-sm font-semibold text-gray-800">
                {stats.total_posts_read} 篇
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Badge (if high activity) */}
      {stats.activity_level === 'high' && (
        <div className="mt-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-3 border-2 border-amber-300">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-amber-800">今日成就</p>
              <p className="text-sm font-bold text-orange-700">超活跃Capy</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress to next milestone */}
      <div className="mt-4 pt-4 border-t border-amber-200">
        <p className="text-xs text-gray-600 mb-2">下一个里程碑</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all"
              style={{
                width: `${Math.min((stats.total_posts_read % 10) * 10, 100)}%`
              }}
            ></div>
          </div>
          <span className="text-xs text-gray-600 font-medium">
            {stats.total_posts_read % 10}/10
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          再阅读 {10 - (stats.total_posts_read % 10)} 篇解锁新徽章
        </p>
      </div>
    </div>
  )
}
