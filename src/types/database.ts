/**
 * Capy Community Database Types
 *
 * @context
 *   - supabase/schema.sql (数据库schema定义)
 *   - docs/PROJECT_MEMORY.md (用户权限系统)
 *
 * @owner database-architect
 * @last-modified 2026-02-18
 *
 * 这个文件定义了所有数据库表的TypeScript类型
 * 与Supabase的PostgreSQL schema保持一致
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * 用户等级
 * - free: 只读权限
 * - pro: 发帖+评论权限
 * - max: 完整权限 + Capy Agent
 */
export type UserTier = 'free' | 'pro' | 'max';

/**
 * 卡皮性格类型
 */
export type CapyPersonality = 'lazy' | 'active' | 'curious' | 'friendly' | 'shy';

/**
 * 卡皮互动类型
 */
export type InteractionType = 'chat' | 'recommendation' | 'collaboration';

// ============================================================================
// TABLE TYPES
// ============================================================================

/**
 * users 表 - 用户基本信息
 */
export interface User {
  id: string;
  email: string;
  tier: UserTier;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  is_active: boolean;
}

/**
 * profiles 表 - 用户资料
 */
export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * posts 表 - 帖子
 */
export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  is_deleted: boolean;
}

/**
 * comments 表 - 评论
 */
export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

/**
 * capy_agents 表 - Capy Agent（Max用户专属）
 */
export interface CapyAgent {
  id: string;
  user_id: string;
  name: string;
  personality: CapyPersonality;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  last_active_at: string | null;

  // JSONB 字段
  config: CapyAgentConfig;
  memory: CapyAgentMemory;

  created_at: string;
  updated_at: string;
}

/**
 * Capy Agent 配置（存储在 config JSONB 字段中）
 */
export interface CapyAgentConfig {
  interests?: string[];
  response_style?: string;
  activity_level?: 'low' | 'medium' | 'high';
  [key: string]: any; // 允许扩展
}

/**
 * Capy Agent 记忆（存储在 memory JSONB 字段中）
 */
export interface CapyAgentMemory {
  favorite_topics?: string[];
  interaction_count?: number;
  recent_recommendations?: string[];
  [key: string]: any; // 允许扩展
}

/**
 * capy_recommendations 表 - Capy推荐帖子
 */
export interface CapyRecommendation {
  id: string;
  capy_id: string;
  post_id: string;
  reason: string | null;
  confidence_score: number | null;
  created_at: string;
}

/**
 * capy_interactions 表 - Capy之间的互动
 */
export interface CapyInteraction {
  id: string;
  capy_id_1: string;
  capy_id_2: string;
  content: string;
  interaction_type: string;
  created_at: string;
}

// ============================================================================
// JOINED TYPES (常用的联表查询结果)
// ============================================================================

/**
 * 帖子详情（包含作者信息）
 */
export interface PostWithAuthor extends Post {
  author: Profile;
  author_tier: UserTier;
}

/**
 * 评论详情（包含作者信息）
 */
export interface CommentWithAuthor extends Comment {
  author: Profile;
  author_tier: UserTier;
}

/**
 * 用户完整信息（包含资料）
 */
export interface UserWithProfile extends User {
  profile: Profile | null;
}

/**
 * Max用户完整信息（包含资料和Capy）
 */
export interface MaxUserWithCapy extends UserWithProfile {
  capy_agent: CapyAgent | null;
}

/**
 * Capy推荐详情（包含帖子和作者信息）
 */
export interface RecommendationWithPost extends CapyRecommendation {
  post: PostWithAuthor;
}

/**
 * Capy互动详情（包含两个Capy的信息）
 */
export interface InteractionWithCapys extends CapyInteraction {
  capy_1: CapyAgent;
  capy_2: CapyAgent;
}

// ============================================================================
// REQUEST/RESPONSE TYPES (API使用)
// ============================================================================

/**
 * 创建帖子请求
 */
export interface CreatePostRequest {
  title: string;
  content: string;
}

/**
 * 更新帖子请求
 */
export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

/**
 * 创建评论请求
 */
