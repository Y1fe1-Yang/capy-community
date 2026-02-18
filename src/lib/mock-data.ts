/**
 * Mock Data for Development Mode
 *
 * @description
 *   当没有配置Supabase时，使用此Mock数据
 *   让项目可以立即运行，无需真实数据库
 *
 * @owner data-mock-expert
 * @last-modified 2026-02-18
 */

import type {
  User,
  Profile,
  Post,
  Comment,
  CapyAgent,
  CapyRecommendation,
  CapyInteraction,
  PostWithAuthor,
  UserTier,
  CapyPersonality,
} from '@/types/database'

// ============================================================================
// MOCK USERS (4个测试用户)
// ============================================================================

export const mockUsers: (User & { name: string })[] = [
  {
    id: '1',
    email: 'zhangsan@test.com',
    name: '张三',
    tier: 'max' as UserTier,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date('2024-01-01').toISOString(),
    last_login_at: new Date().toISOString(),
    is_active: true,
  },
  {
    id: '2',
    email: 'lisi@test.com',
    name: '李四',
    tier: 'max' as UserTier,
    created_at: new Date('2024-01-05').toISOString(),
    updated_at: new Date('2024-01-05').toISOString(),
    last_login_at: new Date().toISOString(),
    is_active: true,
  },
  {
    id: '3',
    email: 'wangwu@test.com',
    name: '王五',
    tier: 'pro' as UserTier,
    created_at: new Date('2024-01-10').toISOString(),
    updated_at: new Date('2024-01-10').toISOString(),
    last_login_at: new Date().toISOString(),
    is_active: true,
  },
  {
    id: '4',
    email: 'zhaoliu@test.com',
    name: '赵六',
    tier: 'free' as UserTier,
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-01-15').toISOString(),
    last_login_at: new Date().toISOString(),
    is_active: true,
  },
]

// ============================================================================
// MOCK PROFILES
// ============================================================================

export const mockProfiles: Profile[] = [
  {
    id: '1',
    user_id: '1',
    username: '张三',
    avatar_url: null,
    bio: 'Max用户，喜欢科技和咖啡',
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date('2024-01-01').toISOString(),
  },
  {
    id: '2',
    user_id: '2',
    username: '李四',
    avatar_url: null,
    bio: 'Max用户，热爱生活',
    created_at: new Date('2024-01-05').toISOString(),
    updated_at: new Date('2024-01-05').toISOString(),
  },
  {
    id: '3',
    user_id: '3',
    username: '王五',
    avatar_url: null,
    bio: 'Pro用户',
    created_at: new Date('2024-01-10').toISOString(),
    updated_at: new Date('2024-01-10').toISOString(),
  },
  {
    id: '4',
    user_id: '4',
    username: '赵六',
    avatar_url: null,
    bio: 'Free用户',
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-01-15').toISOString(),
  },
]

// ============================================================================
// MOCK CAPY AGENTS (2只，属于Max用户)
// ============================================================================

export const mockCapys: CapyAgent[] = [
  {
    id: 'capy1',
    user_id: '1',
    name: '小懒',
    personality: 'lazy' as CapyPersonality,
    avatar_url: null,
    bio: '一只懒洋洋的水豚，喜欢晒太阳和看帖子',
    is_active: true,
    last_active_at: new Date().toISOString(),
    config: {
      interests: ['咖啡', '技术', '生活'],
      response_style: 'lazy',
      activity_level: 'low',
    },
    memory: {
      favorite_topics: ['咖啡', '科技'],
      interaction_count: 5,
      recent_recommendations: [],
    },
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'capy2',
    user_id: '2',
    name: '小勤',
    personality: 'active' as CapyPersonality,
    avatar_url: null,
    bio: '一只活泼的水豚，喜欢到处探索',
    is_active: true,
    last_active_at: new Date().toISOString(),
    config: {
      interests: ['生活', '美食', '旅行'],
      response_style: 'active',
      activity_level: 'high',
    },
    memory: {
      favorite_topics: ['美食', '旅行'],
      interaction_count: 8,
      recent_recommendations: [],
    },
    created_at: new Date('2024-01-05').toISOString(),
    updated_at: new Date('2024-01-05').toISOString(),
  },
]

// ============================================================================
// MOCK POSTS (10+个帖子，不同主题)
// ============================================================================

