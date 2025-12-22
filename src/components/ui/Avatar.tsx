'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'default' | 'primary' | 'secondary';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: Size;
  variant?: Variant;
  src?: string;
  alt?: string;
  fallback?: ReactNode;
}

const sizes: Record<Size, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-lg'
};

const variants: Record<Variant, string> = {
  default: 'backdrop-blur-xl backdrop-saturate-150 bg-white/25 border border-white/40',
  primary: 'backdrop-blur-xl backdrop-saturate-150 bg-blue-500/20 border border-blue-400/40 text-blue-600',
  secondary: 'backdrop-blur-xl backdrop-saturate-150 bg-gray-200/30 border border-gray-300/40 text-gray-600'
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(({
  size = 'md',
  variant = 'default',
  src,
  alt = '',
  fallback,
  className = '',
  ...props
}, ref) => {
  const classes = [
    'rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 transition-all duration-200 ease-out',
    sizes[size],
    variants[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} {...props}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="font-medium">{fallback}</span>
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';
export default Avatar;
