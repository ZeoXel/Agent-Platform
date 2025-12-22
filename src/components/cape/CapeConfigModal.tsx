'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { X, Search, Wrench, GitBranch, Code, Brain, Layers, Zap, Loader2, LucideIcon } from 'lucide-react';
import { capeService } from '@/services/capeService';

type ExecutionType = 'tool' | 'workflow' | 'code' | 'llm' | 'hybrid';

interface Cape {
  id: string;
  name: string;
  description?: string;
  execution_type: ExecutionType;
  tags?: string[];
}

const executionIcons: Record<ExecutionType, LucideIcon> = {
  tool: Wrench,
  workflow: GitBranch,
  code: Code,
  llm: Brain,
  hybrid: Layers,
};

const typeColors: Record<ExecutionType, string> = {
  tool: 'bg-blue-500/15 text-blue-600 border-blue-400/30',
  workflow: 'bg-purple-500/15 text-purple-600 border-purple-400/30',
  code: 'bg-green-500/15 text-green-600 border-green-400/30',
  llm: 'bg-orange-500/15 text-orange-600 border-orange-400/30',
  hybrid: 'bg-pink-500/15 text-pink-600 border-pink-400/30',
};

interface CapeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  enabledCapes?: Set<string>;
  onToggleCape?: (id: string, enabled: boolean) => void;
  onSave?: (enabledCapes: Set<string>) => void;
}

export default function CapeConfigModal({
  isOpen,
  onClose,
  enabledCapes,
  onToggleCape,
  onSave,
}: CapeConfigModalProps) {
  const [capes, setCapes] = useState<Cape[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [localEnabled, setLocalEnabled] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    async function loadCapes() {
      setLoading(true);
      try {
        const data = await capeService.getCapes();
        const capesData = data.capes || data || [];
        setCapes(capesData);
        if (enabledCapes) {
          setLocalEnabled(new Set(enabledCapes));
        } else {
          setLocalEnabled(new Set(capesData.map((c: Cape) => c.id)));
        }
      } catch (err) {
        console.error('Failed to load capes:', err);
        setCapes([]);
      } finally {
        setLoading(false);
      }
    }

    loadCapes();
  }, [isOpen, enabledCapes]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  const filteredCapes = useMemo(() => {
    if (!search.trim()) return capes;
    const query = search.toLowerCase();
    return capes.filter(
      cape =>
        cape.name.toLowerCase().includes(query) ||
        cape.id.toLowerCase().includes(query) ||
        cape.tags?.some(t => t.toLowerCase().includes(query)) ||
        cape.description?.toLowerCase().includes(query)
    );
  }, [capes, search]);

  const handleToggle = useCallback((capeId: string) => {
    setLocalEnabled(prev => {
      const next = new Set(prev);
      if (next.has(capeId)) next.delete(capeId);
      else next.add(capeId);
      return next;
    });
  }, []);

  const handleEnableAll = useCallback(() => {
    setLocalEnabled(new Set(capes.map(c => c.id)));
  }, [capes]);

  const handleDisableAll = useCallback(() => {
    setLocalEnabled(new Set());
  }, []);

  const handleSave = useCallback(() => {
    onSave?.(localEnabled);
    if (onToggleCape) {
      capes.forEach(cape => {
        const wasEnabled = enabledCapes?.has(cape.id);
        const isEnabled = localEnabled.has(cape.id);
        if (wasEnabled !== isEnabled) onToggleCape(cape.id, isEnabled);
      });
    }
    handleClose();
  }, [capes, enabledCapes, localEnabled, handleClose, onSave, onToggleCape]);

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-200 ease-out
          ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
          w-[560px] max-w-[90vw] h-[760px] max-h-[80vh] flex flex-col
          backdrop-blur-2xl backdrop-saturate-150 bg-white/45
          border border-white/50 rounded-2xl overflow-hidden
          transition-all duration-200 ease-out
          ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center
              backdrop-blur-xl backdrop-saturate-150 bg-blue-500/15 border border-blue-400/30 text-blue-600">
              <Zap size={20} />
            </div>
            <div>
              <div className="font-semibold text-gray-800">能力配置</div>
              <div className="text-sm text-gray-500">选择本次对话启用的 AI 能力</div>
            </div>
          </div>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-all"
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl
            backdrop-blur-xl backdrop-saturate-150 bg-white/25
            border border-white/40">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索能力..."
              className="flex-1 bg-transparent border-none outline-none text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
              <Loader2 className="animate-spin" size={20} />
              加载中...
            </div>
          ) : filteredCapes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {search ? `没有找到 "${search}" 相关的能力` : '暂无可用能力'}
            </div>
          ) : (
            filteredCapes.map(cape => {
              const Icon = executionIcons[cape.execution_type] || Layers;
              const isEnabled = localEnabled.has(cape.id);
              const colorClass = typeColors[cape.execution_type] || typeColors.hybrid;

              return (
                <div
                  key={cape.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ease-out
                    backdrop-blur-xl backdrop-saturate-150 border
                    ${isEnabled
                      ? 'bg-blue-500/10 border-blue-400/30'
                      : 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40'
                    }`}
                  onClick={() => handleToggle(cape.id)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                    backdrop-blur-xl backdrop-saturate-150 border ${colorClass}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{cape.name}</div>
                    <div className="text-sm text-gray-500 truncate">{cape.description}</div>
                    {cape.tags && cape.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {cape.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-white/50 text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    className={`w-12 h-6 rounded-full p-0.5 transition-all flex-shrink-0
                      ${isEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                    onClick={e => { e.stopPropagation(); handleToggle(cape.id); }}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform
                      ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/30
          backdrop-blur-xl backdrop-saturate-150 bg-white/15">
          <div className="text-sm text-gray-600">
            已启用 <strong className="text-blue-600">{localEnabled.size}</strong> / {capes.length} 个能力
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-xl text-sm font-medium
                backdrop-blur-xl backdrop-saturate-150 bg-white/30
                border border-white/40 text-gray-600
                hover:bg-white/40 hover:border-white/50 transition-all duration-200 active:scale-[0.98]"
              onClick={localEnabled.size === capes.length ? handleDisableAll : handleEnableAll}
            >
              {localEnabled.size === capes.length ? '全部禁用' : '全部启用'}
            </button>
            <button
              className="px-4 py-2 rounded-xl text-sm font-medium
                bg-blue-500/80 border border-blue-400/50
                text-white
                hover:bg-blue-500/90 hover:border-blue-400/70 transition-all duration-200 active:scale-[0.98]"
              onClick={handleSave}
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export { CapeConfigModal };
