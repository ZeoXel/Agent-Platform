'use client';

import { forwardRef } from 'react';
import styles from './Loading.module.css';

/**
 * Spinner - 旋转加载指示器
 *
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} props.size - 大小
 * @param {string} props.className - 额外的CSS类
 */
const Spinner = forwardRef(({
    size = 'md',
    className = '',
    ...props
}, ref) => {
    const classes = [
        styles.spinner,
        styles[`spinner-${size}`],
        className
    ].filter(Boolean).join(' ');

    return <span ref={ref} className={classes} {...props} />;
});

Spinner.displayName = 'Spinner';

/**
 * LoadingBubble - 加载气泡（带状态文字）
 *
 * @param {Object} props
 * @param {string} props.text - 状态文字
 * @param {boolean} props.shimmer - 是否显示闪烁效果
 * @param {string} props.className - 额外的CSS类
 */
const LoadingBubble = forwardRef(({
    text = '加载中',
    shimmer = true,
    className = '',
    ...props
}, ref) => {
    const classes = [
        styles.bubble,
        className
    ].filter(Boolean).join(' ');

    return (
        <div ref={ref} className={classes} {...props}>
            <span className={styles.statusText}>
                {text}
                {shimmer && <span className={styles.shimmer}>...</span>}
            </span>
        </div>
    );
});

LoadingBubble.displayName = 'LoadingBubble';

/**
 * ShimmerText - 闪烁文字效果
 *
 * @param {Object} props
 * @param {string} props.className - 额外的CSS类
 * @param {React.ReactNode} props.children - 文字内容
 */
const ShimmerText = forwardRef(({
    className = '',
    children,
    ...props
}, ref) => {
    const classes = [
        styles.shimmerText,
        className
    ].filter(Boolean).join(' ');

    return (
        <span ref={ref} className={classes} {...props}>
            {children}
        </span>
    );
});

ShimmerText.displayName = 'ShimmerText';

/**
 * Skeleton - 骨架屏组件
 *
 * @param {Object} props
 * @param {'text' | 'circle' | 'rect'} props.variant - 变体
 * @param {string} props.width - 宽度
 * @param {string} props.height - 高度
 * @param {string} props.className - 额外的CSS类
 */
const Skeleton = forwardRef(({
    variant = 'text',
    width,
    height,
    className = '',
    style = {},
    ...props
}, ref) => {
    const classes = [
        styles.skeleton,
        styles[`skeleton-${variant}`],
        className
    ].filter(Boolean).join(' ');

    return (
        <span
            ref={ref}
            className={classes}
            style={{ width, height, ...style }}
            {...props}
        />
    );
});

Skeleton.displayName = 'Skeleton';

export { Spinner, LoadingBubble, ShimmerText, Skeleton };
export default LoadingBubble;
