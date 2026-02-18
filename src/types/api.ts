/**
 * API Response Types
 * Types that match the actual API responses from backend
 */

import { UserTier } from './database'

// User info returned from API
export interface APIUser {
  id: string
  name: string
  email: string
  tier: UserTier
}

// Post with author info (from /api/posts)
export interface APIPost {
  id: string
  title: string
  content: string
  category: string
  author_id: string
  likes_count: number
  comment_count: number
  hotness: number
  created_at: string
  updated_at: string
  is_deleted: boolean
  users: APIUser
}

// Comment with author info (from /api/comments)
export interface APIComment {
  id: string
  post_id: string
  author_id: string
  content: string
  likes_count: number
  created_at: string
  updated_at: string
  is_deleted: boolean
  users: APIUser
}

// Pagination info
export interface APIPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Posts list response
export interface PostsResponse {
  posts: APIPost[]
  pagination: APIPagination
}

// Comments list response
export interface CommentsResponse {
  comments: APIComment[]
  pagination: APIPagination
}

// Single post response
export interface PostResponse {
  post: APIPost
}

// Single comment response
export interface CommentResponse {
  comment: APIComment
}

// Create post request
export interface PostCreate {
  title: string
  content: string
  category: string
  author_id: string
}

// Create comment request
export interface CommentCreate {
  post_id: string
  content: string
  author_id: string
}
