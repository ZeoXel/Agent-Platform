'use client';

import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import styles from './Input.module.css';

/**
 * Input - 输入框组件
 *
 * @param {Object} props
 * @param {'text' | 'password' | 'email' | 'number'} props.type - 输入类型
 * @param {'default' | 'glass'} props.variant - 样式变体
 * @param {'sm' | 'md' | 'lg'} props.size - 大小
 * @param {string} props.placeholder - 占位符
 * @param {boolean} props.disabled - 是否禁用
 * @param {string} props.className - 额外的CSS类
 */
const Input = forwardRef(({
    type = 'text',
    variant = 'default',
    size = 'md',
    disabled = false,
    className = '',
    ...props
}, ref) => {
    const classes = [
        styles.input,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        disabled && styles.disabled,
        className
    ].filter(Boolean).join(' ');

    return (
        <input
            ref={ref}
            type={type}
            className={classes}
            disabled={disabled}
            {...props}
        />
    );
});

Input.displayName = 'Input';

/**
 * TextArea - 文本区域组件（支持自动高度）
 *
 * @param {Object} props
 * @param {'default' | 'glass'} props.variant - 样式变体
 * @param {boolean} props.autoResize - 是否自动调整高度
 * @param {number} props.minRows - 最小行数
 * @param {number} props.maxRows - 最大行数
 * @param {boolean} props.disabled - 是否禁用
 * @param {string} props.className - 额外的CSS类
 */
const TextArea = forwardRef(({
    variant = 'default',
    autoResize = true,
    minRows = 1,
    maxRows = 8,
    disabled = false,
    className = '',
    value,
    onChange,
    ...props
}, ref) => {
    const innerRef = useRef(null);

    useImperativeHandle(ref, () => innerRef.current);

    useEffect(() => {
        if (autoResize && innerRef.current) {
            const el = innerRef.current;
            el.style.height = 'auto';
            const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 24;
            const minHeight = lineHeight * minRows;
            const maxHeight = lineHeight * maxRows;
            const scrollHeight = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
            el.style.height = `${scrollHeight}px`;
        }
    }, [value, autoResize, minRows, maxRows]);

    const classes = [
        styles.textarea,
        styles[`variant-${variant}`],
        autoResize && styles.autoResize,
        disabled && styles.disabled,
        className
    ].filter(Boolean).join(' ');

    return (
        <textarea
            ref={innerRef}
            className={classes}
            value={value}
            onChange={onChange}
            disabled={disabled}
            rows={minRows}
            {...props}
        />
    );
});

TextArea.displayName = 'TextArea';

/**
 * InputWrapper - 输入框容器（毛玻璃效果）
 *
 * @param {Object} props
 * @param {boolean} props.focus - 是否聚焦状态
 * @param {string} props.className - 额外的CSS类
 * @param {React.ReactNode} props.children - 子元素
 */
const InputWrapper = forwardRef(({
    focus = false,
    className = '',
    children,
    ...props
}, ref) => {
    const classes = [
        styles.wrapper,
        focus && styles.wrapperFocus,
        className
    ].filter(Boolean).join(' ');

    return (
        <div ref={ref} className={classes} {...props}>
            {children}
        </div>
    );
});

InputWrapper.displayName = 'InputWrapper';

export { Input, TextArea, InputWrapper };
export default Input;
