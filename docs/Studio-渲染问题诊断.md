# Studio 渲染问题诊断指南

## 快速检查步骤

### 1. 启动开发服务器
```bash
cd web
bun run dev
```

### 2. 在浏览器中打开开发者工具
- Chrome/Edge: `F12` 或 `Cmd+Option+I` (Mac)
- 打开 Console 标签页

### 3. 访问 Studio 页面
打开: http://localhost:3000/workspace?tab=studio

### 4. 查看错误信息

#### 可能的错误类型

**A. 模块导入错误**
```
Error: Cannot find module './components/XXX'
Module not found: Can't resolve './services/XXX'
```

**解决方案**: 检查文件是否存在
```bash
ls src/workspace/tabs/studio/components/
ls src/workspace/tabs/studio/services/
```

---

**B. 运行时错误**
```
Uncaught TypeError: Cannot read property 'xxx' of undefined
ReferenceError: xxx is not defined
```

**解决方案**: 检查浏览器 Console 中的完整错误堆栈

---

**C. 空白页面但无错误**
- 检查 Elements 标签，查看是否有 DOM 元素但样式问题
- 检查 Network 标签，查看是否有资源加载失败

---

**D. 水合错误 (Hydration Error)**
```
Warning: Text content did not match. Server: "x" Client: "y"
Unhandled Runtime Error: Hydration failed
```

**原因**: 服务端渲染和客户端渲染不匹配

**解决方案**: 确保所有组件都有 `"use client"` 指令

---

## 常见问题修复

### 问题 1: 组件未找到
```bash
# 验证所有组件文件存在
cd src/workspace/tabs/studio/components
ls -1 *.tsx

# 应该看到这些文件:
# Node.tsx
# SidebarDock.tsx
# AssistantPanel.tsx
# SmartSequenceDock.tsx
# ImageCropper.tsx
# SketchEditor.tsx
# SonicStudio.tsx
# SettingsModal.tsx
# VideoNodeModules.tsx
# ChatWindow.tsx
# CanvasBoard.tsx
# MultiFrameDock.tsx
```

### 问题 2: 服务层导入失败
```bash
# 验证 services 文件存在
cd src/workspace/tabs/studio/services
ls -1 *.ts

# 应该看到:
# geminiService.ts
# videoStrategies.ts
# storage.ts
```

### 问题 3: 使用简化版本测试
如果原始版本失败，使用测试版本：

```javascript
// src/workspace/components/WorkspaceShell.js
- import StudioTab from '@/workspace/tabs/studio/StudioTab';
+ import StudioTab from '@/workspace/tabs/studio/StudioTab.test';
```

---

## 调试模式

### 启用详细日志
在 `StudioTab.tsx` 顶部添加:

```typescript
"use client";

console.log("🎨 Studio Tab Loading...");

import React, { useState, useRef, useEffect, useCallback } from 'react';
// ... 其他导入

export default function StudioTab() {
  console.log("🎨 Studio Tab Rendering");

  // ... 组件代码

  useEffect(() => {
    console.log("🎨 Studio Tab Mounted");
  }, []);

  // ...
}
```

### 查看编译输出
```bash
# 启动开发服务器并查看编译信息
bun run dev

# 查找错误信息
# 关注包含 "Error" 或 "Warning" 的行
```

---

## 逐步排查

### Step 1: 测试最小版本 (已验证 ✅)
```typescript
// StudioTab.test.tsx
"use client";
export default function StudioTab() {
  return <div>Test</div>;
}
```

### Step 2: 添加状态管理
```typescript
"use client";
import React, { useState } from 'react';

export default function StudioTab() {
  const [nodes, setNodes] = useState([]);
  return <div>Nodes: {nodes.length}</div>;
}
```

### Step 3: 添加组件导入 (已验证 ✅)
```typescript
import { Node } from './components/Node';
import { SidebarDock } from './components/SidebarDock';
```

### Step 4: 添加服务导入
```typescript
import { saveToStorage, loadFromStorage } from './services/storage';
```

### Step 5: 完整版本
使用原始的 `StudioTab.tsx`

---

## 报告错误信息

如果以上步骤无法解决，请提供：

1. **浏览器 Console 的完整错误信息** (截图或文本)
2. **服务器终端的错误输出**
3. **访问的 URL**
4. **浏览器版本**

### 获取错误信息的方法

**浏览器 Console**:
```
右键页面 → 检查 → Console 标签
复制所有红色错误信息
```

**服务器终端**:
```bash
bun run dev 2>&1 | tee studio_errors.log
# 然后访问 Studio 页面
# 查看 studio_errors.log 文件
```

---

## 临时解决方案

如果急需使用，可以使用测试版本:

```bash
# 使用简化的测试版本
# 已创建: src/workspace/tabs/studio/StudioTab.test.tsx
```

在 `WorkspaceShell.js` 中:
```javascript
import StudioTab from '@/workspace/tabs/studio/StudioTab.test';
```

这个版本可以确保页面可以渲染，然后逐步添加功能。

---

## 验证文件完整性

```bash
# 检查关键文件是否存在
cd /Users/g/Desktop/探索/Agent\ Platform/web

echo "检查主文件..."
[ -f "src/workspace/tabs/studio/StudioTab.tsx" ] && echo "✅ StudioTab.tsx" || echo "❌ StudioTab.tsx"
[ -f "src/workspace/tabs/studio/types.ts" ] && echo "✅ types.ts" || echo "❌ types.ts"

echo -e "\n检查组件..."
for f in Node SidebarDock AssistantPanel SmartSequenceDock ImageCropper SketchEditor SonicStudio SettingsModal VideoNodeModules; do
  [ -f "src/workspace/tabs/studio/components/${f}.tsx" ] && echo "✅ ${f}.tsx" || echo "❌ ${f}.tsx"
done

echo -e "\n检查服务..."
for f in geminiService videoStrategies storage; do
  [ -f "src/workspace/tabs/studio/services/${f}.ts" ] && echo "✅ ${f}.ts" || echo "❌ ${f}.ts"
done
```

---

**需要帮助?**

请提供以下信息:
1. 浏览器 Console 的错误截图
2. 服务器终端的输出
3. 执行上述验证脚本的结果
