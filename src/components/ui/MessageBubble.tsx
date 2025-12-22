'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';

type Variant = 'user' | 'assistant';
type Align = 'user' | 'assistant';

interface MessageBubbleProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  streaming?: boolean;
  children?: ReactNode;
}

const bubbleVariants: Record<Variant, string> = {
  user: `
    backdrop-blur-xl backdrop-saturate-150
    bg-blue-500/15 border border-blue-400/30
    rounded-tr-sm
  `,
  assistant: `
    backdrop-blur-xl backdrop-saturate-150
    bg-white/20 border border-white/40
    rounded-tl-sm
  `
};

export const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(({
  variant = 'assistant',
  streaming = false,
  className = '',
  children,
  ...props
}, ref) => {
  const classes = [
    'max-w-[70%] px-4 py-3 rounded-2xl',
    'transition-all duration-300 ease-out',
    bubbleVariants[variant].replace(/\s+/g, ' ').trim(),
    streaming && 'animate-pulse',
    className
  ].filter(Boolean).join(' ');

  return <div ref={ref} className={classes} {...props}>{children}</div>;
});

MessageBubble.displayName = 'MessageBubble';

interface MessageRowProps extends HTMLAttributes<HTMLDivElement> {
  align?: Align;
  children?: ReactNode;
}

export const MessageRow = forwardRef<HTMLDivElement, MessageRowProps>(({
  align = 'assistant',
  className = '',
  children,
  ...props
}, ref) => {
  const classes = [
    'flex',
    align === 'user' ? 'justify-end' : 'justify-start',
    className
  ].filter(Boolean).join(' ');

  return <div ref={ref} className={classes} {...props}>{children}</div>;
});

MessageRow.displayName = 'MessageRow';

interface ImageItem {
  url: string;
  alt?: string;
}

interface ImageGridProps extends HTMLAttributes<HTMLDivElement> {
  images?: ImageItem[];
}

export const ImageGrid = forwardRef<HTMLDivElement, ImageGridProps>(({
  images = [],
  className = '',
  ...props
}, ref) => {
  if (!images.length) return null;

  const classes = ['flex flex-wrap gap-2 mt-3', className].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} {...props}>
      {images.map((img, idx) => (
        <a
          key={idx}
          href={img.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
        >
          <img src={img.url} alt={img.alt || `图片 ${idx + 1}`} className="max-h-80 rounded-xl" />
        </a>
      ))}
    </div>
  );
});

ImageGrid.displayName = 'ImageGrid';
export default MessageBubble;
