'use client';

import { forwardRef } from 'react';
import styles from './Sidebar.module.css';

/**
 * Sidebar - 侧边栏布局组件
 *
 * @param {Object} props
 * @param {'left' | 'right'} props.position - 位置
 * @param {number | string} props.width - 宽度
 * @param {boolean} props.collapsible - 是否可折叠
 * @param {boolean} props.collapsed - 是否已折叠
 * @param {string} props.className - 额外的CSS类
 * @param {React.ReactNode} props.children - 子元素
 */
const Sidebar = forwardRef(({
    position = 'left',
    width = 280,
    collapsible = false,
    collapsed = false,
    className = '',
    children,
    ...props
}, ref) => {
    const classes = [
        styles.sidebar,
        styles[`position-${position}`],
        collapsed && styles.collapsed,
        className
    ].filter(Boolean).join(' ');

    const sidebarWidth = typeof width === 'number' ? `${width}px` : width;

    return (
        <aside
            ref={ref}
            className={classes}
            style={{ '--sidebar-width': sidebarWidth }}
            {...props}
        >
            {children}
        </aside>
    );
});

Sidebar.displayName = 'Sidebar';

/**
 * SidebarHeader - 侧边栏头部
 *
 * @param {Object} props
 * @param {React.ReactNode} props.action - 右侧操作按钮
 * @param {string} props.className - 额外的CSS类
 * @param {React.ReactNode} props.children - 标题内容
 */
const SidebarHeader = forwardRef(({
    action,
    className = '',
    children,
    ...props
}, ref) => {
    const classes = [
        styles.header,
        className
    ].filter(Boolean).join(' ');

    return (
        <div ref={ref} className={classes} {...props}>
            <span className={styles.headerTitle}>{children}</span>
            {action && <span className={styles.headerAction}>{action}</span>}
        </div>
    );
});

SidebarHeader.displayName = 'SidebarHeader';

/**
 * SidebarContent - 侧边栏内容区
 *
 * @param {Object} props
 * @param {string} props.className - 额外的CSS类
 * @param {React.ReactNode} props.children - 子元素
 */
const SidebarContent = forwardRef(({
    className = '',
    children,
    ...props
}, ref) => {
    const classes = [
        styles.content,
        className
    ].filter(Boolean).join(' ');

    return (
        <div ref={ref} className={classes} {...props}>
            {children}
        </div>
    );
});

SidebarContent.displayName = 'SidebarContent';

/**
 * SidebarFooter - 侧边栏底部
 *
 * @param {Object} props
 * @param {string} props.className - 额外的CSS类
 * @param {React.ReactNode} props.children - 子元素
 */
const SidebarFooter = forwardRef(({
    className = '',
    children,
    ...props
}, ref) => {
    const classes = [
        styles.footer,
        className
    ].filter(Boolean).join(' ');

    return (
        <div ref={ref} className={classes} {...props}>
            {children}
        </div>
    );
});

SidebarFooter.displayName = 'SidebarFooter';

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter };
export default Sidebar;
