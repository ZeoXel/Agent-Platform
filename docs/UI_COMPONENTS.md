# Agent Platform UI 组件库

基于 **Glassmorphism** 设计的 TSX + Tailwind 组件库。

---

## UI 统一性架构

### 设计理念

组件库通过 **分层抽象** 实现全局 UI 统一：

```
┌─────────────────────────────────────────────────────┐
│                   业务页面层                          │
│   AgentTab / StudioTab / GalleryTab / ...           │
├─────────────────────────────────────────────────────┤
│                   业务组件层                          │
│   CapeCard / CapePanel / PackCard / ...             │
├─────────────────────────────────────────────────────┤
│                   UI 组件库                          │
│   GlassCard / Button / Input / Sidebar / ...        │
├─────────────────────────────────────────────────────┤
│                   设计令牌层                          │
│   Tailwind Classes + CSS Variables                  │
└─────────────────────────────────────────────────────┘
```

### 统一机制

#### 1. 设计令牌（Design Tokens）

所有组件共享统一的 Tailwind 类名组合：

```tsx
// 玻璃效果令牌
const GLASS_BASE = "backdrop-blur-xl bg-gradient-to-br from-white/40 to-white/20 border border-white/30";
const GLASS_LIGHT = "backdrop-blur-xl bg-gradient-to-br from-white/30 to-white/10 border border-white/25";
const GLASS_PRIMARY = "backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20";

// 交互效果令牌
const HOVER_LIFT = "transition-all hover:shadow-xl hover:from-white/50 hover:to-white/30";
const ACTIVE_STATE = "bg-gradient-to-br from-blue-500/15 to-blue-500/5 text-blue-600";
```

#### 2. 组件组合（Composition）

高级组件通过组合基础组件实现一致性：

```tsx
// CapeCard 使用 GlassCard 的样式模式
<div className="p-4 rounded-xl backdrop-blur-xl bg-gradient-to-br from-white/40 to-white/20 border border-white/30">
  {/* 内部结构 */}
</div>

// Sidebar 使用相同的玻璃效果
<aside className="backdrop-blur-2xl bg-gradient-to-b from-white/35 to-white/15 border-r border-white/25">
  {/* 内部结构 */}
</aside>
```

#### 3. 类型约束（Type Constraints）

TypeScript 接口确保 Props 一致性：

```tsx
// 所有尺寸变体统一为三档
type Size = 'sm' | 'md' | 'lg';

// 所有变体使用相同的命名模式
type Variant = 'default' | 'primary' | 'ghost' | 'danger';

// 统一的交互状态 Props
interface InteractiveProps {
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
}
```

### 修改 UI 的正确方式

| 修改范围 | 操作位置 | 影响范围 |
|---------|---------|---------|
| 全局玻璃效果 | `globals.css` 变量 或 组件内 Tailwind 类 | 所有使用该样式的组件 |
| 单个组件样式 | 对应 `.tsx` 文件 | 仅该组件 |
| 新增组件变体 | 组件内 variants 对象 | 使用该变体的地方 |
| 颜色主题 | `tailwind.config.js` | 全局 |

### 示例：修改全局玻璃模糊强度

```tsx
// 修改前：所有组件使用 backdrop-blur-xl
// 修改后：改为 backdrop-blur-2xl

// 在以下文件中搜索替换：
// - src/components/ui/*.tsx
// - src/components/cape/*.tsx
// - src/components/layout/*.tsx
```

---

## 设计规范

### 核心样式

```css
/* 玻璃效果 */
backdrop-blur-xl                              /* 模糊 */
bg-gradient-to-br from-white/40 to-white/20   /* 渐变背景 */
border border-white/30                        /* 边框 */
shadow-lg                                     /* 阴影 */
```

### 颜色变量

| 变量 | 值 | 用途 |
|------|-----|------|
| `--primary` | `#2563eb` | 主色调 Blue 600 |
| `--background` | `#f8fafc` | 背景色 Slate 50 |
| `--foreground` | `#0f172a` | 前景色 Slate 900 |

---

## 安装使用

```tsx
import {
  GlassCard,
  Button,
  Input,
  Avatar,
  Sidebar
} from '@/components/ui';
```

---

## 组件文档

### GlassCard 玻璃卡片

通用容器组件，支持多种玻璃效果变体。