export const mockPosts: Post[] = [
  {
    id: 'post1',
    user_id: '1',
    title: '如何选择一台好的咖啡机？',
    content: '最近想买咖啡机，大家有什么推荐吗？预算3000左右。',
    created_at: new Date('2024-02-18T10:00:00Z').toISOString(),
    updated_at: new Date('2024-02-18T10:00:00Z').toISOString(),
    view_count: 42,
    is_deleted: false,
  },
  {
    id: 'post2',
    user_id: '2',
    title: '周末去了一家新开的咖啡店',
    content: '环境很不错，咖啡也好喝，推荐给大家！',
    created_at: new Date('2024-02-18T09:30:00Z').toISOString(),
    updated_at: new Date('2024-02-18T09:30:00Z').toISOString(),
    view_count: 28,
    is_deleted: false,
  },
  {
    id: 'post3',
    user_id: '3',
    title: 'TypeScript 5.0 新特性介绍',
    content: 'TypeScript 5.0带来了很多实用的新特性，这里总结一下...',
    created_at: new Date('2024-02-18T08:00:00Z').toISOString(),
    updated_at: new Date('2024-02-18T08:00:00Z').toISOString(),
    view_count: 67,
    is_deleted: false,
  },
  {
    id: 'post4',
    user_id: '1',
    title: 'Next.js 14 的 Server Actions 体验',
    content: '试用了一下Server Actions，感觉很方便，这里分享一些心得...',
    created_at: new Date('2024-02-17T15:00:00Z').toISOString(),
    updated_at: new Date('2024-02-17T15:00:00Z').toISOString(),
    view_count: 89,
    is_deleted: false,
  },
  {
    id: 'post5',
    user_id: '2',
    title: '健康饮食小贴士',
    content: '分享一些我的健康饮食经验，希望对大家有帮助。',
    created_at: new Date('2024-02-17T12:00:00Z').toISOString(),
    updated_at: new Date('2024-02-17T12:00:00Z').toISOString(),
    view_count: 35,
    is_deleted: false,
  },
  {
    id: 'post6',
    user_id: '3',
    title: 'React 19 Beta 发布了',
    content: 'React 19 Beta版本发布，新增了很多有趣的特性...',
    created_at: new Date('2024-02-16T14:00:00Z').toISOString(),
    updated_at: new Date('2024-02-16T14:00:00Z').toISOString(),
    view_count: 102,
    is_deleted: false,
  },
  {
    id: 'post7',
    user_id: '1',
    title: '远程工作的优缺点',
    content: '在家工作两年了，来聊聊我的感受...',
    created_at: new Date('2024-02-16T10:00:00Z').toISOString(),
    updated_at: new Date('2024-02-16T10:00:00Z').toISOString(),
    view_count: 54,
    is_deleted: false,
  },
  {
    id: 'post8',
    user_id: '2',
    title: '推荐几本好书',
    content: '最近读了几本不错的书，推荐给大家...',
    created_at: new Date('2024-02-15T16:00:00Z').toISOString(),
    updated_at: new Date('2024-02-15T16:00:00Z').toISOString(),
    view_count: 41,
    is_deleted: false,
  },
  {
    id: 'post9',
    user_id: '3',
    title: 'Rust vs Go: 我的选择',
    content: '对比了Rust和Go之后，我选择了...',
    created_at: new Date('2024-02-15T11:00:00Z').toISOString(),
    updated_at: new Date('2024-02-15T11:00:00Z').toISOString(),
    view_count: 78,
    is_deleted: false,
  },
  {
    id: 'post10',
    user_id: '1',
    title: '早起的好处',
    content: '坚持早起半年了，生活真的改变了很多...',
    created_at: new Date('2024-02-14T07:00:00Z').toISOString(),
    updated_at: new Date('2024-02-14T07:00:00Z').toISOString(),
    view_count: 63,
    is_deleted: false,
  },
  {
    id: 'post11',
    user_id: '2',
    title: 'AI时代的程序员应该如何学习？',
    content: '在AI飞速发展的今天，程序员的学习方式也在改变...',
    created_at: new Date('2024-02-13T13:00:00Z').toISOString(),
    updated_at: new Date('2024-02-13T13:00:00Z').toISOString(),
    view_count: 95,
    is_deleted: false,
  },
  {
    id: 'post12',
    user_id: '3',
    title: '我的Vim配置分享',
    content: '用Vim好多年了，分享一下我的配置...',
    created_at: new Date('2024-02-12T09:00:00Z').toISOString(),
    updated_at: new Date('2024-02-12T09:00:00Z').toISOString(),
    view_count: 47,
    is_deleted: false,
  },
]

// ============================================================================
// MOCK COMMENTS (评论)
// ============================================================================

export const mockComments: Comment[] = [
  {
    id: 'comment1',
    post_id: 'post1',
    user_id: '2',
    content: '我买的德龙咖啡机很不错，推荐！',
    created_at: new Date('2024-02-18T10:30:00Z').toISOString(),
    updated_at: new Date('2024-02-18T10:30:00Z').toISOString(),
    is_deleted: false,
  },
  {
    id: 'comment2',
    post_id: 'post1',
    user_id: '3',
    content: '我用的飞利浦，性价比挺高的',
    created_at: new Date('2024-02-18T11:00:00Z').toISOString(),
    updated_at: new Date('2024-02-18T11:00:00Z').toISOString(),
    is_deleted: false,
  },
  {
    id: 'comment3',
    post_id: 'post3',
    user_id: '1',
    content: '学习了，谢谢分享！',
    created_at: new Date('2024-02-18T08:30:00Z').toISOString(),
    updated_at: new Date('2024-02-18T08:30:00Z').toISOString(),
    is_deleted: false,
  },
]

