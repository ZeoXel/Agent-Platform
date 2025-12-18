# SUNSTUDIO 集成方案

## 项目概述

### SUNSTUDIO 是什么？
SUNSTUDIO 是一个基于 Google AI Studio 的**可视化节点编辑器**，专注于多模态 AI 内容生成工作流。它提供了一个类似 ComfyUI/Blender Nodes 的可视化编程界面，让用户通过拖拽和连接节点来创建复杂的 AI 生成管道。

### 核心能力
1. **节点系统** - 支持 6 种节点类型：
   - PROMPT_INPUT: 文本提示输入
   - IMAGE_GENERATOR: 图像生成
   - VIDEO_GENERATOR: 视频生成（含多种模式）
   - VIDEO_ANALYZER: 视频分析
   - IMAGE_EDITOR: 图像编辑
   - AUDIO_GENERATOR: 音频生成

2. **可视化编辑器**
   - 拖拽式节点编辑
   - 节点间连接和数据流
   - 分组和工作流管理
   - 智能布局和碰撞检测

3. **专业工具**
   - SmartSequenceDock: 智能序列生成（图像转场动画）
   - SonicStudio: 音频工作室（音乐/语音生成）
   - ImageCropper: 图像裁剪工具
   - SketchEditor: 草图编辑器
   - AssistantPanel: AI 助手面板

4. **工作流管理**
   - 保存/加载工作流
   - 模板系统
   - 本地存储持久化

---

## 当前技术栈分析

### SUNSTUDIO（原项目）
```json
{
  "框架": "React 19 + TypeScript",
  "构建工具": "Vite 6.2",
  "包管理器": "npm (有 package-lock.json)",
  "AI SDK": "@google/genai (Gemini)",
  "UI 库": "lucide-react (图标)",
  "样式": "内联样式 + Tailwind CSS 类"
}
```

### Agent Platform（目标项目）
```json
{
  "框架": "Next.js 16 (App Router) + React 19",
  "包管理器": "Bun",
  "AI API": "Claude API (通过第三方代理)",
  "样式": "CSS Modules",
  "架构": "Workspace + Tabs 模块化设计"
}
```

### 兼容性分析
✅ **完全兼容**：
- React 19 版本一致
- TypeScript 支持
- 现代 ES 模块语法

⚠️ **需要调整**：
- Vite → Next.js App Router
- npm → Bun
- Gemini API → Claude API（或统一 API 层）
- 导入路径调整
- 客户端组件标记

---

## 集成架构设计

### 1. 模块定位
SUNSTUDIO 作为第四个核心模块 **"Studio"** 集成到 Agent Platform：

| 模块 | 定位 | 路由 |
|------|------|------|
| Agent | 智能对话 | `/workspace?tab=agent` |
| Ground | 工具市场 | `/workspace?tab=ground` |
| Library | 作品库 | `/workspace?tab=library` |
| **Studio** | 工作流编辑器 | `/workspace?tab=studio` |

### 2. 目录结构

```
web/src/
├── workspace/
│   ├── tabs/
│   │   ├── agent/
│   │   ├── ground/
│   │   ├── library/
│   │   └── studio/                    # 🆕 新增 SUNSTUDIO 模块
│   │       ├── StudioTab.js           # 主入口（替代原 App.tsx）
│   │       ├── StudioTab.module.css   # 全局样式
│   │       ├── components/            # 迁移所有组件
│   │       │   ├── Node.jsx
│   │       │   ├── SidebarDock.jsx
│   │       │   ├── SmartSequenceDock.jsx
│   │       │   ├── SonicStudio.jsx
│   │       │   ├── AssistantPanel.jsx
│   │       │   ├── ImageCropper.jsx
│   │       │   ├── SketchEditor.jsx
│   │       │   ├── SettingsModal.jsx
│   │       │   └── VideoNodeModules.jsx
│   │       ├── services/              # 业务逻辑层
│   │       │   ├── geminiService.js   # 重命名为 aiService.js
│   │       │   ├── videoStrategies.js
│   │       │   └── storage.js
│   │       ├── types.ts               # 类型定义
│   │       └── constants.js           # 常量配置
│   ├── config/
│   │   └── tabs.js                    # 🔧 更新：添加 studio 标签
│   └── contexts/
│       └── WorkspaceContext.js
├── app/
│   └── api/                           # 🆕 新增 API 路由
│       └── studio/
│           ├── generate-image/
│           ├── generate-video/
│           ├── generate-audio/
│           └── analyze-video/
└── components/
    └── layout/
        └── Navbar.js                  # 🔧 更新：自动识别新标签
```

