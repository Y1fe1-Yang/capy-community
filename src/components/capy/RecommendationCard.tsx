/**
 * Capy Recommendation Card Component
 *
 * Displays recommendations from Capy Agent
 * Shows recommended posts with reasons
 */

'use client'

import { useEffect, useState } from 'react'
import { RecommendationWithPost } from '@/types/database'
import Link from 'next/link'

interface RecommendationCardProps {
  capyId: string
}

export default function RecommendationCard({ capyId }: RecommendationCardProps) {
  const [recommendations, setRecommendations] = useState<RecommendationWithPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecommendations()
  }, [capyId])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`/api/capy/recommendations?capy_id=${capyId}`, {
        headers: {
          'X-User-ID': 'mock-max-user-id' // TODO: Replace with real auth
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-amber-200">
        <div className="flex items-center justify-center py-8">
          <div className="text-4xl animate-bounce">🦫</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-red-200">
        <div className="text-center text-red-600">
          <p>加载推荐失败</p>
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 border-2 border-dashed border-amber-300 text-center">
        <div className="text-6xl mb-4">🦫</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          暂无推荐
        </h3>
        <p className="text-gray-500 text-sm">
          你的Capy正在探索社区，稍后再来看看吧！
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <div
          key={rec.id}
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-amber-200 hover:border-amber-400 overflow-hidden group"
        >
          {/* Capy Speech Bubble */}
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 border-b border-amber-200">
            <div className="flex items-start gap-3">
              <div className="text-3xl flex-shrink-0 group-hover:animate-bounce">
                🦫
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-lg p-3 shadow-sm relative">
                  {/* Speech bubble arrow */}
                  <div className="absolute left-0 top-3 -translate-x-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white"></div>

                  {rec.reason ? (
                    <p className="text-gray-700 text-sm">
                      &quot;{rec.reason}&quot;
                    </p>
                  ) : (
                    <p className="text-gray-600 text-sm italic">
                      我觉得你可能会喜欢这个！
                    </p>
                  )}

                  {rec.confidence_score && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all"
                          style={{ width: `${rec.confidence_score * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round(rec.confidence_score * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Post Preview */}
          <Link href={`/forum/posts/${rec.post_id}`}>
            <div className="p-4 hover:bg-amber-50 transition-colors cursor-pointer">
              <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors">
                {rec.post.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                {rec.post.content}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span>作者: {rec.post.author.username}</span>
                  <span>•</span>
                  <span>浏览: {rec.post.view_count}</span>
                </div>
                <span className="text-amber-600 font-medium group-hover:text-amber-700">
                  查看详情 →
                </span>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}
