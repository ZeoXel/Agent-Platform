/**
 * 会话状态管理
 *
 * 管理用户会话状态（追踪最近生成的图片等）
 */

// 使用 global 对象存储会话状态，避免 Next.js 热重载时丢失数据
// 生产环境建议使用 Redis
const globalForSession = global;
if (!globalForSession.sessionStore) {
    globalForSession.sessionStore = new Map();
}
const sessionStore = globalForSession.sessionStore;

/**
 * 会话状态类
 */
export class SessionState {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.lastImages = []; // 最近生成的图片URL列表
        this.createdAt = Date.now();
        this.conversationHistory = []; // 可选：持久化对话历史
    }

    /**
     * 更新最近生成的图片
     */
    updateLastImages(imageUrls) {
        if (Array.isArray(imageUrls) && imageUrls.length > 0) {
            this.lastImages = imageUrls;
            console.log(`[会话 ${this.sessionId}] 更新 lastImages:`, this.lastImages);
        }
    }

    /**
     * 获取最近的图片URL
     */
    getLastImage() {
        return this.lastImages[0] || null;
    }

    /**
     * 添加对话消息（可选功能）
     */
    addMessage(message) {
        this.conversationHistory.push({
            ...message,
            timestamp: Date.now(),
        });
    }
}

/**
 * 获取或创建会话
 */
export function getOrCreateSession(sessionId) {
    console.log(`[会话管理] sessionStore 包含 ${sessionStore.size} 个会话:`, Array.from(sessionStore.keys()));

    if (!sessionStore.has(sessionId)) {
        console.log(`[会话管理] 创建新会话: ${sessionId}`);
        sessionStore.set(sessionId, new SessionState(sessionId));
    } else {
        const session = sessionStore.get(sessionId);
        console.log(`[会话管理] 找到已存在会话: ${sessionId}, lastImages:`, session.lastImages);
    }
    return sessionStore.get(sessionId);
}

/**
 * 清理过期会话（超过1小时）
 */
export function cleanupExpiredSessions() {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    let cleanedCount = 0;

    for (const [sessionId, state] of sessionStore.entries()) {
        if (now - state.createdAt > ONE_HOUR) {
            sessionStore.delete(sessionId);
            cleanedCount++;
        }
    }

    if (cleanedCount > 0) {
        console.log(`[会话管理] 清理了 ${cleanedCount} 个过期会话`);
    }
}

// 定期清理（每10分钟）
setInterval(cleanupExpiredSessions, 10 * 60 * 1000);

/**
 * 获取会话统计信息（调试用）
 */
export function getSessionStats() {
    return {
        total: sessionStore.size,
        sessions: Array.from(sessionStore.keys()),
    };
}
