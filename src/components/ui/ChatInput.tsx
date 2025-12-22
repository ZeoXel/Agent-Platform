'use client';

import { forwardRef, ButtonHTMLAttributes, useRef, useEffect, ChangeEvent, KeyboardEvent, ReactNode } from 'react';
import { HiPaperClip, HiTrash } from 'react-icons/hi2';
import { IoSend } from 'react-icons/io5';

interface Attachment {
  id: string;
  name: string;
  size: number;
  type?: string;
  url: string;
}

interface ChatInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSend?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  attachments?: Attachment[];
  onAttach?: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment?: (id: string) => void;
  leftActions?: ReactNode;
  className?: string;
}

export const ChatInput = forwardRef<HTMLDivElement, ChatInputProps>(({
  value = '',
  onChange,
  onSend,
  onKeyDown,
  placeholder = '输入消息...',
  disabled = false,
  attachments = [],
  onAttach,
  onRemoveAttachment,
  leftActions,
  className = ''
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend?.();
    }
    onKeyDown?.(e);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    onAttach?.(e);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const wrapperClasses = [
    'w-full max-w-3xl backdrop-blur-2xl backdrop-saturate-150',
    'bg-white/25 border border-white/40 rounded-2xl p-3',
    'transition-all duration-300 ease-out',
    'hover:bg-white/30 hover:border-white/50',
    'focus-within:bg-white/35 focus-within:border-white/50 focus-within:ring-1 focus-within:ring-white/30',
    className
  ].filter(Boolean).join(' ');

  return (
    <div ref={ref} className="flex justify-center pointer-events-none">
      <div className={`pointer-events-auto ${wrapperClasses}`}>
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map(file => (
              <div key={file.id} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/50 border border-dashed border-gray-300">
                {file.type?.startsWith('image/') && (
                  <img src={file.url} alt={file.name} className="w-9 h-9 rounded object-cover" />
                )}
                <div className="text-xs">
                  <p className="font-medium truncate max-w-[100px]">{file.name}</p>
                  <p className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-gray-200 text-gray-500"
                  onClick={() => onRemoveAttachment?.(file.id)}
                >
                  <HiTrash size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          className="w-full bg-transparent border-none outline-none resize-none text-base px-2 py-1"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />

        <div className="flex justify-between items-center px-2 mt-2">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="p-2 rounded-lg text-gray-500 hover:bg-white/30 hover:text-gray-700 transition-all duration-200 active:scale-[0.95]"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <HiPaperClip size={18} />
            </button>
            {leftActions}
          </div>
          <button
            className="p-2 rounded-lg text-blue-500 hover:bg-blue-500/15 transition-all duration-200 active:scale-[0.95] disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={onSend}
            disabled={disabled || (!value.trim() && attachments.length === 0)}
          >
            <IoSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  badge?: number | string;
  children?: ReactNode;
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(({
  badge,
  className = '',
  children,
  ...props
}, ref) => {
  const classes = [
    'relative p-2 rounded-lg text-gray-500 hover:bg-white/30 hover:text-gray-700 transition-all duration-200 active:scale-[0.95]',
    className
  ].filter(Boolean).join(' ');

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
      {badge !== undefined && badge !== null && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';
export default ChatInput;
