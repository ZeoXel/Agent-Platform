'use client';

import { forwardRef } from 'react';
import {
    Wrench,
    GitBranch,
    Code,
    Brain,
    Layers,
    Clock,
    Zap,
    Shield,
    Settings2,
} from 'lucide-react';
import styles from './CapeCard.module.css';

// 执行类型图标映射
const executionIcons = {
    tool: Wrench,
    workflow: GitBranch,
    code: Code,
    llm: Brain,
    hybrid: Layers,
};

/**
 * Toggle 开关
 */
function ToggleSwitch({ enabled, onChange }) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onChange(!enabled);
            }}
            className={`${styles.toggle} ${enabled ? styles.active : ''}`}
        >
            <div className={styles.toggleKnob} />
        </button>
    );
}

/**
 * CapeCard - Cape 能力卡片
 */
const CapeCard = forwardRef(({
    cape,
    enabled = true,
    onToggle,
    onConfigure,
    className = '',
}, ref) => {
    const Icon = executionIcons[cape.execution_type] || Layers;
    const disabled = !enabled;

    return (
        <div
            ref={ref}
            className={`${styles.card} ${disabled ? styles.disabled : ''} ${className}`}
        >
            {/* Header */}
            <div className={styles.header}>
                <div className={`${styles.iconBox} ${styles[`type-${cape.execution_type}`]} ${disabled ? styles.disabled : ''}`}>
                    <Icon />
                </div>
                <div className={styles.titleWrap}>
                    <h3 className={`${styles.title} ${disabled ? styles.disabled : ''}`}>
                        {cape.name}
                    </h3>
                    <span className={styles.id}>/{cape.id}</span>
                </div>
                {onToggle && <ToggleSwitch enabled={enabled} onChange={onToggle} />}
            </div>

            {/* Description */}
            <p className={`${styles.description} ${disabled ? styles.disabled : ''}`}>
                {cape.description}
            </p>

            {/* Intent Patterns */}
            {cape.intent_patterns?.length > 0 && (
                <div className={styles.intents}>
                    <div className={styles.intentsLabel}>触发意图</div>
                    <div className={styles.intentsList}>
                        {cape.intent_patterns.slice(0, 3).map((pattern) => (
                            <span
                                key={pattern}
                                className={`${styles.intent} ${disabled ? styles.disabled : ''}`}
                            >
                                "{pattern}"
                            </span>
                        ))}
                        {cape.intent_patterns.length > 3 && (
                            <span className={styles.intentMore}>
                                +{cape.intent_patterns.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Tags */}
            {cape.tags?.length > 0 && (
                <div className={styles.tags}>
                    {cape.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className={styles.tag}>
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className={styles.footer}>
                <div className={styles.meta}>
                    {cape.timeout_seconds && (
                        <span className={styles.metaItem}>
                            <Clock />
                            {cape.timeout_seconds}s
                        </span>
                    )}
                    <span className={styles.metaItem}>
                        <Zap />
                        {cape.execution_type}
                    </span>
                    {cape.risk_level && (
                        <span className={`${styles.metaItem} ${styles[`risk-${cape.risk_level}`]}`}>
                            <Shield />
                            {cape.risk_level}
                        </span>
                    )}
                </div>
                {onConfigure && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onConfigure();
                        }}
                        className={styles.configBtn}
                        title="配置"
                    >
                        <Settings2 />
                    </button>
                )}
            </div>
        </div>
    );
});

CapeCard.displayName = 'CapeCard';

/**
 * CapeGrid - Cape 卡片网格
 */
function CapeGrid({ capes, enabledCapes, onToggle, columns = 2 }) {
    const colsClass = columns === 3 ? styles['cols-3'] : styles['cols-2'];

    return (
        <div className={`${styles.grid} ${colsClass}`}>
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

/**
 * CapeCompactList - 紧凑列表显示
 */
function CapeCompactList({ capes, enabledCapes }) {
    const enabledList = enabledCapes
        ? capes.filter((c) => enabledCapes.has(c.id))
        : capes;

    return (
        <div className={styles.compactList}>
            {enabledList.map((cape) => {
                const Icon = executionIcons[cape.execution_type] || Layers;
                return (
                    <div
                        key={cape.id}
                        className={`${styles.compactItem} ${styles[`type-${cape.execution_type}`]}`}
                    >
                        <Icon />
                        <span>{cape.name}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default CapeCard;
export { CapeCard, CapeGrid, CapeCompactList, ToggleSwitch };