export interface CreateCommentRequest {
  post_id: string;
  content: string;
}

/**
 * 创建/更新资料请求
 */
export interface UpsertProfileRequest {
  username: string;
  avatar_url?: string | null;
  bio?: string | null;
}

/**
 * 创建/更新Capy Agent请求
 */
export interface UpsertCapyAgentRequest {
  name: string;
  personality: CapyPersonality;
  avatar_url?: string | null;
  bio?: string | null;
  config?: Partial<CapyAgentConfig>;
}

/**
 * Capy推荐请求（通常由系统调用）
 */
export interface CreateRecommendationRequest {
  capy_id: string;
  post_id: string;
  reason?: string;
  confidence_score?: number;
}

/**
 * Capy互动请求（通常由系统调用）
 */
export interface CreateInteractionRequest {
  capy_id_1: string;
  capy_id_2: string;
  content: string;
  interaction_type?: string;
}

// ============================================================================
// PAGINATION & QUERY TYPES
// ============================================================================

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

/**
 * 帖子查询参数
 */
export interface PostQueryParams extends PaginationParams {
  user_id?: string;
  search?: string;
  sort_by?: 'created_at' | 'view_count' | 'updated_at';
  order?: 'asc' | 'desc';
}

/**
 * 评论查询参数
 */
export interface CommentQueryParams extends PaginationParams {
  post_id?: string;
  user_id?: string;
  sort_by?: 'created_at';
  order?: 'asc' | 'desc';
}

// ============================================================================
// PERMISSION HELPER TYPES
// ============================================================================

/**
 * 用户权限检查结果
 */
export interface UserPermissions {
  can_view: boolean;
  can_post: boolean;
  can_comment: boolean;
  can_edit_own: boolean;
  can_delete_own: boolean;
  has_capy: boolean;
}

/**
 * 根据用户等级获取权限
 */
export function getUserPermissions(tier: UserTier): UserPermissions {
  return {
    can_view: true, // 所有用户都可以查看
    can_post: tier === 'pro' || tier === 'max',
    can_comment: tier === 'pro' || tier === 'max',
    can_edit_own: tier === 'pro' || tier === 'max',
    can_delete_own: tier === 'pro' || tier === 'max',
    has_capy: tier === 'max',
  };
}

// ============================================================================
// DATABASE SCHEMA TYPE (Supabase使用)
// ============================================================================

/**
 * 数据库完整Schema类型
 * 用于Supabase客户端的类型安全
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'user_id'>>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'is_deleted'>;
        Update: Partial<Omit<Post, 'id' | 'created_at' | 'user_id'>>;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>;
        Update: Partial<Omit<Comment, 'id' | 'created_at' | 'user_id' | 'post_id'>>;
      };
      capy_agents: {
        Row: CapyAgent;
        Insert: Omit<CapyAgent, 'id' | 'created_at' | 'updated_at' | 'last_active_at' | 'is_active'>;
        Update: Partial<Omit<CapyAgent, 'id' | 'created_at' | 'user_id'>>;
      };
      capy_recommendations: {
        Row: CapyRecommendation;
        Insert: Omit<CapyRecommendation, 'id' | 'created_at'>;
        Update: never; // 推荐记录不允许更新
      };
      capy_interactions: {
        Row: CapyInteraction;
        Insert: Omit<CapyInteraction, 'id' | 'created_at'>;
        Update: never; // 互动记录不允许更新
      };
    };
    Functions: {
      get_user_tier: {
        Args: { user_id: string };
        Returns: UserTier;
      };
      can_user_post: {
        Args: { user_id: string };
        Returns: boolean;
      };
      user_has_capy: {
        Args: { user_id: string };
        Returns: boolean;
      };
    };
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  // 重新导出所有类型，方便使用
  User,
  Profile,
  Post,
  Comment,
  CapyAgent,
  CapyRecommendation,
  CapyInteraction,
  PostWithAuthor,
  CommentWithAuthor,
  UserWithProfile,
  MaxUserWithCapy,
  RecommendationWithPost,
  InteractionWithCapys,
};
