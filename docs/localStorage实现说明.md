# localStorage 持久化存储实现说明

## 概述

已成功为 Agent 模块添加完整的 localStorage 持久化存储功能，实现真实的对话历史记录管理系统。

## 实现的功能

### ✅ 核心功能

1. **对话历史持久化存储**
   - 所有对话会话自动保存到 localStorage
   - 刷新页面后数据完整恢复
   - 支持最多 50 个会话（可配置）

2. **会话管理**
   - ✅ 创建新会话
   - ✅ 切换会话（恢复历史消息）
   - ✅ 删除会话（带确认提示）
   - ✅ 自动生成会话标题（从第一条消息提取）

3. **实时自动保存**
   - 发送消息后自动保存
   - 收到回复后自动更新
   - 防抖机制避免频繁写入

4. **智能数据管理**
   - 自动清理旧数据（超过限制时）
   - 空间不足时自动清理最旧会话
   - 完整的元数据跟踪（消息数、图片数等）

## 技术架构

### 文件结构

```
web/src/
├── lib/storage/
│   ├── types.js              # TypeScript 类型定义（JSDoc）
│   └── localStorage.js       # localStorage 工具函数
├── hooks/
│   ├── useSessionManager.js  # 会话管理 Hook
│   └── useAutoSave.js       # 自动保存 Hook
└── app/agent/
    ├── page.js              # 集成存储功能的 Agent 页面
    └── page.module.css      # 更新的样式
```

### 数据结构

#### Session（会话）
```javascript
{
  id: "session_1765244857866",
  title: "测试localStorage存储功能",
  messages: [
    {
      role: "user" | "assistant",
      content: "消息内容",
      images: [],
      timestamp: 1765244883087
    }
  ],
  createdAt: 1765244857866,
  updatedAt: 1765244897643,
  metadata: {
    messageCount: 2,
    imageCount: 0,
    tags: []
  }
}
```

#### Storage Keys
```javascript
{
  SESSIONS: 'agent_sessions',           // 所有会话列表
  ACTIVE_SESSION: 'agent_active_session', // 当前活跃会话ID
  GENERATION_RECORDS: 'generation_records', // 生成记录（用于 Library）
  USER_PREFERENCES: 'user_preferences'    // 用户偏好设置
}
```

## 核心 API

### localStorage 工具函数

```javascript
// 基础操作
getStorageItem(key, defaultValue)
setStorageItem(key, value)
removeStorageItem(key)

// 会话操作
getSessions()
saveSession(session)
getSession(sessionId)
deleteSession(sessionId)
getActiveSessionId()
setActiveSessionId(sessionId)

// 生成记录
saveGenerationRecord(record)
getGenerationRecords(filter)

// 数据管理
exportAllData()
importAllData(data)
clearAllData()
```

### useSessionManager Hook

```javascript
const {
  sessions,              // 所有会话列表
  activeSessionId,       // 当前活跃会话ID
  isLoading,            // 加载状态

  createSession,        // 创建新会话
  updateSessionMessages, // 更新会话消息
  removeSession,        // 删除会话
  switchSession,        // 切换会话
  getActiveSession,     // 获取活跃会话
  clearAllSessions      // 清空所有会话
} = useSessionManager();
```

## UI 交互

### 左侧历史记录面板

1. **会话列表**
   - 按更新时间倒序排列
   - 当前活跃会话高亮显示
   - 点击切换会话

2. **悬停交互**
   - 鼠标悬停显示删除按钮
   - 删除按钮带淡入淡出动画
   - 删除操作需确认

3. **新对话按钮**
   - 位于顶部
   - 点击创建新会话并切换

### 会话标题生成规则

- 从第一条用户消息提取
- 最多 30 个字符
- 超出部分用 "..." 截断
- 空会话显示 "新对话"

## 性能优化

1. **防抖保存**
   - 使用 1 秒防抖延迟
   - 避免频繁写入 localStorage
   - 跳过首次渲染保存

2. **智能更新**
   - 仅在消息变化且非输入状态时保存
   - 使用浅比较避免不必要的更新

3. **容量管理**
   - 最多保存 50 个会话
   - 最多保存 200 条生成记录
   - 自动清理最旧数据

## 测试结果

### ✅ 已测试功能

1. **数据持久化**
   - ✅ 发送消息后自动保存
   - ✅ 刷新页面数据完整恢复
   - ✅ 会话标题自动生成

2. **会话管理**
   - ✅ 创建新会话成功
   - ✅ 切换会话恢复历史消息
   - ✅ 删除会话正常工作
   - ✅ 删除当前会话自动切换

3. **UI 交互**
   - ✅ 历史列表正确显示
   - ✅ 活跃会话高亮
   - ✅ 悬停显示删除按钮
   - ✅ 加载状态提示

## 未来扩展

### 计划功能

1. **搜索和筛选**
   - 按标题搜索会话
   - 按时间范围筛选
   - 按标签分类

2. **导入/导出**
   - 导出会话为 JSON
   - 从备份恢复数据
   - 跨设备同步（需后端支持）

3. **会话元数据增强**
   - 手动编辑标题
   - 添加标签/分类
   - 会话归档功能

4. **Library 模块集成**
   - 保存生成图片到记录
   - 支持"再次编辑"跳转
   - 来源追踪

## 注意事项

1. **浏览器兼容性**
   - 需要支持 localStorage 的浏览器
   - 私密/无痕模式可能受限

2. **数据安全**
   - localStorage 数据未加密
   - 不适合存储敏感信息
   - 清除浏览器数据会丢失

3. **容量限制**
   - localStorage 通常 5-10MB
   - 超限时自动清理旧数据
   - 大量图片应存储 URL 而非 base64

## 开发者指南

### 添加新的存储字段

1. 在 `types.js` 中定义类型
2. 在 `localStorage.js` 中添加工具函数
3. 在 `useSessionManager.js` 中添加管理逻辑
4. 在页面组件中使用

### 调试技巧

```javascript
// 在浏览器控制台查看所有存储数据
Object.keys(localStorage)
  .filter(k => k.startsWith('agent_'))
  .forEach(k => console.log(k, localStorage.getItem(k)));

// 清空所有 Agent 数据
Object.keys(localStorage)
  .filter(k => k.startsWith('agent_'))
  .forEach(k => localStorage.removeItem(k));
```

## 总结

✅ 已完成 Agent 模块的完整 localStorage 持久化存储系统
✅ 实现了会话创建、切换、删除等核心功能
✅ 提供了完善的数据管理和自动保存机制
✅ 通过实际测试验证所有功能正常工作

下一步可以将此存储机制扩展到 Library 模块，实现生成记录的持久化展示。
