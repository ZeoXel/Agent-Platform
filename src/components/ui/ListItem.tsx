'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';

type Gap = 'sm' | 'md';

interface ListItemProps {
  active?: boolean;
  hoverable?: boolean;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ListItem = forwardRef<HTMLDivElement, ListItemProps>(({
  active = false,
  hoverable = true,
  prefixIcon,
  suffixIcon,
  className = '',
  children,
  onClick
}, ref) => {
  const classes = [
    'px-3 py-2 rounded-lg cursor-pointer text-sm flex items-center gap-2 transition-all duration-200 ease-out group',
    active
      ? 'bg-blue-500/15 text-blue-600 font-medium border border-blue-400/30'
      : 'text-gray-700 border border-transparent',
    hoverable && !active && 'hover:bg-white/25 hover:border-white/40',
    className
  ].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} onClick={onClick}>
      {prefixIcon && <span className="flex-shrink-0 flex items-center">{prefixIcon}</span>}
      <span className="flex-1 truncate">{children}</span>
      {suffixIcon && (
        <span className={`flex-shrink-0 flex items-center transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {suffixIcon}
        </span>
      )}
    </div>
  );
});

ListItem.displayName = 'ListItem';

interface ListProps extends HTMLAttributes<HTMLDivElement> {
  gap?: Gap;
  children?: ReactNode;
}

export const List = forwardRef<HTMLDivElement, ListProps>(({
  gap = 'sm',
  className = '',
  children,
  ...props
}, ref) => {
  const gaps: Record<Gap, string> = { sm: 'space-y-1', md: 'space-y-2' };
  const classes = ['flex flex-col', gaps[gap], className].filter(Boolean).join(' ');
  return <div ref={ref} className={classes} {...props}>{children}</div>;
});

List.displayName = 'List';
export default ListItem;
