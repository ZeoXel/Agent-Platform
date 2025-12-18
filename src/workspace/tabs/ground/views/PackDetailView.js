"use client";

import { useEffect, useState } from 'react';
import { capeService } from '@/services/capeService';
import styles from './PackDetailView.module.css';

// Cape 执行类型图标映射
const EXECUTION_TYPE_ICONS = {
  tool: '🔧',
  llm: '🧠',
  hybrid: '⚡',
  code: '💻',
  workflow: '🔄',
};

export default function PackDetailView({
  item,
  savedState,
  onStateChange,
  onBack,
  onSelectCape,
}) {
  const [packDetail, setPackDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // 加载 Pack 详情
  useEffect(() => {
    async function loadPackDetail() {
      if (!item?.packName) return;

      setLoading(true);
      try {
        const detail = await capeService.getPackDetail(item.packName);
        setPackDetail(detail);
      } catch (err) {
        console.error('Failed to load pack detail:', err);
        // 使用传入的 item 数据作为后备
        setPackDetail({
          name: item.packName,
          display_name: item.title,
          description: item.description,
          capes: item.capes || [],
        });
      } finally {
        setLoading(false);
      }
    }
    loadPackDetail();
  }, [item]);

  const handleCapeClick = (cape) => {
    if (onSelectCape) {
      onSelectCape(cape.id);
    }
  };

  const capes = packDetail?.capes || item?.capes || [];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button type="button" className={styles.backLink} onClick={onBack}>
          ← Back to Explore
        </button>

        <div className={styles.packHeader}>
          <div
            className={styles.packIconLarge}
            style={{ background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}30 100%)` }}
          >
            {item.icon}
          </div>

          <div className={styles.packInfo}>
            <div className={styles.packTitleRow}>
              <h1 className={styles.packTitle}>{item.title}</h1>
              <span className={styles.packBadge}>Pack</span>
            </div>
            <p className={styles.packDescription}>{item.description}</p>

            <div className={styles.packStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{capes.length}</span>
                <span className={styles.statLabel}>Capabilities</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>Active</span>
                <span className={styles.statLabel}>Status</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>Free</span>
                <span className={styles.statLabel}>Pricing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>
          <span>⚡</span> Available Capabilities
        </h2>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            Loading capabilities...
          </div>
        ) : capes.length > 0 ? (
          <div className={styles.capesGrid}>
            {capes.map((cape) => {
              const executionType = cape.execution_type || cape.executionType || 'tool';
              const icon = EXECUTION_TYPE_ICONS[executionType] || EXECUTION_TYPE_ICONS.tool;
              const tags = cape.tags || cape.metadata?.tags || [];

              return (
                <button
                  type="button"
                  key={cape.id}
                  className={styles.capeCard}
                  onClick={() => handleCapeClick(cape)}
                >
                  <div className={styles.capeCardHeader}>
                    <div className={`${styles.capeIcon} ${styles[executionType]}`}>
                      {icon}
                    </div>
                    <span className={styles.capeType}>{executionType}</span>
                  </div>

                  <h3 className={styles.capeName}>{cape.name}</h3>
                  <p className={styles.capeDesc}>{cape.description}</p>

                  {tags.length > 0 && (
                    <div className={styles.capeTags}>
                      {tags.slice(0, 3).map((tag) => (
                        <span key={tag} className={styles.capeTag}>{tag}</span>
                      ))}
                    </div>
                  )}

                  <span className={styles.capeArrow}>→</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <h3>No capabilities found</h3>
            <p>This pack doesn't have any capabilities yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