```tsx
import { GlassCard } from '@/components/ui';

<GlassCard variant="default" blur="md" padding="md" hover>
  卡片内容
</GlassCard>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'default' \| 'light' \| 'primary' \| 'transparent'` | `'default'` | 背景变体 |
| `blur` | `'sm' \| 'md' \| 'lg'` | `'md'` | 模糊强度 |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 内边距 |
| `rounded` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | 圆角大小 |
| `hover` | `boolean` | `false` | 悬停效果 |
| `border` | `boolean` | `true` | 显示边框 |

#### 变体示例

```tsx
// 默认白色玻璃
<GlassCard variant="default">默认</GlassCard>

// 轻量透明
<GlassCard variant="light">轻量</GlassCard>

// 主题色
<GlassCard variant="primary">主题色</GlassCard>

// 全透明
<GlassCard variant="transparent" border={false}>透明</GlassCard>
```

---

### Button 按钮

支持多种变体和状态的按钮组件。

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" icon={<IconSend />}>
  发送
</Button>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'default' \| 'primary' \| 'ghost' \| 'danger' \| 'icon'` | `'default'` | 按钮变体 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 按钮尺寸 |
| `shape` | `'default' \| 'circle' \| 'pill'` | `'default'` | 按钮形状 |
| `loading` | `boolean` | `false` | 加载状态 |
| `icon` | `ReactNode` | - | 图标元素 |
| `disabled` | `boolean` | `false` | 禁用状态 |

#### 变体示例

```tsx
// 玻璃效果按钮
<Button variant="default">默认</Button>

// 主要操作
<Button variant="primary">确认</Button>

// 幽灵按钮
<Button variant="ghost">取消</Button>

// 危险操作
<Button variant="danger">删除</Button>

// 图标按钮
<Button variant="icon" shape="circle" icon={<HiPlus />} />

// 加载状态
<Button loading>处理中...</Button>
```

---

### Input 输入框

文本输入组件，支持玻璃效果。

```tsx
import { Input, TextArea, InputWrapper } from '@/components/ui';

<Input variant="glass" placeholder="请输入..." />
```

#### Input Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'default' \| 'glass'` | `'default'` | 样式变体 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 输入框尺寸 |
| `disabled` | `boolean` | `false` | 禁用状态 |

#### TextArea Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'default' \| 'glass'` | `'default'` | 样式变体 |
| `autoResize` | `boolean` | `true` | 自动调整高度 |
| `minRows` | `number` | `1` | 最小行数 |
| `maxRows` | `number` | `8` | 最大行数 |

#### InputWrapper Props

玻璃效果输入区域容器。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `focus` | `boolean` | `false` | 聚焦状态样式 |

#### 示例

```tsx
// 普通输入框
<Input placeholder="用户名" />

// 玻璃效果
<Input variant="glass" placeholder="搜索..." />

// 自动高度文本域
<TextArea
  variant="glass"
  autoResize
  minRows={2}
  maxRows={6}
  placeholder="请输入内容..."
/>

// 输入区域容器
<InputWrapper focus={isFocused}>
  <TextArea variant="glass" />
  <Button variant="primary">发送</Button>
</InputWrapper>
```

---

### Avatar 头像

用户头像显示组件。

```tsx
import { Avatar } from '@/components/ui';

<Avatar src="/avatar.jpg" size="md" />
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 头像尺寸 |
| `variant` | `'default' \| 'primary' \| 'secondary'` | `'default'` | 样式变体 |
| `src` | `string` | - | 图片地址 |
| `alt` | `string` | `''` | 图片描述 |
| `fallback` | `ReactNode` | - | 无图片时显示内容 |

#### 尺寸

| Size | 尺寸 |
|------|------|
| `sm` | 32px |
| `md` | 40px |
| `lg` | 56px |

#### 示例

```tsx
// 图片头像
<Avatar src="/user.jpg" alt="用户头像" />

// 文字头像
<Avatar fallback="AI" variant="primary" />

// 大尺寸
<Avatar size="lg" src="/avatar.jpg" />
```

---

### ListItem 列表项

列表项组件，支持激活状态和前后缀图标。

```tsx
import { ListItem, List } from '@/components/ui';

<List>
  <ListItem active prefixIcon={<HiChat />}>
    对话 1
  </ListItem>
  <ListItem>对话 2</ListItem>
