'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    X,
    Search,
    ChevronRight,
    Wrench,
    GitBranch,
    Code,
    Brain,
    Layers,
} from 'lucide-react';
import styles from './CapePanel.module.css';

// 执行类型图标映射
const executionIcons = {
    tool: Wrench,
    workflow: GitBranch,
    code: Code,
    llm: Brain,
    hybrid: Layers,
};

/**
 * CapePanel - Cape 选择面板
 */
function CapePanel({ capes = [], isOpen, onClose, onSelect }) {
    const [search, setSearch] = useState('');
    const [filteredCapes, setFilteredCapes] = useState(capes);

    // Filter capes based on search
    useEffect(() => {
        if (!search.trim()) {
            setFilteredCapes(capes);
            return;
        }

        const query = search.toLowerCase();
        const filtered = capes.filter(
            (cape) =>
                cape.name.toLowerCase().includes(query) ||
                cape.id.toLowerCase().includes(query) ||
                cape.tags?.some((t) => t.toLowerCase().includes(query)) ||
                cape.description?.toLowerCase().includes(query)
        );
        setFilteredCapes(filtered);
    }, [search, capes]);

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleSelect = useCallback(
        (cape) => {
            if (onSelect) {
                onSelect(cape);
            }
            onClose();
        },
        [onSelect, onClose]
    );

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className={`${styles.backdrop} ${styles.fadeIn}`} onClick={onClose} />

            {/* Panel */}
            <div className={`${styles.panel} ${styles.slideIn}`}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>可用能力</h2>
                    <button onClick={onClose} className={styles.closeBtn}>
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
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="搜索能力..."
                            className={styles.searchInput}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Cape list */}
                <div className={styles.list}>
                    {filteredCapes.length === 0 ? (
                        <div className={styles.empty}>没有找到匹配的能力</div>
                    ) : (
                        <div className={styles.listInner}>
                            {filteredCapes.map((cape) => {
                                const Icon = executionIcons[cape.execution_type] || Layers;
                                return (
                                    <button
                                        key={cape.id}
                                        onClick={() => handleSelect(cape)}
                                        className={styles.item}
                                    >
                                        <div className={styles.itemIcon}>
                                            <Icon />
                                        </div>
                                        <div className={styles.itemContent}>
                                            <div className={styles.itemTitle}>
                                                <span className={styles.itemName}>
                                                    {cape.name}
                                                </span>
                                                <span className={styles.itemId}>
                                                    /{cape.id}
                                                </span>
                                            </div>
                                            <p className={styles.itemDesc}>
                                                {cape.description}
                                            </p>
                                            {cape.tags?.length > 0 && (
                                                <div className={styles.itemTags}>
                                                    {cape.tags.slice(0, 3).map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className={styles.itemTag}
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight className={styles.itemArrow} />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    共 {capes.length} 个能力可用
                </div>
            </div>
        </>
    );
}

export default CapePanel;
export { CapePanel };
