'use client';

import { forwardRef, HTMLAttributes, ReactNode, CSSProperties } from 'react';

type Position = 'left' | 'right';

interface SidebarProps extends HTMLAttributes<HTMLElement> {
  position?: Position;
  width?: number | string;
  collapsed?: boolean;
  children?: ReactNode;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(({
  position = 'left',
  width = 280,
  collapsed = false,
  className = '',
  children,
  style,
  ...props
}, ref) => {
  const sidebarWidth = typeof width === 'number' ? `${width}px` : width;

  const classes = [
    'flex flex-col h-full flex-shrink-0 overflow-hidden',
    'backdrop-blur-2xl backdrop-saturate-150',
    'bg-white/15',
    'transition-all duration-300 ease-out',
    position === 'left' ? 'border-r border-white/30' : 'border-l border-white/30',
    collapsed && 'w-0 border-none',
    className
  ].filter(Boolean).join(' ');

  return (
    <aside
      ref={ref}
      className={classes}
      style={{ width: collapsed ? 0 : sidebarWidth, ...style } as CSSProperties}
      {...props}
    >
      {children}
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode;
  children?: ReactNode;
}

export const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(({
  action,
  className = '',
  children,
  ...props
}, ref) => {
  const classes = [
    'flex items-center justify-between p-4 flex-shrink-0',
    'text-sm font-semibold text-gray-600',
    className
  ].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} {...props}>
      <span className="flex-1">{children}</span>
      {action && <span className="flex items-center">{action}</span>}
    </div>
  );
});

SidebarHeader.displayName = 'SidebarHeader';

interface SidebarContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const SidebarContent = forwardRef<HTMLDivElement, SidebarContentProps>(({
  className = '',
  children,
  ...props
}, ref) => {
  const classes = ['flex-1 overflow-y-auto px-2', className].filter(Boolean).join(' ');
  return <div ref={ref} className={classes} {...props}>{children}</div>;
});

SidebarContent.displayName = 'SidebarContent';

interface SidebarFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(({
  className = '',
  children,
  ...props
}, ref) => {
  const classes = [
    'p-4 flex-shrink-0',
    'border-t border-white/30',
    className
  ].filter(Boolean).join(' ');

  return <div ref={ref} className={classes} {...props}>{children}</div>;
});

SidebarFooter.displayName = 'SidebarFooter';
export default Sidebar;