</List>
```

#### ListItem Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `active` | `boolean` | `false` | 激活状态 |
| `hoverable` | `boolean` | `true` | 悬停效果 |
| `prefixIcon` | `ReactNode` | - | 前缀图标 |
| `suffixIcon` | `ReactNode` | - | 后缀图标（悬停显示） |
| `onClick` | `() => void` | - | 点击回调 |

#### List Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `gap` | `'sm' \| 'md'` | `'sm'` | 项间距 |

#### 示例

```tsx
<List gap="sm">
  <ListItem
    active={selectedId === 1}
    prefixIcon={<HiChat />}
    suffixIcon={<HiTrash />}
    onClick={() => setSelectedId(1)}
  >
    会话标题
  </ListItem>
</List>
```

---

### Loading 加载状态

一组加载状态指示组件。

```tsx
import { Spinner, LoadingBubble, ShimmerText, Skeleton } from '@/components/ui';
```

#### Spinner 旋转加载

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |

```tsx
<Spinner size="md" />
```

#### LoadingBubble 加载气泡

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `string` | `'加载中'` | 显示文字 |
| `shimmer` | `boolean` | `true` | 闪烁效果 |

```tsx
<LoadingBubble text="思考中" />
```

#### ShimmerText 闪烁文字

```tsx
<ShimmerText>处理中...</ShimmerText>
```

#### Skeleton 骨架屏

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'text' \| 'circle' \| 'rect'` | `'text'` | 形状类型 |
| `width` | `string \| number` | - | 宽度 |
| `height` | `string \| number` | - | 高度 |

```tsx
// 文本骨架
<Skeleton width="80%" />

// 圆形骨架
<Skeleton variant="circle" width={40} height={40} />

// 矩形骨架
<Skeleton variant="rect" width="100%" height={120} />
```

---

### Sidebar 侧边栏

侧边栏布局组件套件。

```tsx
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui';

<Sidebar position="left" width={280}>
  <SidebarHeader action={<Button>+</Button>}>
    标题
  </SidebarHeader>
  <SidebarContent>
    {/* 列表内容 */}
  </SidebarContent>
  <SidebarFooter>
    {/* 底部操作 */}
  </SidebarFooter>
</Sidebar>
```

#### Sidebar Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `'left' \| 'right'` | `'left'` | 位置 |
| `width` | `number \| string` | `280` | 宽度 |
| `collapsed` | `boolean` | `false` | 折叠状态 |

#### SidebarHeader Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `action` | `ReactNode` | - | 右侧操作按钮 |

---

### MessageBubble 消息气泡

聊天消息气泡组件。

```tsx
import { MessageBubble, MessageRow, ImageGrid } from '@/components/ui';

<MessageRow align="assistant">
  <MessageBubble variant="assistant">
    消息内容
    <ImageGrid images={[{ url: '/img.jpg' }]} />
  </MessageBubble>
</MessageRow>
```

#### MessageBubble Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'user' \| 'assistant'` | `'assistant'` | 消息类型 |
| `streaming` | `boolean` | `false` | 流式输出状态 |

#### MessageRow Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `align` | `'user' \| 'assistant'` | `'assistant'` | 对齐方式 |

#### ImageGrid Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `images` | `Array<{ url: string; alt?: string }>` | `[]` | 图片列表 |

#### 示例

```tsx
// 用户消息
<MessageRow align="user">
  <MessageBubble variant="user">
    你好！
  </MessageBubble>
</MessageRow>

// AI 消息（流式）
<MessageRow align="assistant">
  <MessageBubble variant="assistant" streaming>
    正在生成...
  </MessageBubble>
</MessageRow>

// 带图片消息
<MessageRow align="assistant">
  <MessageBubble variant="assistant">
    这是生成的图片：
    <ImageGrid images={[
      { url: '/image1.jpg', alt: '图片1' },
      { url: '/image2.jpg', alt: '图片2' }
    ]} />
  </MessageBubble>
</MessageRow>
```

---

### ChatInput 聊天输入

完整的聊天输入组件，支持附件。

```tsx
import { ChatInput, ActionButton } from '@/components/ui';

<ChatInput
  value={input}
  onChange={setInput}
  onSend={handleSend}
  placeholder="输入消息..."
  attachments={files}
  onAttach={handleAttach}
  onRemoveAttachment={handleRemove}
  leftActions={
    <ActionButton badge={2}>
      <HiWrench />
    </ActionButton>
  }
/>
```

