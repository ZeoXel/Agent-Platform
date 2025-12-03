import styles from './page.module.css';
import { ToolIcon, WorkflowIcon, GalleryIcon } from '@/components/common/Icons';

export default function MarketplacePage() {
    return (
        <div className={styles.container}>
            <section className={styles.section}>
                <div className={styles.header}>
                    <h2>🛠️ 专业工具</h2>
                    <p>快速、精准、专业控制</p>
                </div>
                <div className={styles.grid}>
                    {/* Tool Cards */}
                    <div className={styles.card}>
                        <div className={styles.icon}>
                            <GalleryIcon />
                        </div>
                        <h3>图像生成器</h3>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.icon}>
                            <ToolIcon />
                        </div>
                        <h3>视频剪辑器</h3>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.icon}>
                            <ToolIcon />
                        </div>
                        <h3>音频合成器</h3>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.header}>
                    <h2>⚡ 智能工作流</h2>
                    <p>一键生成专业效果</p>
                </div>
                <div className={styles.grid}>
                    {/* Workflow Cards */}
                    <div className={styles.card}>
                        <div className={styles.preview}></div>
                        <h3>产品展示工作流</h3>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.preview}></div>
                        <h3>宣传视频工作流</h3>
                    </div>
                </div>
            </section>
        </div>
    );
}
