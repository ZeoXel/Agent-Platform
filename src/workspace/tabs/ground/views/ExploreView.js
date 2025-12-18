"use client";

import styles from './ExploreView.module.css';

export default function ExploreView({
  featuredItem,
  popularModels,
  recommendedWorkflows,
  packItems = [],
  packsLoading = false,
  onSelectModel,
}) {
  const handleSelect = (id) => {
    if (!id || !onSelectModel) return;
    onSelectModel(id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerControl}>
        <h1 className={styles.pageTitle}>Explore</h1>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search models, workflows or packs..."
            className={styles.searchInput}
            disabled
          />
        </div>
      </div>

      <div className={styles.featuredCard}>
        <div
          className={styles.featuredImage}
          style={{ backgroundImage: `url(${featuredItem.coverImage})` }}
        >
          <div className={styles.featuredTag}>Latest</div>
        </div>
        <div className={styles.featuredContent}>
          <h2 className={styles.featuredTitle}>{featuredItem.title}</h2>
          <p className={styles.featuredDesc}>{featuredItem.description}</p>
          <button
            type="button"
            className={styles.ctaButton}
            onClick={() => handleSelect(featuredItem.id)}
          >
            Get started <span>→</span>
          </button>
        </div>
      </div>

      {/* Capability Packs Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <span>📦</span> Capability Packs
          </div>
          <span className={styles.viewMore}>
            {packsLoading ? 'Loading...' : `${packItems.length} packs`}
          </span>
        </div>
        {packsLoading ? (
          <div className={styles.packGrid}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.loadingCard}></div>
            ))}
          </div>
        ) : packItems.length > 0 ? (
          <div className={styles.packGrid}>
            {packItems.map((pack) => (
              <button
                type="button"
                key={pack.id}
                className={styles.packCard}
                onClick={() => handleSelect(pack.id)}
                style={{ '--pack-color': pack.color }}
              >
                <div className={styles.packHeader}>
                  <span className={styles.packIcon}>{pack.icon}</span>
                  <span className={styles.packBadge}>{pack.capeCount} capabilities</span>
                </div>
                <h3 className={styles.packTitle}>{pack.title}</h3>
                <p className={styles.packDesc}>{pack.description}</p>
                <div className={styles.packFooter}>
                  <span className={styles.packStatus}>Ready</span>
                  <span className={styles.packArrow}>→</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No packs available. Make sure Cape service is running.</p>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <span>🤖</span> Popular Models
          </div>
          <span className={styles.viewMore}></span>
        </div>
        <div className={styles.listGrid}>
          {popularModels.map((model) => (
            <button
              type="button"
              key={model.id}
              className={styles.listItem}
              onClick={() => handleSelect(model.id)}
            >
              <div
                className={styles.itemImage}
                style={
                  model.coverImage
                    ? { backgroundImage: `url(${model.coverImage})` }
                    : {}
                }
              >
                {!model.coverImage && '🖼️'}
              </div>
              <div className={styles.itemContent}>
                <div className={styles.itemHeader}>
                  <div className={styles.itemTitle}>{model.title}</div>
                </div>
                <div className={styles.itemAuthor}>
                  <span>{model.author}</span>
                </div>
                <p className={styles.itemDesc}>{model.description}</p>
                <div className={styles.itemMeta}>
                  <span className={styles.runCount}>{model.runCount} runs</span>
                  {model.tags.map((tag) => (
                    <span key={tag} className={styles.metaTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <span>🏗️</span> Recommended Workflows
          </div>
          <span className={styles.viewMore}>View more →</span>
        </div>
        <div className={styles.galleryGrid}>
          {recommendedWorkflows.map((workflow) => (
            <button
              type="button"
              key={workflow.id}
              className={styles.galleryCard}
              onClick={() => handleSelect(workflow.id)}
            >
              <div
                className={styles.galleryPreview}
                style={{ backgroundImage: `url(${workflow.coverImage})` }}
              />
              <div className={styles.galleryContent}>
                <div className={styles.galleryTitle}>{workflow.title}</div>
                <div className={styles.galleryAuthor}>
                  by {workflow.author} ({workflow.runCount} runs)
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
