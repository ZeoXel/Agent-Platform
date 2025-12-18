'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    X,
    Search,
    Wrench,
    GitBranch,
    Code,
    Brain,
    Layers,
    Zap,
    Loader2,
} from 'lucide-react';
import { capeService } from '@/services/capeService';
import styles from './CapeConfigModal.module.css';

// 执行类型图标映射
const executionIcons = {
    tool: Wrench,
    workflow: GitBranch,
    code: Code,
    llm: Brain,
    hybrid: Layers,
};

/**
 * CapeConfigModal - Cape 快速配置弹窗
 * 用于 Agent 页面工具按钮点击后展示
 */
export default function CapeConfigModal({
    isOpen,
    onClose,
    enabledCapes,
    onToggleCape,
    onSave,
}) {
    const [capes, setCapes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [localEnabled, setLocalEnabled] = useState(new Set());

    // 加载 capes
    useEffect(() => {
        if (!isOpen) return;

        async function loadCapes() {
            setLoading(true);
            try {
                const data = await capeService.getCapes();
                const capesData = data.capes || data || [];
                setCapes(capesData);
                // 初始化本地启用状态
                if (enabledCapes) {
                    setLocalEnabled(new Set(enabledCapes));
                } else {
                    // 默认全部启用
                    setLocalEnabled(new Set(capesData.map(c => c.id)));
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

    // ESC 关闭
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // 搜索过滤
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

    // 切换单个 cape
    const handleToggle = useCallback((capeId) => {
        setLocalEnabled(prev => {
            const next = new Set(prev);
            if (next.has(capeId)) {
                next.delete(capeId);
            } else {
                next.add(capeId);
            }
            return next;
        });
    }, []);

    // 全部启用/禁用
    const handleEnableAll = useCallback(() => {
        setLocalEnabled(new Set(capes.map(c => c.id)));
    }, [capes]);

    const handleDisableAll = useCallback(() => {
        setLocalEnabled(new Set());
    }, []);

    // 保存
    const handleSave = useCallback(() => {
        if (onSave) {
            onSave(localEnabled);
        }
        if (onToggleCape) {
            // 通知父组件每个变化
            capes.forEach(cape => {
                const wasEnabled = enabledCapes?.has(cape.id);
                const isEnabled = localEnabled.has(cape.id);
                if (wasEnabled !== isEnabled) {
                    onToggleCape(cape.id, isEnabled);
                }
            });
        }
        onClose();
    }, [capes, enabledCapes, localEnabled, onClose, onSave, onToggleCape]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className={styles.overlay} onClick={onClose} />

            {/* Modal */}
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.headerIcon}>
                            <Zap />
                        </div>
                        <div>
                            <div className={styles.title}>能力配置</div>
                            <div className={styles.subtitle}>选择本次对话启用的 AI 能力</div>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X />
                    </button>
                </div>

                {/* Search */}
                <div className={styles.search}>
                    <div className={styles.searchBox}>
                        <Search className={styles.searchIcon} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="搜索能力..."
                            className={styles.searchInput}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.loading}>
                            <Loader2 />
                            加载中...
                        </div>
                    ) : filteredCapes.length === 0 ? (
                        <div className={styles.empty}>
                            {search ? `没有找到 "${search}" 相关的能力` : '暂无可用能力'}
                        </div>
                    ) : (
                        filteredCapes.map(cape => {
                            const Icon = executionIcons[cape.execution_type] || Layers;
                            const isEnabled = localEnabled.has(cape.id);

                            return (
                                <div
                                    key={cape.id}
                                    className={`${styles.capeItem} ${isEnabled ? styles.enabled : ''}`}
                                    onClick={() => handleToggle(cape.id)}
                                >
                                    <div className={`${styles.capeIcon} ${styles[`type-${cape.execution_type}`]}`}>
                                        <Icon />
                                    </div>
                                    <div className={styles.capeInfo}>
                                        <div className={styles.capeName}>{cape.name}</div>
                                        <div className={styles.capeDesc}>{cape.description}</div>
                                        {cape.tags?.length > 0 && (
                                            <div className={styles.capeTags}>
                                                {cape.tags.slice(0, 3).map(tag => (
                                                    <span key={tag} className={styles.capeTag}>{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className={`${styles.toggle} ${isEnabled ? styles.active : ''}`}
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleToggle(cape.id);
                                        }}
                                    >
                                        <div className={styles.toggleKnob} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <div className={styles.footerStats}>
                        已启用 <strong>{localEnabled.size}</strong> / {capes.length} 个能力
                    </div>
                    <div className={styles.footerActions}>
                        <button
                            className={`${styles.actionBtn} ${styles.secondary}`}
                            onClick={localEnabled.size === capes.length ? handleDisableAll : handleEnableAll}
                        >
                            {localEnabled.size === capes.length ? '全部禁用' : '全部启用'}
                        </button>
                        <button
                            className={`${styles.actionBtn} ${styles.primary}`}
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
