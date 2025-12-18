'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search,
    RefreshCw,
    LayoutGrid,
    List,
    Zap,
    Package,
    CheckCircle,
    AlertCircle,
    Loader2,
    Inbox,
} from 'lucide-react';
import { capeService } from '@/services/capeService';
import { CapeGrid, CapeCompactList } from '@/components/cape/CapeCard';
import { PackList, PackBadge } from '@/components/cape/PackCard';
import styles from './CapeTab.module.css';

/**
 * CapeTab - 能力管理面板
 */
export default function CapeTab() {
    // State
    const [capes, setCapes] = useState([]);
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [view, setView] = useState('packs'); // 'packs' | 'grid'
    const [enabledCapes, setEnabledCapes] = useState(new Set());

    // Load data
    const loadData = useCallback(async (forceRefresh = false) => {
        setLoading(true);
        setError(null);

        try {
            // 并行获取 capes 和 packs
            const [capesRes, packsRes] = await Promise.all([
                capeService.getCapes(forceRefresh),
                capeService.getPacks(forceRefresh).catch(() => ({ packs: [] })),
            ]);

            const capesData = capesRes.capes || capesRes || [];
            const packsData = packsRes.packs || packsRes || [];

            setCapes(capesData);
            setPacks(packsData);

            // 默认启用所有 capes
            setEnabledCapes(new Set(capesData.map((c) => c.id)));
        } catch (err) {
            console.error('Load error:', err);
            setError(err.message || 'Failed to load capabilities');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Filter capes
    const filteredCapes = useMemo(() => {
        if (!search.trim()) return capes;

        const query = search.toLowerCase();
        return capes.filter(
            (cape) =>
                cape.name.toLowerCase().includes(query) ||
                cape.id.toLowerCase().includes(query) ||
                cape.tags?.some((t) => t.toLowerCase().includes(query)) ||
                cape.description?.toLowerCase().includes(query)
        );
    }, [capes, search]);

    // Group capes by pack
    const capesByPack = useMemo(() => {
        const map = new Map();
        packs.forEach((pack) => {
            const packCapes = capes.filter(
                (cape) => pack.cape_ids?.includes(cape.id)
            );
            map.set(pack.name, packCapes);
        });
        return map;
    }, [capes, packs]);

    // Toggle handlers
    const handleToggleCape = useCallback((capeId, enabled) => {
        setEnabledCapes((prev) => {
            const next = new Set(prev);
            if (enabled) {
                next.add(capeId);
            } else {
                next.delete(capeId);
            }
            return next;
        });
    }, []);

    const handleEnablePackCapes = useCallback(
        (packName) => {
            const packCapes = capesByPack.get(packName) || [];
            setEnabledCapes((prev) => {
                const next = new Set(prev);
                packCapes.forEach((cape) => next.add(cape.id));
                return next;
            });
        },
        [capesByPack]
    );

    const handleDisablePackCapes = useCallback(
        (packName) => {
            const packCapes = capesByPack.get(packName) || [];
            setEnabledCapes((prev) => {
                const next = new Set(prev);
                packCapes.forEach((cape) => next.delete(cape.id));
                return next;
            });
        },
        [capesByPack]
    );

    // Stats
    const stats = useMemo(() => ({
        totalCapes: capes.length,
        totalPacks: packs.length,
        enabledCapes: enabledCapes.size,
    }), [capes.length, packs.length, enabledCapes.size]);

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>能力管理</h1>
                    <span className={styles.subtitle}>
                        管理 AI 能力 (Capes) 和能力包 (Packs)
                    </span>
                </div>

                <div className={styles.headerRight}>
                    {/* Search */}
                    <div className={styles.searchBox}>
                        <Search className={styles.searchIcon} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="搜索能力..."
                            className={styles.searchInput}
                        />
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={() => loadData(true)}
                        className={`${styles.refreshBtn} ${loading ? styles.loading : ''}`}
                        disabled={loading}
                    >
                        <RefreshCw />
                        刷新
                    </button>

                    {/* View toggle */}
                    <div className={styles.viewToggle}>
                        <button
                            onClick={() => setView('packs')}
                            className={`${styles.viewBtn} ${view === 'packs' ? styles.active : ''}`}
                            title="按 Pack 分组"
                        >
                            <List />
                        </button>
                        <button
                            onClick={() => setView('grid')}
                            className={`${styles.viewBtn} ${view === 'grid' ? styles.active : ''}`}
                            title="网格视图"
                        >
                            <LayoutGrid />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className={styles.main}>
                {/* Loading */}
                {loading && (
                    <div className={styles.loading}>
                        <Loader2 />
                        <span>加载能力列表...</span>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className={styles.error}>
                        <AlertCircle />
                        <span>{error}</span>
                        <button onClick={() => loadData(true)} className={styles.retryBtn}>
                            重试
                        </button>
                    </div>
                )}

                {/* Content */}
                {!loading && !error && (
                    <>
                        {/* Stats */}
                        <div className={styles.stats}>
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.blue}`}>
                                    <Zap />
                                </div>
                                <div className={styles.statInfo}>
                                    <h4>{stats.totalCapes}</h4>
                                    <p>总能力数</p>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.purple}`}>
                                    <Package />
                                </div>
                                <div className={styles.statInfo}>
                                    <h4>{stats.totalPacks}</h4>
                                    <p>能力包数</p>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.green}`}>
                                    <CheckCircle />
                                </div>
                                <div className={styles.statInfo}>
                                    <h4>{stats.enabledCapes}</h4>
                                    <p>已启用</p>
                                </div>
                            </div>
                        </div>

                        {/* Empty state */}
                        {capes.length === 0 && (
                            <div className={styles.empty}>
                                <Inbox />
                                <p>暂无可用能力</p>
                                <p>请确保 Cape 服务正在运行</p>
                            </div>
                        )}

                        {/* Packs view */}
                        {view === 'packs' && packs.length > 0 && (
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>能力包</h2>
                                    <div className={styles.sectionActions}>
                                        <button
                                            onClick={() =>
                                                setEnabledCapes(new Set(capes.map((c) => c.id)))
                                            }
                                            className={styles.actionBtn}
                                        >
                                            全部启用
                                        </button>
                                        <button
                                            onClick={() => setEnabledCapes(new Set())}
                                            className={styles.actionBtn}
                                        >
                                            全部禁用
                                        </button>
                                    </div>
                                </div>
                                <PackList
                                    packs={packs}
                                    capesByPack={capesByPack}
                                    enabledCapes={enabledCapes}
                                    onToggleCape={handleToggleCape}
                                    onEnablePackCapes={handleEnablePackCapes}
                                    onDisablePackCapes={handleDisablePackCapes}
                                />
                            </div>
                        )}

                        {/* Grid view */}
                        {(view === 'grid' || packs.length === 0) && filteredCapes.length > 0 && (
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>
                                        所有能力 ({filteredCapes.length})
                                    </h2>
                                    <div className={styles.sectionActions}>
                                        <button
                                            onClick={() =>
                                                setEnabledCapes(
                                                    new Set(filteredCapes.map((c) => c.id))
                                                )
                                            }
                                            className={styles.actionBtn}
                                        >
                                            全部启用
                                        </button>
                                        <button
                                            onClick={() => setEnabledCapes(new Set())}
                                            className={styles.actionBtn}
                                        >
                                            全部禁用
                                        </button>
                                    </div>
                                </div>
                                <CapeGrid
                                    capes={filteredCapes}
                                    enabledCapes={enabledCapes}
                                    onToggle={handleToggleCape}
                                    columns={3}
                                />
                            </div>
                        )}

                        {/* No search results */}
                        {search && filteredCapes.length === 0 && (
                            <div className={styles.empty}>
                                <Search />
                                <p>没有找到匹配 "{search}" 的能力</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
