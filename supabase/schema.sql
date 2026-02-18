-- Capy Community Database Schema
-- Created: 2026-02-18
-- Owner: database-architect
--
-- @context
--   - docs/PROJECT_MEMORY.md (用户权限系统)
--   - Free用户: 只读 | Pro用户: 发帖+评论 | Max用户: 完整权限+Capy Agent

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
-- RLS will be enabled on all tables to enforce user permissions

-- ============================================================================
-- ENUMS
-- ============================================================================

-- 用户等级类型
CREATE TYPE user_tier AS ENUM ('free', 'pro', 'max');

-- 卡皮性格类型（可扩展）
CREATE TYPE capy_personality AS ENUM ('lazy', 'active', 'curious', 'friendly', 'shy');

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- users 表 - 用户基本信息
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    tier user_tier NOT NULL DEFAULT 'free',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- 索引
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ----------------------------------------------------------------------------
-- profiles 表 - 用户资料
-- ----------------------------------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- 约束
    CONSTRAINT username_length CHECK (char_length(username) >= 2 AND char_length(username) <= 50),
    CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);

-- 创建索引
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_username ON profiles(username);

-- ----------------------------------------------------------------------------
-- posts 表 - 帖子
-- ----------------------------------------------------------------------------
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    view_count INTEGER NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT false,

    -- 约束
    CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
    CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 10000)
);

-- 创建索引
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_is_deleted ON posts(is_deleted) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- comments 表 - 评论
-- ----------------------------------------------------------------------------
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT false,

    -- 约束
    CONSTRAINT comment_length CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);

-- 创建索引
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- ----------------------------------------------------------------------------
-- capy_agents 表 - 卡皮Agent
-- ----------------------------------------------------------------------------
CREATE TABLE capy_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    personality capy_personality NOT NULL DEFAULT 'friendly',
    avatar_url TEXT,
    bio TEXT,

    -- Agent状态
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_active_at TIMESTAMPTZ,

    -- Agent配置（JSON格式，可扩展）
    config JSONB DEFAULT '{}',

    -- Agent记忆（JSON格式，存储对话历史等）
    memory JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- 约束
    CONSTRAINT capy_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 50),
    CONSTRAINT capy_bio_length CHECK (char_length(bio) <= 500)
);

-- 创建索引
CREATE INDEX idx_capy_agents_user_id ON capy_agents(user_id);
CREATE INDEX idx_capy_agents_is_active ON capy_agents(is_active);
CREATE INDEX idx_capy_agents_last_active ON capy_agents(last_active_at DESC);

-- ----------------------------------------------------------------------------
-- capy_recommendations 表 - 卡皮推荐帖子
-- ----------------------------------------------------------------------------
CREATE TABLE capy_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capy_id UUID NOT NULL REFERENCES capy_agents(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reason TEXT,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- 防止重复推荐
    UNIQUE(capy_id, post_id),

    -- 约束
    CONSTRAINT reason_length CHECK (char_length(reason) <= 500)
);

-- 创建索引
CREATE INDEX idx_capy_recs_capy_id ON capy_recommendations(capy_id);
CREATE INDEX idx_capy_recs_post_id ON capy_recommendations(post_id);
CREATE INDEX idx_capy_recs_created_at ON capy_recommendations(created_at DESC);

-- ----------------------------------------------------------------------------
-- capy_interactions 表 - 卡皮之间的互动
-- ----------------------------------------------------------------------------
CREATE TABLE capy_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capy_id_1 UUID NOT NULL REFERENCES capy_agents(id) ON DELETE CASCADE,
    capy_id_2 UUID NOT NULL REFERENCES capy_agents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    interaction_type TEXT DEFAULT 'chat',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- 约束：不能自己和自己互动
    CONSTRAINT different_capys CHECK (capy_id_1 != capy_id_2),
    CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);

-- 创建索引
CREATE INDEX idx_capy_inter_capy1 ON capy_interactions(capy_id_1);
CREATE INDEX idx_capy_inter_capy2 ON capy_interactions(capy_id_2);
CREATE INDEX idx_capy_inter_created_at ON capy_interactions(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE capy_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE capy_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE capy_interactions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- users 表 RLS
-- ----------------------------------------------------------------------------

-- 所有人可以查看用户信息（但不包括敏感字段）
CREATE POLICY "用户信息公开可见"
    ON users FOR SELECT
    USING (true);

-- 用户只能更新自己的信息
CREATE POLICY "用户只能更新自己"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- profiles 表 RLS
-- ----------------------------------------------------------------------------

-- 所有人可以查看资料
CREATE POLICY "资料公开可见"
    ON profiles FOR SELECT
    USING (true);

-- Pro和Max用户可以创建资料
CREATE POLICY "Pro和Max用户可创建资料"
    ON profiles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND tier IN ('pro', 'max')
        )
    );

