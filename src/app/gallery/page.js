import styles from './page.module.css';

export default function GalleryPage() {
    return (
        <div className={styles.container}>
            <div className={styles.filterBar}>
                <button className={`${styles.filterBtn} ${styles.active}`}>全部</button>
                <button className={styles.filterBtn}>图片</button>
                <button className={styles.filterBtn}>视频</button>
                <button className={styles.filterBtn}>音频</button>
            </div>

            <div className={styles.timeline}>
                <h3>今天</h3>
                <div className={styles.grid}>
                    <div className={styles.item}>
                        <div className={styles.thumbnail}></div>
                        <div className={styles.info}>
                            <h4>赛博朋克猫</h4>
                            <span className={styles.source}>📱 AI对话</span>
                        </div>
                    </div>
                    <div className={styles.item}>
                        <div className={styles.thumbnail}></div>
                        <div className={styles.info}>
                            <h4>产品视频</h4>
                            <span className={styles.source}>🛠️ 工具</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