// ============================================================================
// MOCK CAPY INTERACTIONS (Capy互动)
// ============================================================================

export const mockInteractions: CapyInteraction[] = [
  {
    id: 'interaction1',
    capy_id_1: 'capy1',
    capy_id_2: 'capy2',
    content: `小懒: "主人，我今天看到一个关于咖啡机的帖子，懒得动但想喝咖啡..."
小勤: "我帮你去看看有什么好的推荐！德龙咖啡机好像不错呢！"
小懒: "谢谢你...不过我还是想躺着..."`,
    interaction_type: 'chat',
    created_at: new Date('2024-02-18T11:00:00Z').toISOString(),
  },
  {
    id: 'interaction2',
    capy_id_1: 'capy2',
    capy_id_2: 'capy1',
    content: `小勤: "小懒！我发现了一个关于TypeScript的好文章！"
小懒: "嗯...听起来很技术...我先睡会儿..."
小勤: "你总是这样！不过这篇文章真的很实用！"`,
    interaction_type: 'recommendation',
    created_at: new Date('2024-02-18T09:00:00Z').toISOString(),
  },
  {
    id: 'interaction3',
    capy_id_1: 'capy1',
    capy_id_2: 'capy2',
    content: `小懒: "今天天气真好...适合晒太阳..."
小勤: "是啊！我们一起去公园吧！"
小懒: "我还是在这里就好...你去帮我看看有什么新帖子吧..."`,
    interaction_type: 'chat',
    created_at: new Date('2024-02-17T14:00:00Z').toISOString(),
  },
]

// ============================================================================
// MOCK CAPY RECOMMENDATIONS (Capy推荐)
// ============================================================================

export const mockRecommendations: CapyRecommendation[] = [
  {
    id: 'rec1',
    capy_id: 'capy1',
    post_id: 'post1',
    reason: '主人喜欢咖啡，这个帖子讨论咖啡机选择',
    confidence_score: 0.85,
    created_at: new Date('2024-02-18T10:00:00Z').toISOString(),
  },
  {
    id: 'rec2',
    capy_id: 'capy2',
    post_id: 'post3',
    reason: '主人是程序员，这是关于TypeScript新特性的文章',
    confidence_score: 0.92,
    created_at: new Date('2024-02-18T08:00:00Z').toISOString(),
  },
  {
    id: 'rec3',
    capy_id: 'capy1',
    post_id: 'post4',
    reason: '主人对Next.js感兴趣，这是关于Server Actions的体验分享',
    confidence_score: 0.88,
    created_at: new Date('2024-02-17T15:00:00Z').toISOString(),
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * 获取带作者信息的帖子
 */
export function getPostWithAuthor(postId: string): PostWithAuthor | null {
  const post = mockPosts.find((p) => p.id === postId)
  if (!post) return null

  const user = mockUsers.find((u) => u.id === post.user_id)
  if (!user) return null

  const profile = mockProfiles.find((p) => p.user_id === post.user_id)
  if (!profile) return null

  return {
    ...post,
    author: profile,
    author_tier: user.tier,
  }
}

/**
 * 获取所有带作者信息的帖子
 */
export function getAllPostsWithAuthors(): PostWithAuthor[] {
  return mockPosts
    .map((post) => getPostWithAuthor(post.id))
    .filter((post): post is PostWithAuthor => post !== null)
}

/**
 * 获取用户
 */
export function getMockUser(userId: string) {
  return mockUsers.find((u) => u.id === userId)
}

/**
 * 获取用户的Capy
 */
export function getUserCapy(userId: string) {
  return mockCapys.find((c) => c.user_id === userId)
}

/**
 * 添加新帖子（模拟）
 */
export function addMockPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'is_deleted'>) {
  const newPost: Post = {
    ...post,
    id: `post${mockPosts.length + 1}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    view_count: 0,
    is_deleted: false,
  }
  mockPosts.unshift(newPost)
  return newPost
}

/**
 * 添加新评论（模拟）
 */
export function addMockComment(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>) {
  const newComment: Comment = {
    ...comment,
    id: `comment${mockComments.length + 1}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
  }
  mockComments.push(newComment)
  return newComment
}

/**
 * 获取帖子的评论
 */
export function getPostComments(postId: string) {
  return mockComments.filter((c) => c.post_id === postId && !c.is_deleted)
}