#### ChatInput Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | `''` | 输入值 |
| `onChange` | `(value: string) => void` | - | 值变化回调 |
| `onSend` | `() => void` | - | 发送回调 |
| `onKeyDown` | `(e: KeyboardEvent) => void` | - | 按键回调 |
| `placeholder` | `string` | `'输入消息...'` | 占位文字 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `attachments` | `Attachment[]` | `[]` | 附件列表 |
| `onAttach` | `(e: ChangeEvent) => void` | - | 添加附件回调 |
| `onRemoveAttachment` | `(id: string) => void` | - | 移除附件回调 |
| `leftActions` | `ReactNode` | - | 左侧操作按钮 |

#### Attachment 类型

```tsx
interface Attachment {
  id: string;
  name: string;
  size: number;
  type?: string;
  url: string;
}
```

#### ActionButton Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `badge` | `number \| string` | - | 角标 |

---

## 完整示例

### 聊天界面

```tsx
import {
  Sidebar, SidebarHeader, SidebarContent,
  ListItem, List,
  MessageBubble, MessageRow,
  ChatInput, ActionButton,
  Button, LoadingBubble
} from '@/components/ui';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  return (
    <div className="flex h-screen">
      {/* 侧边栏 */}
      <Sidebar width={280}>
        <SidebarHeader action={<Button variant="icon" icon={<HiPlus />} />}>
          历史记录
        </SidebarHeader>
        <SidebarContent>
          <List>
            {sessions.map(s => (
              <ListItem
                key={s.id}
                active={s.id === activeId}
                suffixIcon={<HiTrash />}
              >
                {s.title}
              </ListItem>
            ))}
          </List>
        </SidebarContent>
      </Sidebar>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <MessageRow key={i} align={msg.role}>
              <MessageBubble variant={msg.role} streaming={msg.isStreaming}>
                {msg.content}
              </MessageBubble>
            </MessageRow>
          ))}
          {isTyping && <LoadingBubble text="思考中" />}
        </div>

        {/* 输入框 */}
        <div className="p-6">
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            placeholder="输入消息..."
          />
        </div>
      </main>
    </div>
  );
}
```

---

## 文件结构

```
src/components/
├── ui/                        # 基础 UI 组件库
│   ├── index.ts               # 统一导出
│   ├── GlassCard.tsx          # 玻璃卡片
│   ├── Button.tsx             # 按钮
│   ├── Input.tsx              # 输入框 (Input, TextArea, InputWrapper)
│   ├── Avatar.tsx             # 头像
│   ├── ListItem.tsx           # 列表项 (ListItem, List)
│   ├── Loading.tsx            # 加载状态 (Spinner, LoadingBubble, ShimmerText, Skeleton)
│   ├── Sidebar.tsx            # 侧边栏 (Sidebar, SidebarHeader, SidebarContent, SidebarFooter)
│   ├── MessageBubble.tsx      # 消息气泡 (MessageBubble, MessageRow, ImageGrid)
│   └── ChatInput.tsx          # 聊天输入 (ChatInput, ActionButton)
│
├── cape/                      # Cape 能力组件
│   ├── index.ts               # 统一导出
│   ├── CapeCard.tsx           # 能力卡片 (CapeCard, CapeGrid, CapeCompactList, ToggleSwitch)
│   ├── CapePanel.tsx          # 能力选择面板
│   ├── PackCard.tsx           # 能力包卡片 (PackCard, PackList, PackBadge)
│   └── CapeConfigModal.tsx    # 能力配置弹窗
│
├── layout/                    # 布局组件
│   └── Navbar.tsx             # 顶部导航栏
│
└── common/                    # 通用组件
    ├── Icons.tsx              # SVG 图标集
    └── AnimatedBackground.tsx # 动态背景
```

---

## 导入方式

```tsx
// UI 基础组件
import { GlassCard, Button, Input, Sidebar } from '@/components/ui';

// Cape 组件
import { CapeCard, CapePanel, PackCard, CapeConfigModal } from '@/components/cape';

// 布局组件
import Navbar from '@/components/layout/Navbar';

// 通用组件
import AnimatedBackground from '@/components/common/AnimatedBackground';
import { LogoIcon, AgentIcon } from '@/components/common/Icons';
```
