/**
 * Post Detail Page
 * Displays full post content with comments
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import UserBadge from '@/components/forum/UserBadge'
import CommentList from '@/components/forum/CommentList'
import { APIPost, APIComment } from '@/types/api'

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params?.id as string

  const [post, setPost] = useState<APIPost | null>(null)
  const [comments, setComments] = useState<APIComment[]>([])
  const [totalComments, setTotalComments] = useState(0)
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'max'>('free')

  useEffect(() => {
    if (postId) {
      fetchPost()
      fetchComments()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
      } else {
        console.error('Failed to fetch post')
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?post_id=${postId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
        setTotalComments(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!commentContent.trim()) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          content: commentContent.trim(),
        }),
      })

      if (response.ok) {
        setCommentContent('')
        fetchComments()
        if (post) {
          setPost({
            ...post,
            comment_count: post.comment_count + 1,
          })
        }
      } else {
        const error = await response.json()
        alert(error.error || '评论失败')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('评论失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">帖子不存在</p>
      </div>
    )
  }

  const canComment = userTier === 'pro' || userTier === 'max'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>

        {/* Post Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
              {post.category}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center gap-3 mb-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">{post.users.name}</span>
              <UserBadge tier={post.users.tier} />
            </div>
            <span>•</span>
            <span>{formatDate(post.created_at)}</span>
          </div>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap mb-6">
            {post.content}
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post.likes_count}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comment_count} 评论</span>
            </div>
          </div>
        </div>

        {/* Comment Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {canComment ? (
            <form onSubmit={handleSubmitComment}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">发表评论</h3>
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="写下你的想法..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !commentContent.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? '提交中...' : '发表评论'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">评论功能仅对 Pro 和 Max 用户开放</p>
              <Link
                href="/upgrade"
                className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                升级账户
              </Link>
            </div>
          )}
        </div>

        {/* Comments List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <CommentList comments={comments} totalComments={totalComments} />
        </div>
      </div>
    </div>
  )
}
