'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Search, ChevronRight, Wrench, GitBranch, Code, Brain, Layers, LucideIcon } from 'lucide-react';

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

interface CapePanelProps {
  capes?: Cape[];
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (cape: Cape) => void;
}

export function CapePanel({ capes = [], isOpen, onClose, onSelect }: CapePanelProps) {
  const [search, setSearch] = useState('');
  const [filteredCapes, setFilteredCapes] = useState(capes);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredCapes(capes);
      return;
    }
    const query = search.toLowerCase();
    setFilteredCapes(capes.filter(
      (cape) =>
        cape.name.toLowerCase().includes(query) ||
        cape.id.toLowerCase().includes(query) ||
        cape.tags?.some((t) => t.toLowerCase().includes(query)) ||
        cape.description?.toLowerCase().includes(query)
    ));
  }, [search, capes]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSelect = useCallback((cape: Cape) => {
    onSelect?.(cape);
    onClose();
  }, [onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[400px] max-w-full z-50 flex flex-col
        backdrop-blur-2xl backdrop-saturate-150 bg-white/40
        border-l border-white/40
        animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/20">
          <h2 className="text-lg font-semibold text-gray-800">可用能力</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-all"
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索能力..."
              className="flex-1 bg-transparent border-none outline-none text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredCapes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">没有找到匹配的能力</div>
          ) : (
            filteredCapes.map((cape) => {
              const Icon = executionIcons[cape.execution_type] || Layers;
              return (
                <button
                  key={cape.id}
                  onClick={() => handleSelect(cape)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ease-out
                    backdrop-blur-xl backdrop-saturate-150 bg-white/20
                    border border-white/30 hover:bg-white/30 hover:border-white/40"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                    backdrop-blur-xl backdrop-saturate-150 bg-blue-500/15 border border-blue-400/30 text-blue-600">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 truncate">{cape.name}</span>
                      <span className="text-xs text-gray-400">/{cape.id}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{cape.description}</p>
                    {cape.tags && cape.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {cape.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/50 text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/30 text-sm text-gray-500 text-center
          backdrop-blur-xl backdrop-saturate-150 bg-white/15">
          共 {capes.length} 个能力可用
        </div>
      </div>
    </>
  );
}

export default CapePanel;
