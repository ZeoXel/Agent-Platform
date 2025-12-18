'use client';

import { forwardRef } from 'react';
import styles from './Button.module.css';

/**
 * Button - 按钮组件
 *
 * @param {Object} props
 * @param {'default' | 'primary' | 'ghost' | 'danger' | 'icon'} props.variant - 按钮变体
 * @param {'sm' | 'md' | 'lg'} props.size - 按钮大小
 * @param {'default' | 'circle' | 'pill'} props.shape - 按钮形状
 * @param {boolean} props.disabled - 是否禁用
 * @param {boolean} props.loading - 是否加载中
 * @param {React.ReactNode} props.icon - 图标
 * @param {string} props.className - 额外的CSS类
 * @param {React.ReactNode} props.children - 子元素
 */
const Button = forwardRef(({
    variant = 'default',
    size = 'md',
    shape = 'default',
    disabled = false,
    loading = false,
    icon,
    className = '',
    children,
    ...props
}, ref) => {
    const classes = [
        styles.button,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        styles[`shape-${shape}`],
        disabled && styles.disabled,
        loading && styles.loading,
        !children && icon && styles.iconOnly,
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            ref={ref}
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className={styles.spinner} />
            ) : (
                <>
                    {icon && <span className={styles.icon}>{icon}</span>}
                    {children && <span className={styles.text}>{children}</span>}
                </>
            )}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
