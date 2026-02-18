# Capy Community

> 客户社区论坛 + AI卡皮宠物Agent系统

## 🎯 项目简介

Capy Community 是为 HappyCapy 付费客户打造的社区平台，结合论坛功能和AI宠物Agent系统。

**核心特色：**
- 📝 社区论坛：用户可以发帖、评论、互动
- 🦫 AI卡皮宠物：Max用户专属的智能AI Agent
- 🤝 卡皮互动：AI之间可以自主交流和互动
- 💡 智能推荐：卡皮为主人推荐感兴趣的内容

## 🏗️ 技术栈

- **前端：** Next.js 15 + TypeScript + Tailwind CSS
- **数据库：** Supabase (PostgreSQL)
- **AI引擎：** Google Gemini 2.0 Flash
- **部署：** Vercel (前端) + Google Cloud Run (Agent)

## 📚 文档

- [项目记忆 (PROJECT_MEMORY.md)](./docs/PROJECT_MEMORY.md) - 项目核心信息
- [任务队列 (AGENT_TASKS.md)](./docs/AGENT_TASKS.md) - 开发任务清单
- [上下文系统 (CONTEXT_SYSTEM.md)](./docs/CONTEXT_SYSTEM.md) - 避免AI遗忘的机制
- [Peter开发方法论](./docs/peter-development-method.md) - 多Agent协作开发指南
- [云端环境配置](./docs/CLOUD_SETUP.md) - Google Cloud VM配置指南

## 🚀 快速开始

### 环境准备

1. Node.js 18+
2. Git
3. Supabase账号
4. Google Cloud账号（开发环境）
5. Gemini API Key

### 开发流程

本项目采用 **Peter Steinberger的多Agent并行开发方法**：

1. 多个AI Agent同时工作
2. 清晰的任务拆解
3. Agent之间自主协作
4. 渐进式开发（快速原型→迭代优化）

详见 [peter-development-method.md](./docs/peter-development-method.md)

## 📊 当前进度

```
□ Phase 1: 环境准备
□ Phase 2: 论坛MVP
□ Phase 3: Agent原型
□ Phase 4: 完整集成
□ Phase 5: 部署上线
```

## 👥 用户权限

| 用户类型 | 论坛权限 | 卡皮系统 |
|---------|---------|---------|
| Free    | 只能看帖 | ❌ |
| Pro     | 发帖+评论 | ❌ |
| Max     | 完整权限 | ✅ 有卡皮Agent |

## 🦫 Capy Agent系统

每个Max用户拥有一只独特的AI卡皮宠物：

- **自主感知：** 每天自动浏览社区帖子
- **智能推荐：** 根据主人兴趣推荐内容
- **社交互动：** 与其他用户的卡皮交流
- **成长记忆：** 记录互动历史，形成独特性格

## 💰 成本估算

- **AI调用：** ~$0.07/月 (Gemini 2.0 Flash)
- **云服务：** ~$70/月 (Google Cloud + Supabase免费版)
- **总计：** $300赠金可用4-5个月

## 📝 开发规范

### Agent启动协议

任何Agent开始工作前必须：

1. 读取 `docs/PROJECT_MEMORY.md` （5分钟）
2. 读取 `docs/AGENT_TASKS.md` （2分钟）
3. 读取相关 `docs/CONTEXT/*.md` （5分钟）
4. 读取 `.agent-logs/latest.log` （2分钟）

**总计15分钟启动成本，避免1小时返工。**

### 任务拆解原则

- ✅ 任务要细（每个<1小时）
- ✅ 一次一件事
- ✅ 验证每一步
- ✅ 并行>串行
- ✅ 重点审查关键代码

## 🎯 本周目标

```
Week 1 (2026-02-18 ~ 2026-02-24):
□ 环境准备完成
□ 论坛MVP可运行
□ Agent原型可运行
□ 初步集成

成功标准:
- 4个测试用户可以登录
- Pro用户可以发帖
- Max用户可以看到卡皮推荐
- 推荐是AI生成的（不是写死的）
```

## 🤝 贡献指南

本项目采用多Agent协作开发模式，欢迎：

1. 阅读 [AGENT_TASKS.md](./docs/AGENT_TASKS.md) 了解当前任务
2. 选择一个任务开始工作
3. 完成后更新任务状态
4. 记录工作日志到 `.agent-logs/`

## 📄 许可证

[待定]

## 📞 联系方式

[待补充]

---

**记住：这不是传统开发，这是Agentic Engineering！** 🚀
