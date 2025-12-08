import Link from 'next/link';
import styles from './page.module.css';
import { featuredItem, popularModels, recommendedWorkflows } from './models';

export default function GroundPage() {
    return (
        <div className={styles.container}>
            <div className={styles.headerControl}>
                <h1 className={styles.pageTitle}>Explore</h1>
                <div className={styles.searchBar}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search models or workflows..."
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {/* Featured Section */}
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
                    <Link href={`/ground/${featuredItem.id}`} className={styles.ctaButton}>
                        Get started <span>→</span>
                    </Link>
                </div>
            </div>

            {/* Popular Models */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                        <span>⚡</span> Popular Models
                    </div>
                    <span className={styles.viewMore}></span>
                </div>
                <div className={styles.listGrid}>
                    {popularModels.map(model => (
                        <Link href={`/ground/${model.id}`} key={model.id} className={styles.listItem}>
                            <div
                                className={styles.itemImage}
                                style={model.coverImage ? { backgroundImage: `url(${model.coverImage})` } : {}}
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
                                    {model.tags.map(tag => (
                                        <span key={tag} className={styles.metaTag}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Recommended Workflows */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                        <span>🏗️</span> Recommended Workflows
                    </div>
                    <span className={styles.viewMore}>View more →</span>
                </div>
                <div className={styles.galleryGrid}>
                    {recommendedWorkflows.map(workflow => (
                        <Link href={`/ground/${workflow.id}`} key={workflow.id} className={styles.galleryCard}>
                            <div
                                className={styles.galleryPreview}
                                style={{ backgroundImage: `url(${workflow.coverImage})` }}
                            />
                            <div className={styles.galleryContent}>
                                <div className={styles.galleryTitle}>{workflow.title}</div>
                                <div className={styles.galleryAuthor}>by {workflow.author} ({workflow.runCount} runs)</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
