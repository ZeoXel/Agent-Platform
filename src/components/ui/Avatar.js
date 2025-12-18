'use client';

import { forwardRef } from 'react';
import styles from './Avatar.module.css';

/**
 * Avatar - 头像组件
 *
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} props.size - 大小
 * @param {'default' | 'primary' | 'secondary'} props.variant - 样式变体
 * @param {string} props.src - 图片地址
 * @param {string} props.alt - 图片alt
 * @param {string} props.fallback - 无图片时显示的文字或图标
 * @param {string} props.className - 额外的CSS类
 */
const Avatar = forwardRef(({
    size = 'md',
    variant = 'default',
    src,
    alt = '',
    fallback,
    className = '',
    ...props
}, ref) => {
    const classes = [
        styles.avatar,
        styles[`size-${size}`],
        styles[`variant-${variant}`],
        className
    ].filter(Boolean).join(' ');

    return (
        <div ref={ref} className={classes} {...props}>
            {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={alt} className={styles.image} />
            ) : (
                <span className={styles.fallback}>{fallback}</span>
            )}
        </div>
    );
});

Avatar.displayName = 'Avatar';

export default Avatar;
