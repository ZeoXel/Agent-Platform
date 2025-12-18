'use client';

import { forwardRef } from 'react';
import styles from './ListItem.module.css';

/**
 * ListItem - 列表项组件
 *
 * @param {Object} props
 * @param {boolean} props.active - 是否激活状态
 * @param {boolean} props.hoverable - 是否有hover效果
 * @param {React.ReactNode} props.prefix - 前缀内容（图标等）
 * @param {React.ReactNode} props.suffix - 后缀内容（操作按钮等）
 * @param {string} props.className - 额外的CSS类
 * @param {React.ReactNode} props.children - 主要内容
 */
const ListItem = forwardRef(({
    active = false,
    hoverable = true,
    prefix,
    suffix,
    className = '',
    children,
    ...props
}, ref) => {
    const classes = [
        styles.item,
        active && styles.active,
        hoverable && styles.hoverable,
        className
    ].filter(Boolean).join(' ');

    return (
        <div ref={ref} className={classes} {...props}>
            {prefix && <span className={styles.prefix}>{prefix}</span>}
            <span className={styles.content}>{children}</span>
            {suffix && <span className={styles.suffix}>{suffix}</span>}
        </div>
    );
});

ListItem.displayName = 'ListItem';

/**
 * List - 列表容器
 *
 * @param {Object} props
 * @param {'sm' | 'md'} props.gap - 间距
 * @param {string} props.className - 额外的CSS类
 * @param {React.ReactNode} props.children - 子元素
 */
const List = forwardRef(({
    gap = 'sm',
    className = '',
    children,
    ...props
}, ref) => {
    const classes = [
        styles.list,
        styles[`gap-${gap}`],
        className
    ].filter(Boolean).join(' ');

    return (
        <div ref={ref} className={classes} {...props}>
            {children}
        </div>
    );
});

List.displayName = 'List';

export { ListItem, List };
export default ListItem;