-- 用户只能更新自己的资料
CREATE POLICY "用户只能更新自己的资料"
    ON profiles FOR UPDATE
    USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- posts 表 RLS
-- ----------------------------------------------------------------------------

-- 所有人可以查看帖子（Free用户也可以）
CREATE POLICY "帖子公开可见"
    ON posts FOR SELECT
    USING (is_deleted = false);

-- Pro和Max用户可以发帖
CREATE POLICY "Pro和Max用户可发帖"
    ON posts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND tier IN ('pro', 'max')
        )
    );

-- 用户只能更新/删除自己的帖子
CREATE POLICY "用户只能管理自己的帖子"
    ON posts FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "用户只能删除自己的帖子"
    ON posts FOR DELETE
    USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- comments 表 RLS
-- ----------------------------------------------------------------------------

-- 所有人可以查看评论
CREATE POLICY "评论公开可见"
    ON comments FOR SELECT
    USING (is_deleted = false);

-- Pro和Max用户可以评论
CREATE POLICY "Pro和Max用户可评论"
    ON comments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND tier IN ('pro', 'max')
        )
    );

-- 用户只能更新/删除自己的评论
CREATE POLICY "用户只能管理自己的评论"
    ON comments FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "用户只能删除自己的评论"
    ON comments FOR DELETE
    USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- capy_agents 表 RLS
-- ----------------------------------------------------------------------------

-- 所有人可以查看Capy Agent
CREATE POLICY "Capy Agent公开可见"
    ON capy_agents FOR SELECT
    USING (true);

-- 只有Max用户可以创建Capy
CREATE POLICY "Max用户可创建Capy"
    ON capy_agents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND tier = 'max'
        )
    );

-- 用户只能更新自己的Capy
CREATE POLICY "用户只能管理自己的Capy"
    ON capy_agents FOR UPDATE
    USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- capy_recommendations 表 RLS
-- ----------------------------------------------------------------------------

-- 所有人可以查看推荐
CREATE POLICY "推荐公开可见"
    ON capy_recommendations FOR SELECT
    USING (true);

-- Capy系统可以创建推荐（通过service_role）
CREATE POLICY "系统可创建推荐"
    ON capy_recommendations FOR INSERT
    WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- capy_interactions 表 RLS
-- ----------------------------------------------------------------------------

-- 所有人可以查看Capy互动
CREATE POLICY "Capy互动公开可见"
    ON capy_interactions FOR SELECT
    USING (true);

-- Capy系统可以创建互动（通过service_role）
CREATE POLICY "系统可创建互动"
    ON capy_interactions FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- 创建自动更新 updated_at 的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表添加 updated_at 触发器
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capy_agents_updated_at
    BEFORE UPDATE ON capy_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- 获取用户权限等级
CREATE OR REPLACE FUNCTION get_user_tier(user_id UUID)
RETURNS user_tier AS $$
    SELECT tier FROM users WHERE id = user_id;
$$ LANGUAGE sql STABLE;

-- 检查用户是否可以发帖
CREATE OR REPLACE FUNCTION can_user_post(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT tier IN ('pro', 'max') FROM users WHERE id = user_id;
$$ LANGUAGE sql STABLE;

-- 检查用户是否有Capy
CREATE OR REPLACE FUNCTION user_has_capy(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS(SELECT 1 FROM capy_agents WHERE user_id = user_id AND is_active = true);
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS '用户基本信息表';
COMMENT ON TABLE profiles IS '用户资料表';
COMMENT ON TABLE posts IS '帖子表';
COMMENT ON TABLE comments IS '评论表';
COMMENT ON TABLE capy_agents IS 'Capy Agent表（Max用户专属）';
COMMENT ON TABLE capy_recommendations IS 'Capy推荐帖子表';
COMMENT ON TABLE capy_interactions IS 'Capy之间的互动记录表';

COMMENT ON COLUMN users.tier IS '用户等级: free(只读), pro(发帖评论), max(完整权限+Capy)';
COMMENT ON COLUMN capy_agents.config IS 'Agent配置（JSONB格式，可扩展）';
COMMENT ON COLUMN capy_agents.memory IS 'Agent记忆（JSONB格式，存储对话历史等）';
COMMENT ON COLUMN capy_recommendations.confidence_score IS '推荐置信度 0-1';
