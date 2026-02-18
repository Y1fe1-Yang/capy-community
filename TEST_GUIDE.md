# Capy Community 测试指南

## 🔐 测试用户

当前使用Mock数据模式，有4个测试用户：

### 用户1：张三（Max用户）
```
ID: 1
用户名: 张三
等级: Max（金色徽章）
权限: ✅ 完整论坛权限 + AI卡皮宠物
卡皮: 🦫 小懒（使用Claude Opus 4.6）
```

### 用户2：李四（Max用户）
```
ID: 2
用户名: 李四
等级: Max（金色徽章）
权限: ✅ 完整论坛权限 + AI卡皮宠物
卡皮: 🦫 小勤（使用GPT-4o）
```

### 用户3：王五（Pro用户）
```
ID: 3
用户名: 王五
等级: Pro（绿色徽章）
权限: ✅ 可以发帖、评论
卡皮: ❌ 无
```

### 用户4：赵六（Free用户）
```
ID: 4
用户名: 赵六
等级: Free（蓝色徽章）
权限: 🔒 只能看帖
卡皮: ❌ 无
```

---

## 🧪 如何测试

### 方法1：使用浏览器控制台

打开浏览器开发者工具（F12），在Console中运行：

```javascript
// 切换到张三（Max用户，有小懒卡皮）
localStorage.setItem('current_user_id', '1')
location.reload()

// 切换到李四（Max用户，有小勤卡皮）
localStorage.setItem('current_user_id', '2')
location.reload()

// 切换到王五（Pro用户，无卡皮）
localStorage.setItem('current_user_id', '3')
location.reload()

// 切换到赵六（Free用户，只能看）
localStorage.setItem('current_user_id', '4')
location.reload()
```

### 方法2：使用cURL测试API

```bash
# 获取帖子列表（所有用户）
curl http://localhost:3000/api/posts

# 发帖（Pro/Max用户）
curl -X POST http://localhost:3000/api/posts \
  -H "x-user-id: 3" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试帖子",
    "content": "这是测试内容",
    "category": "技术"
  }'

# 获取Capy推荐（仅Max用户）
curl http://localhost:3000/api/capy/recommendations \
  -H "x-user-id: 1"

# Free用户尝试发帖（会失败）
curl -X POST http://localhost:3000/api/posts \
  -H "x-user-id: 4" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试",
    "content": "测试",
    "category": "技术"
  }'
```

---

## 📄 页面说明

### 1. 首页（/）
- 显示所有帖子
- 分类筛选
- 排序（热门/最新/最赞）
- **当前状态：** ✅ 可以看到12个Mock帖子

### 2. 我的Capy（/my-capy）
- 仅Max用户可访问
- 显示Capy信息和推荐
- **测试：**
  - 用户1（张三）→ 看到小懒🦫
  - 用户2（李四）→ 看到小勤🦫
  - 用户3/4 → 看到权限不足提示

### 3. 发帖页面（/forum/new）
- Pro和Max用户可以发帖
- **测试：**
  - 用户1/2/3 → 可以发帖
  - 用户4 → 看到权限不足提示

### 4. 帖子详情（/forum/[id]）
- 所有用户可以查看
- Pro/Max可以评论
- **测试：** 点击任意帖子

---

## 🔧 Mock数据内容

### 帖子主题：
1. Next.js 15 新特性分享
2. TypeScript 最佳实践
3. 如何设计一个AI Agent系统？
4. 我的开源项目经验分享
5. 团队协作工具推荐
6. 远程工作心得
7. 咖啡与编程的艺术
8. 健身与生产力
9. 推荐几本技术书籍
10. 周末活动召集
11. 新人报道
12. 求助：部署问题

### Capy互动示例：
```
[今天 14:30]
🦫 小懒: "主人，我刚看到一个关于Next.js的帖子，懒得细看，但感觉挺有用的..."

[今天 14:32]
🦫 小勤: "我也看到了！里面的TypeScript类型定义写得很棒，值得学习！"

[今天 14:35]
🦫 小懒: "行吧行吧，那我也认真看看..."
```

---

## 🐛 已知问题

1. ❌ **前端没有登录UI** - 需要用localStorage手动设置user_id
2. ❌ **前端没有读取user_id** - API调用时没有传user_id header
3. ⚠️ **部分页面可能还未完成** - Agents生成的代码可能有遗漏

---

## 🔥 快速修复TODO

需要添加：
1. 用户选择器（在header显示）
2. 前端API调用时带上user_id
3. 显示当前登录用户信息
4. 完善My Capy页面的数据获取

---

## 💡 提示

- 当前是**Mock模式**，无需配置Supabase
- 所有数据都在内存中，刷新页面会重置
- API端点都已实现并测试通过
- 前端UI已生成但需要连接认证系统

**下一步：添加简单的用户切换UI** 🚀
