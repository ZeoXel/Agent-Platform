/**
 * Liquid Glass Design Tokens
 *
 * 基于 Apple iOS 26 Liquid Glass 设计语言
 * 特点：无阴影、微妙光泽、流畅过渡
 */

// 玻璃基础样式 - 无阴影版本
export const glass = {
  // 默认玻璃效果
  base: `
    backdrop-blur-xl backdrop-saturate-150
    bg-white/20
    border border-white/40
    transition-all duration-300 ease-out
  `.replace(/\s+/g, ' ').trim(),

  // 轻量玻璃
  light: `
    backdrop-blur-lg backdrop-saturate-125
    bg-white/10
    border border-white/30
    transition-all duration-300 ease-out
  `.replace(/\s+/g, ' ').trim(),

  // 主色调玻璃
  primary: `
    backdrop-blur-xl backdrop-saturate-150
    bg-blue-500/15
    border border-blue-300/40
    transition-all duration-300 ease-out
  `.replace(/\s+/g, ' ').trim(),

  // 悬停效果 - 增强亮度和饱和度
  hover: `
    hover:bg-white/30
    hover:border-white/50
    hover:backdrop-saturate-200
  `.replace(/\s+/g, ' ').trim(),

  // 激活状态
  active: `
    bg-blue-500/20
    border-blue-400/50
  `.replace(/\s+/g, ' ').trim(),

  // 聚焦光环 - 使用 ring 代替 shadow
  focus: `
    focus:ring-2 focus:ring-white/30 focus:ring-offset-0
    focus:bg-white/30
  `.replace(/\s+/g, ' ').trim(),
};

// 内发光效果（模拟光泽）
export const innerGlow = {
  subtle: 'ring-1 ring-inset ring-white/20',
  medium: 'ring-1 ring-inset ring-white/30',
  strong: 'ring-2 ring-inset ring-white/40',
};

// 过渡动画
export const transitions = {
  fast: 'transition-all duration-150 ease-out',
  normal: 'transition-all duration-300 ease-out',
  slow: 'transition-all duration-500 ease-out',
  // 弹性效果
  bounce: 'transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
};

// 交互反馈
export const interactive = {
  // 按下缩放
  press: 'active:scale-[0.98]',
  // 悬停提升
  lift: 'hover:-translate-y-0.5',
  // 悬停发光
  glow: 'hover:ring-2 hover:ring-white/30',
};
