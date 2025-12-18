'use client';

import { useState, forwardRef } from 'react';
import {
    Briefcase,
    PenTool,
    FileText,
    Package,
    Users,
    Zap,
    Check,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import styles from './PackCard.module.css';

// Pack 图标映射
const packIcons = {
    briefcase: Briefcase,
    'pen-tool': PenTool,
    'file-text': FileText,
    default: Package,
};

/**
 * PackCard - 能力包卡片
 */
const PackCard = forwardRef(({
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

    const Icon = packIcons[pack.icon] || packIcons.default;
    const enabledCount = enabledCapes
        ? capes.filter((c) => enabledCapes.has(c.id)).length
        : capes.length;
    const allEnabled = enabledCount === capes.length;
    const someEnabled = enabledCount > 0 && enabledCount < capes.length;

    const countClass = allEnabled
        ? styles.allEnabled
        : someEnabled
        ? styles.someEnabled
        : styles.noneEnabled;

    return (
        <div ref={ref} className={`${styles.card} ${className}`}>
            {/* Header */}
            <div
                className={styles.header}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className={styles.headerTop}>
                    <div className={styles.headerLeft}>
                        <div
                            className={styles.iconBox}
                            style={{
                                backgroundColor: `${pack.color || '#3B82F6'}15`,
                            }}
                        >
                            <Icon style={{ color: pack.color || '#3B82F6' }} />
                        </div>
                        <div className={styles.titleWrap}>
                            <div className={styles.titleRow}>
                                <h3 className={styles.title}>{pack.display_name}</h3>
                                <span className={styles.version}>v{pack.version}</span>
                            </div>
                            <p className={styles.description}>{pack.description}</p>
                        </div>
                    </div>

                    <div className={styles.headerRight}>
                        <span className={`${styles.count} ${countClass}`}>
                            {enabledCount}/{capes.length}
                        </span>
                        {isExpanded ? (
                            <ChevronDown className={styles.chevron} />
                        ) : (
                            <ChevronRight className={styles.chevron} />
                        )}
                    </div>
                </div>

                {/* Tags */}
                <div className={styles.tags}>
                    {pack.target_users?.slice(0, 3).map((user) => (
                        <span key={user} className={`${styles.tag} ${styles.tagUser}`}>
                            <Users />
                            {user}
                        </span>
                    ))}
                    {pack.scenarios?.slice(0, 2).map((scenario) => (
                        <span key={scenario} className={`${styles.tag} ${styles.tagScenario}`}>
                            <Zap />
                            {scenario}
                        </span>
                    ))}
                </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
                <div className={styles.expandedContent}>
                    <div className={styles.expandedInner}>
                        {/* Actions */}
                        <div className={styles.actions}>
                            <span className={styles.actionsText}>
                                包含 {capes.length} 个能力
                            </span>
                            {(onEnableAll || onDisableAll) && (
                                <div className={styles.actionBtns}>
                                    {onEnableAll && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEnableAll();
                                            }}
                                            className={`${styles.actionBtn} ${styles.enable}`}
                                        >
                                            全部启用
                                        </button>
                                    )}
                                    <span className={styles.separator}>|</span>
                                    {onDisableAll && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDisableAll();
                                            }}
                                            className={`${styles.actionBtn} ${styles.disable}`}
                                        >
                                            全部禁用
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Cape list */}
                        <div className={styles.capeList}>
                            {capes.map((cape) => {
                                const isEnabled = enabledCapes
                                    ? enabledCapes.has(cape.id)
                                    : true;
                                return (
                                    <div
                                        key={cape.id}
                                        className={`${styles.capeItem} ${isEnabled ? styles.enabled : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onToggleCape) {
                                                onToggleCape(cape.id, !isEnabled);
                                            }
                                        }}
                                    >
                                        <div className={styles.capeInfo}>
                                            <div className={styles.capeTitle}>
                                                <span className={`${styles.capeName} ${!isEnabled ? styles.disabled : ''}`}>
                                                    {cape.name}
                                                </span>
                                                <span className={styles.capeType}>
                                                    {cape.execution_type}
                                                </span>
                                            </div>
                                            <p className={styles.capeDesc}>
                                                {cape.description}
                                            </p>
                                        </div>

                                        <div className={`${styles.toggleCircle} ${isEnabled ? styles.enabled : styles.disabled}`}>
                                            {isEnabled && <Check />}
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

/**
 * PackList - Pack 列表
 */
function PackList({
    packs,
    capesByPack,
    enabledCapes,
    onToggleCape,
    onEnablePackCapes,
    onDisablePackCapes,
}) {
    return (
        <div className={styles.packList}>
            {packs.map((pack, index) => (
                <PackCard
                    key={pack.name}
                    pack={pack}
                    capes={capesByPack?.get(pack.name) || []}
                    enabledCapes={enabledCapes}
                    onToggleCape={onToggleCape}
                    onEnableAll={
                        onEnablePackCapes
                            ? () => onEnablePackCapes(pack.name)
                            : undefined
                    }
                    onDisableAll={
                        onDisablePackCapes
                            ? () => onDisablePackCapes(pack.name)
                            : undefined
                    }
                    defaultExpanded={index === 0}
                />
            ))}
        </div>
    );
}

/**
 * PackBadge - Pack 徽章
 */
function PackBadge({ pack, enabledCount, totalCount, onClick }) {
    const Icon = packIcons[pack.icon] || packIcons.default;
    const allEnabled = enabledCount === totalCount;

    return (
        <button
            onClick={onClick}
            className={`${styles.badge} ${allEnabled ? styles.allEnabled : styles.partial}`}
        >
            <Icon />
            <span className={styles.badgeName}>{pack.display_name}</span>
            <span className={`${styles.badgeCount} ${allEnabled ? styles.allEnabled : styles.partial}`}>
                {enabledCount}/{totalCount}
            </span>
        </button>
    );
}

export default PackCard;
export { PackCard, PackList, PackBadge };