---

## 迁移步骤详解

### Phase 1: 配置和路由（基础架构）

#### 1.1 更新标签配置
**文件**: `src/workspace/config/tabs.js`

```javascript
export const WORKSPACE_TABS = [
  { id: 'agent', label: 'Agent' },
  { id: 'ground', label: 'Ground' },
  { id: 'library', label: 'Library' },
  { id: 'studio', label: 'Studio' }, // 🆕 新增
];
```

#### 1.2 创建 Studio Tab 目录
```bash
mkdir -p src/workspace/tabs/studio/{components,services}
```

---

### Phase 2: 组件迁移（核心功能）

#### 2.1 主入口组件迁移
将 `SUNSTUDIO/App.tsx` → `src/workspace/tabs/studio/StudioTab.js`

**关键调整**：
```jsx
// ✅ 添加客户端组件标记
"use client";

// ✅ 调整导入路径
import { Node } from './components/Node';
import { generateImageFromText } from './services/aiService';

// ✅ 使用 CSS Modules
import styles from './StudioTab.module.css';

// ✅ 导出为 Next.js 页面组件
export default function StudioTab() {
  // ... 原有逻辑保持不变
}
```

#### 2.2 组件文件迁移清单
```bash
# 直接复制所有组件到新目录
cp SUNSTUDIO/components/*.tsx src/workspace/tabs/studio/components/

# 批量添加 'use client' 指令（所有组件都需要）
for file in src/workspace/tabs/studio/components/*.tsx; do
  sed -i '' '1s/^/"use client";\n\n/' "$file"
done
```

#### 2.3 样式处理
SUNSTUDIO 使用内联样式，需要提取到 CSS Modules：

**策略**：
1. 保留 Tailwind 类名（项目已支持）
2. 提取复杂内联样式到 `.module.css`
3. 使用 CSS 变量统一主题色

---

### Phase 3: API 集成（关键改造）

#### 3.1 统一 AI 服务层
将 `SUNSTUDIO/services/geminiService.ts` 重构为通用 AI 服务：

**文件**: `src/workspace/tabs/studio/services/aiService.js`

```javascript
/**
 * 统一 AI 服务层 - 支持多种 AI 模型
 * 默认使用 Claude API，可扩展支持 Gemini/OpenAI 等
 */

// Claude API 配置（复用现有环境变量）
const CLAUDE_API_URL = process.env.NEXT_PUBLIC_CLAUDE_THIRD_URL;
const CLAUDE_API_KEY = process.env.NEXT_PUBLIC_CLAUDE_THIRD_KEY;

/**
 * 图像生成（通过 Next.js API Route 调用）
 */
export async function generateImageFromText(prompt, options = {}) {
  try {
    const response = await fetch('/api/studio/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        imageCount: options.imageCount || 1
      })
    });

    if (!response.ok) throw new Error('图像生成失败');
    return await response.json();
  } catch (error) {
    console.error('generateImageFromText error:', error);
    throw error;
  }
}

// ... 其他 AI 功能类似处理
```

#### 3.2 创建 API Routes
**文件**: `src/app/api/studio/generate-image/route.js`

```javascript
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt, imageCount = 1 } = await request.json();

    // 调用实际的 AI 服务（Claude/Gemini/Stability AI 等）
    const images = await callImageGenerationAPI(prompt, imageCount);

    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// 实际的 AI 调用逻辑（可以根据需求选择不同的 AI 服务）
async function callImageGenerationAPI(prompt, count) {
  // TODO: 集成实际的图像生成 API
  // 可选方案：
  // 1. Stability AI (SDXL)
  // 2. DALL-E 3
  // 3. Midjourney API
  // 4. 本地 Stable Diffusion

  throw new Error('图像生成 API 待配置');
}
```

---

### Phase 4: 依赖管理

#### 4.1 安装依赖（使用 Bun）
```bash
cd web

# 添加 SUNSTUDIO 特有依赖
bun add lucide-react

# 如果保留 Gemini 支持
bun add @google/genai

# 可选：添加其他 AI SDK
# bun add openai  # OpenAI SDK
# bun add @anthropic-ai/sdk  # Claude SDK
```

