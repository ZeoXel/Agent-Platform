'use client';

import { forwardRef, ReactNode } from 'react';
import { Wrench, GitBranch, Code, Brain, Layers, Clock, Zap, Shield, Settings2, LucideIcon } from 'lucide-react';

type ExecutionType = 'tool' | 'workflow' | 'code' | 'llm' | 'hybrid';

interface Cape {
  id: string;
  name: string;
  description?: string;
  execution_type: ExecutionType;
  intent_patterns?: string[];
  tags?: string[];
  timeout_seconds?: number;
  risk_level?: string;
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

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function ToggleSwitch({ enabled, onChange }: ToggleSwitchProps) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(!enabled); }}
      className={`w-12 h-6 rounded-full p-0.5 transition-all flex-shrink-0 ${enabled ? 'bg-blue-500' : 'bg-gray-300'}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

interface CapeCardProps {
  cape: Cape;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  onConfigure?: () => void;
  className?: string;
}

export const CapeCard = forwardRef<HTMLDivElement, CapeCardProps>(({
  cape,
  enabled = true,
  onToggle,
  onConfigure,
  className = '',
}, ref) => {
  const Icon = executionIcons[cape.execution_type] || Layers;
  const colorClass = typeColors[cape.execution_type] || typeColors.hybrid;
  const disabled = !enabled;

  return (
    <div
      ref={ref}
      className={`p-4 rounded-xl transition-all duration-300 ease-out
        backdrop-blur-xl backdrop-saturate-150 bg-white/25
        border border-white/40
        ${disabled ? 'opacity-60' : ''}
        ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          backdrop-blur-xl backdrop-saturate-150 border ${colorClass} ${disabled ? 'opacity-50' : ''}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium truncate ${disabled ? 'text-gray-400' : 'text-gray-800'}`}>
            {cape.name}
          </h3>
          <span className="text-xs text-gray-400">/{cape.id}</span>
        </div>
        {onToggle && <ToggleSwitch enabled={enabled} onChange={onToggle} />}
      </div>

      {/* Description */}
      <p className={`text-sm mb-3 line-clamp-2 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
        {cape.description}
      </p>

      {/* Intent Patterns */}
      {cape.intent_patterns && cape.intent_patterns.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-1">触发意图</div>
          <div className="flex flex-wrap gap-1">
            {cape.intent_patterns.slice(0, 3).map((pattern) => (
              <span key={pattern} className={`text-xs px-2 py-0.5 rounded-full
                bg-white/50 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
                &quot;{pattern}&quot;
              </span>
            ))}
            {cape.intent_patterns.length > 3 && (
              <span className="text-xs text-gray-400">+{cape.intent_patterns.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {cape.tags && cape.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {cape.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/20">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {cape.timeout_seconds && (
            <span className="flex items-center gap-1"><Clock size={12} />{cape.timeout_seconds}s</span>
          )}
          <span className="flex items-center gap-1"><Zap size={12} />{cape.execution_type}</span>
          {cape.risk_level && (
            <span className={`flex items-center gap-1 ${cape.risk_level === 'high' ? 'text-red-500' : ''}`}>
              <Shield size={12} />{cape.risk_level}
            </span>
          )}
        </div>
        {onConfigure && (
          <button
            onClick={(e) => { e.stopPropagation(); onConfigure(); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/30 transition-all duration-200 active:scale-[0.95]"
          >
            <Settings2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
});

CapeCard.displayName = 'CapeCard';

interface CapeGridProps {
  capes: Cape[];
  enabledCapes?: Set<string>;
  onToggle?: (id: string, enabled: boolean) => void;
  columns?: 2 | 3;
}

export function CapeGrid({ capes, enabledCapes, onToggle, columns = 2 }: CapeGridProps) {
  return (
    <div className={`grid gap-4 ${columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {capes.map((cape) => (
        <CapeCard
          key={cape.id}
          cape={cape}
          enabled={enabledCapes ? enabledCapes.has(cape.id) : true}
          onToggle={onToggle ? (enabled) => onToggle(cape.id, enabled) : undefined}
        />
      ))}
    </div>
  );
}

interface CapeCompactListProps {
  capes: Cape[];
  enabledCapes?: Set<string>;
}

export function CapeCompactList({ capes, enabledCapes }: CapeCompactListProps) {
  const enabledList = enabledCapes ? capes.filter((c) => enabledCapes.has(c.id)) : capes;

  return (
    <div className="flex flex-wrap gap-2">
      {enabledList.map((cape) => {
        const Icon = executionIcons[cape.execution_type] || Layers;
        const colorClass = typeColors[cape.execution_type] || typeColors.hybrid;
        return (
          <div key={cape.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full
            backdrop-blur-xl backdrop-saturate-150 border ${colorClass} text-sm`}>
            <Icon size={14} />
            <span>{cape.name}</span>
          </div>
        );
      })}
    </div>
  );
}

export default CapeCard;
