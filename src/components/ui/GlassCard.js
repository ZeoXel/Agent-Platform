'use client';

import { forwardRef } from 'react';
import styles from './GlassCard.module.css';

/**
 * GlassCard - 毛玻璃卡片组件
 *
 * @param {Object} props
 * @param {'default' | 'light' | 'primary' | 'transparent'} props.variant - 样式变体
 * @param {'sm' | 'md' | 'lg'} props.blur - 模糊强度
 * @param {'sm' | 'md' | 'lg' | 'xl'} props.padding - 内边距
 * @param {'sm' | 'md' | 'lg' | 'full'} props.rounded - 圆角大小
 * @param {boolean} props.hover - 是否有hover效果
 * @param {boolean} props.border - 是否显示边框
 * @param {string} props.className - 额外的CSS类
 * @param {React.ReactNode} props.children - 子元素
 */
const GlassCard = forwardRef(({
    variant = 'default',
    blur = 'md',
    padding = 'md',
    rounded = 'md',
    hover = false,
    border = true,
    className = '',
    children,
    ...props
}, ref) => {
    const classes = [
        styles.card,
        styles[`variant-${variant}`],
        styles[`blur-${blur}`],
        styles[`padding-${padding}`],
        styles[`rounded-${rounded}`],
        hover && styles.hover,
        border && styles.border,
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