#### 4.2 更新 package.json
```json
{
  "dependencies": {
    "lucide-react": "^0.555.0",
    "@google/genai": "^1.30.0"
  }
}
```

---

## 技术债务和优化建议

### 立即处理（MVP 必需）
- [ ] 将所有组件标记为客户端组件（`'use client'`）
- [ ] 调整所有导入路径为 Next.js 别名（`@/`）
- [ ] 创建统一的 AI 服务 API Routes
- [ ] 测试节点拖拽和连接功能
- [ ] 验证本地存储在 Next.js 中的行为

### 后续优化（渐进式改进）
1. **性能优化**
   - 使用 React.memo 优化节点组件
   - 虚拟化长列表（工作流列表）
   - 懒加载大型组件（SonicStudio）

2. **用户体验**
   - 添加键盘快捷键说明
   - 工作流模板库
   - 撤销/重做功能

3. **数据持久化**
   - 从 localStorage 迁移到数据库
   - 跨设备同步工作流
   - 版本历史记录

4. **AI 能力扩展**
   - 支持更多 AI 模型选择
   - 模型参数可配置化
   - Prompt 模板库

---

## 风险评估

### 高风险项
| 风险点 | 影响 | 缓解措施 |
|--------|------|----------|
| API 兼容性 | 核心功能不可用 | 先实现 Mock API，渐进式集成真实 AI |
| 样式冲突 | UI 显示异常 | 使用 CSS Modules 隔离样式 |
| 性能问题 | 节点数量多时卡顿 | 启用 React Profiler 监控，按需优化 |

### 中风险项
| 风险点 | 影响 | 缓解措施 |
|--------|------|----------|
| 存储迁移 | 现有工作流丢失 | 提供导入/导出功能 |
| 依赖冲突 | 构建失败 | 锁定依赖版本，使用 Bun 的 lockfile |

---

## 测试计划

### 单元测试
- [ ] 节点创建/删除/连接逻辑
- [ ] 工作流序列化/反序列化
- [ ] AI 服务调用 Mock

### 集成测试
- [ ] 完整工作流执行（Prompt → Image → Video）
- [ ] 工作流保存/加载
- [ ] 多种节点类型组合

### E2E 测试
- [ ] 从空白画布创建完整工作流
- [ ] 跨标签切换状态保持
- [ ] 浏览器刷新后恢复工作流

---

## 成功指标

### 功能完整性
- ✅ 所有 6 种节点类型可正常创建和配置
- ✅ 节点连接和数据流正确传递
- ✅ 工作流可保存和恢复
- ✅ AI 生成功能正常工作（至少支持图像生成）

### 用户体验
- ✅ 导航栏新增 "Studio" 入口
- ✅ 标签切换流畅，状态保持
- ✅ 拖拽操作无明显延迟（<100ms）
- ✅ 响应式布局适配不同屏幕

### 技术质量
- ✅ 无控制台错误或警告
- ✅ 打包体积增长 <2MB（gzip 后）
- ✅ 首次渲染时间 <1s
- ✅ 代码符合 ESLint 规范

---

## 时间估算

| 阶段 | 工作量 | 优先级 |
|------|--------|--------|
| Phase 1: 配置和路由 | 0.5 天 | P0 |
| Phase 2: 组件迁移 | 2 天 | P0 |
| Phase 3: API 集成（Mock） | 1 天 | P0 |
| Phase 4: 依赖管理 | 0.5 天 | P0 |
| **MVP 总计** | **4 天** | - |
| Phase 5: 真实 AI 集成 | 2 天 | P1 |
| Phase 6: 优化和测试 | 1 天 | P1 |
| **完整版总计** | **7 天** | - |

---

## 下一步行动

1. **立即执行**（今天）
   - [x] 分析 SUNSTUDIO 架构 ✅
   - [x] 编写集成方案文档 ✅
   - [ ] 更新标签配置
   - [ ] 创建 Studio 目录结构

2. **本周完成**（MVP）
   - [ ] 迁移核心组件
   - [ ] 实现 Mock API
   - [ ] 基础功能测试

3. **下周优化**（完整版）
   - [ ] 集成真实 AI 服务
   - [ ] 性能优化
   - [ ] 完善文档
