/**
 * Capy Interaction Timeline Component
 *
 * THE MOST IMPORTANT FEATURE!
 * Displays conversation-style timeline of Capy interactions
 * Shows two Capys chatting about posts and community content
 */

'use client'

import { useEffect, useState } from 'react'
import { InteractionWithCapys } from '@/types/database'
import { CapyPersonality } from '@/types/database'
import Link from 'next/link'

interface InteractionTimelineProps {
  capyId: string
}

// Personality to emoji mapping
const personalityEmoji: Record<CapyPersonality, string> = {
  lazy: '😴',
  active: '⚡',
  curious: '🔍',
  friendly: '🤗',
  shy: '😊'
}

// Personality to color scheme
const personalityColors: Record<CapyPersonality, { bg: string; border: string; text: string }> = {
  lazy: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  active: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  curious: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  friendly: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  shy: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' }
}

export default function InteractionTimeline({ capyId }: InteractionTimelineProps) {
  const [interactions, setInteractions] = useState<InteractionWithCapys[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInteractions()
  }, [capyId])

  const fetchInteractions = async () => {
    try {
      // Fetch interactions where this Capy is involved
      const response = await fetch(`/api/capy/interactions?capy_id=${capyId}`, {
        headers: {
          'X-User-ID': 'mock-max-user-id' // TODO: Replace with real auth
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch interactions')
      }

      const data = await response.json()
      setInteractions(data.interactions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interactions')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins}分钟前`
    } else if (diffHours < 24) {
      return `${diffHours}小时前`
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getInteractionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      chat: '💬 闲聊',
      recommendation: '💡 推荐讨论',
      collaboration: '🤝 协作'
    }
    return labels[type] || '💬 互动'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 border border-amber-200">
        <div className="flex items-center justify-center">
          <div className="flex gap-2">
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🦫</div>
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>🦫</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-red-200">
        <div className="text-center text-red-600">
          <p>加载互动记录失败</p>
        </div>
      </div>
    )
  }

  if (interactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 border-2 border-dashed border-amber-300 text-center">
        <div className="flex justify-center gap-2 mb-4">
          <div className="text-5xl">🦫</div>
          <div className="text-5xl">🦫</div>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          还没有互动记录
        </h3>
        <p className="text-gray-500 text-sm">
          当你的Capy遇到其他Max用户的Capy时，<br />
          他们的对话会显示在这里！
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction, index) => {
        // Determine which Capy is speaking
        const isCapy1 = interaction.capy_id_1 === capyId
        const speakingCapy = isCapy1 ? interaction.capy_1 : interaction.capy_2
        const otherCapy = isCapy1 ? interaction.capy_2 : interaction.capy_1

        const colors = personalityColors[speakingCapy.personality]

        return (
          <div key={interaction.id} className="relative">
            {/* Timeline line (except for last item) */}
            {index < interactions.length - 1 && (
              <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-amber-300 to-orange-300"></div>
            )}

            {/* Interaction Card */}
            <div className={`bg-white rounded-xl shadow-md border-2 ${colors.border} hover:shadow-lg transition-all overflow-hidden`}>
              {/* Header with timestamp and type */}
              <div className={`${colors.bg} px-4 py-2 border-b ${colors.border} flex items-center justify-between`}>
                <span className="text-xs font-medium text-gray-600">
                  {formatTime(interaction.created_at)}
                </span>
                <span className="text-xs font-medium">
                  {getInteractionTypeLabel(interaction.interaction_type)}
                </span>
              </div>

              {/* Main content */}
              <div className="p-4">
                {/* Speaking Capy */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative">
                    <div className="text-4xl">🦫</div>
                    <div className="absolute -bottom-1 -right-1 text-lg">
                      {personalityEmoji[speakingCapy.personality]}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-bold ${colors.text}`}>
                        {speakingCapy.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 ${colors.bg} ${colors.border} border rounded-full ${colors.text}`}>
                        {speakingCapy.personality}
                      </span>
                    </div>

                    {/* Speech bubble */}
                    <div className={`${colors.bg} rounded-2xl rounded-tl-none p-4 border ${colors.border} relative`}>
                      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                        {interaction.content}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Other Capy mention */}
                <div className="ml-14 text-xs text-gray-500 flex items-center gap-1">
                  <span>与</span>
                  <span className="font-medium text-gray-700">{otherCapy.name}</span>
                  <span>{personalityEmoji[otherCapy.personality]}</span>
                  <span>的对话</span>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Timeline end indicator */}
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-amber-300"></div>
          <span>✨ 期待更多互动 ✨</span>
          <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-amber-300"></div>
        </div>
      </div>
    </div>
  )
}
