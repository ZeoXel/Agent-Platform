'use client';

import { useState, forwardRef } from 'react';
import { Briefcase, PenTool, FileText, Package, Users, Zap, Check, ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';

type ExecutionType = 'tool' | 'workflow' | 'code' | 'llm' | 'hybrid';

interface Cape {
  id: string;
  name: string;
  description?: string;
  execution_type: ExecutionType;
}

interface Pack {
  name: string;
  display_name: string;
  description?: string;
  version: string;
  icon?: string;
  color?: string;
  target_users?: string[];
  scenarios?: string[];
}

const packIcons: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  'pen-tool': PenTool,
  'file-text': FileText,
  default: Package,
};

interface PackCardProps {
  pack: Pack;
  capes?: Cape[];
  enabledCapes?: Set<string>;
  onToggleCape?: (id: string, enabled: boolean) => void;
  onEnableAll?: () => void;
  onDisableAll?: () => void;
  defaultExpanded?: boolean;
  className?: string;
}

export const PackCard = forwardRef<HTMLDivElement, PackCardProps>(({
  pack,
  capes = [],
  enabledCapes,
  onToggleCape,
  onEnableAll,
  onDisableAll,
  defaultExpanded = false,
  className = '',
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const Icon = packIcons[pack.icon || 'default'] || packIcons.default;
  const enabledCount = enabledCapes ? capes.filter((c) => enabledCapes.has(c.id)).length : capes.length;
  const allEnabled = enabledCount === capes.length;
  const someEnabled = enabledCount > 0 && enabledCount < capes.length;

  return (
    <div ref={ref} className={`rounded-xl overflow-hidden transition-all duration-300 ease-out
      backdrop-blur-xl backdrop-saturate-150 bg-white/25
      border border-white/40 ${className}`}>

      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-white/30 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${pack.color || '#3B82F6'}15` }}
          >
            <Icon style={{ color: pack.color || '#3B82F6' }} size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">{pack.display_name}</h3>
              <span className="text-xs text-gray-400">v{pack.version}</span>
            </div>
            <p className="text-sm text-gray-500 truncate">{pack.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium px-2 py-0.5 rounded-full
              ${allEnabled ? 'bg-green-500/10 text-green-600' :
                someEnabled ? 'bg-yellow-500/10 text-yellow-600' :
                'bg-gray-500/10 text-gray-500'}`}>
              {enabledCount}/{capes.length}
            </span>
            {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {pack.target_users?.slice(0, 3).map((user) => (
            <span key={user} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-600">
              <Users size={12} />{user}
            </span>
          ))}
          {pack.scenarios?.slice(0, 2).map((scenario) => (
            <span key={scenario} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-600">
              <Zap size={12} />{scenario}
            </span>
          ))}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/20">
          <div className="p-4">
            {/* Actions */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">包含 {capes.length} 个能力</span>
              {(onEnableAll || onDisableAll) && (
                <div className="flex items-center gap-2 text-sm">
                  {onEnableAll && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEnableAll(); }}
                      className="text-blue-600 hover:underline"
                    >
                      全部启用
                    </button>
                  )}
                  <span className="text-gray-300">|</span>
                  {onDisableAll && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDisableAll(); }}
                      className="text-gray-500 hover:underline"
                    >
                      全部禁用
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Cape List */}
            <div className="space-y-2">
              {capes.map((cape) => {
                const isEnabled = enabledCapes ? enabledCapes.has(cape.id) : true;
                return (
                  <div
                    key={cape.id}
                    onClick={(e) => { e.stopPropagation(); onToggleCape?.(cape.id, !isEnabled); }}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ease-out
                      backdrop-blur-xl backdrop-saturate-150 border
                      ${isEnabled
                        ? 'bg-blue-500/10 border-blue-400/30'
                        : 'bg-white/15 border-white/30 hover:bg-white/25 hover:border-white/40'
                      }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isEnabled ? 'text-gray-800' : 'text-gray-400'}`}>
                          {cape.name}
                        </span>
                        <span className="text-xs text-gray-400">{cape.execution_type}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{cape.description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                      ${isEnabled ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                      {isEnabled && <Check size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PackCard.displayName = 'PackCard';

interface PackListProps {
  packs: Pack[];
  capesByPack?: Map<string, Cape[]>;
  enabledCapes?: Set<string>;
  onToggleCape?: (id: string, enabled: boolean) => void;
  onEnablePackCapes?: (packName: string) => void;
  onDisablePackCapes?: (packName: string) => void;
}

export function PackList({
  packs,
  capesByPack,
  enabledCapes,
  onToggleCape,
  onEnablePackCapes,
  onDisablePackCapes,
}: PackListProps) {
  return (
    <div className="space-y-4">
      {packs.map((pack, index) => (
        <PackCard
          key={pack.name}
          pack={pack}
          capes={capesByPack?.get(pack.name) || []}
          enabledCapes={enabledCapes}
          onToggleCape={onToggleCape}
          onEnableAll={onEnablePackCapes ? () => onEnablePackCapes(pack.name) : undefined}
          onDisableAll={onDisablePackCapes ? () => onDisablePackCapes(pack.name) : undefined}
          defaultExpanded={index === 0}
        />
      ))}
    </div>
  );
}

interface PackBadgeProps {
  pack: Pack;
  enabledCount: number;
  totalCount: number;
  onClick?: () => void;
}

export function PackBadge({ pack, enabledCount, totalCount, onClick }: PackBadgeProps) {
  const Icon = packIcons[pack.icon || 'default'] || packIcons.default;
  const allEnabled = enabledCount === totalCount;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ease-out
        backdrop-blur-xl backdrop-saturate-150 border text-sm active:scale-[0.97]
        ${allEnabled
          ? 'bg-green-500/15 border-green-400/30 text-green-600'
          : 'bg-white/20 border-white/30 text-gray-600 hover:bg-white/30 hover:border-white/40'
        }`}
    >
      <Icon size={14} />
      <span>{pack.display_name}</span>
      <span className={`text-xs ${allEnabled ? 'text-green-500' : 'text-gray-400'}`}>
        {enabledCount}/{totalCount}
      </span>
    </button>
  );
}

export default PackCard;
