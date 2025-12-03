import styles from './page.module.css';

export default function AgentPage() {
    return (
        <div className={styles.container}>
            <div className={styles.chatArea}>
                <div className={styles.welcome}>
                    <h1>你好! 我可以帮你...</h1>
                    <ul className={styles.features}>
                        <li>✨ 快速生成图片、音频、文案</li>
                        <li>🛠️ 推荐适合的专业工具</li>
                    </ul>
                </div>
                {/* Chat interface will go here */}
            </div>
            <div className={styles.inputArea}>
                <div className={styles.inputBox}>
                    <input type="text" placeholder="试试说: 给我生成一张赛博朋克风格的猫" />
                    <button>发送</button>
                </div>
            </div>
        </div>
    );
}
