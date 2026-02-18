/**
 * CommentList Component
 * Displays comments for a post with pagination
 */

'use client'

import { useState } from 'react'
import { APIComment } from '@/types/api'
import UserBadge from './UserBadge'

interface CommentListProps {
  comments: APIComment[]
  totalComments: number
}

export default function CommentList({ comments, totalComments }: CommentListProps) {
  const [displayedComments] = useState<APIComment[]>(comments)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) {
      return '刚刚'
    } else if (diffMins < 60) {
      return `${diffMins}分钟前`
    } else if (diffHours < 24) {
      return `${diffHours}小时前`
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  if (displayedComments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无评论，快来抢沙发吧
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        评论 ({totalComments})
      </h3>
      {displayedComments.map((comment) => (
        <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900">{comment.users.name}</span>
            <UserBadge tier={comment.users.tier} />
            <span className="text-xs text-gray-500">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          <div className="flex items-center gap-4 mt-3">
            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{comment.likes_count}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
