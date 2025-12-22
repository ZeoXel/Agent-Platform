'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'light' | 'primary' | 'transparent';
type Blur = 'sm' | 'md' | 'lg';
type Padding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
type Rounded = 'sm' | 'md' | 'lg' | 'full';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  blur?: Blur;
  padding?: Padding;
  rounded?: Rounded;
  hover?: boolean;
  border?: boolean;
  glow?: boolean;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  default: 'bg-white/20 backdrop-saturate-150',
  light: 'bg-white/10 backdrop-saturate-125',
  primary: 'bg-blue-500/15 backdrop-saturate-150',
  transparent: 'bg-transparent'
};

const blurs: Record<Blur, string> = {
  sm: 'backdrop-blur-md',
  md: 'backdrop-blur-xl',
  lg: 'backdrop-blur-2xl'
};

const paddings: Record<Padding, string> = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
};

const roundeds: Record<Rounded, string> = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full'
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({
  variant = 'default',
  blur = 'md',
  padding = 'md',
  rounded = 'md',
  hover = false,
  border = true,
  glow = false,
  className = '',
  children,
  ...props
}, ref) => {
  const classes = [
    // 基础样式
    variants[variant],
    blurs[blur],
    paddings[padding],
    roundeds[rounded],
    // 边框 - 使用微妙的白色边框
    border && 'border border-white/40',
    // 内发光效果
    glow && 'ring-1 ring-inset ring-white/20',
    // 过渡动画
    'transition-all duration-300 ease-out',
    // 悬停效果 - 增强亮度和饱和度，无阴影
    hover && 'hover:bg-white/30 hover:border-white/50 hover:backdrop-saturate-200',
    className
  ].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';
export default GlassCard;
