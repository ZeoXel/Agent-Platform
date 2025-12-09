/**
 * 会话管理 Hook
 * 提供对话历史的增删改查功能
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSessions,
  saveSession,
  deleteSession,
  getActiveSessionId,
  setActiveSessionId,
  saveGenerationRecord
} from '@/lib/storage/localStorage';

/**
 * 生成会话标题
 * @param {Array} messages - 消息列表
 * @returns {string} 会话标题
 */
function generateSessionTitle(messages) {
  if (!messages || messages.length === 0) {
    return '新对话';
  }

  // 从第一条用户消息提取标题
  const firstUserMsg = messages.find(m => m.role === 'user');
  if (!firstUserMsg) {
    return '新对话';
  }

  // 截取前30个字符作为标题
  let title = firstUserMsg.content.trim();
  if (title.length > 30) {
    title = title.substring(0, 30) + '...';
  }

  return title;
}

/**
 * 计算会话元数据
 * @param {Array} messages - 消息列表
 * @returns {Object} 元数据
 */
function calculateMetadata(messages) {
  const imageCount = messages.reduce((count, msg) => {
    return count + (msg.images?.length || 0);
  }, 0);

  return {
    messageCount: messages.length,
    imageCount,
    tags: []
  };
}

export function useSessionManager() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionIdState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：从localStorage加载数据
  useEffect(() => {
    try {
      const loadedSessions = getSessions();
      const loadedActiveId = getActiveSessionId();

      setSessions(loadedSessions);
      setActiveSessionIdState(loadedActiveId);
    } catch (error) {
      console.error('加载会话数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 创建新会话
   * @returns {Object} 新会话对象
   */
  const createSession = useCallback(() => {
    const now = Date.now();
    const newSession = {
      id: `session_${now}`,
      title: '新对话',
      messages: [],
      createdAt: now,
      updatedAt: now,
      metadata: {
        messageCount: 0,
        imageCount: 0,
        tags: []
      }
    };

    saveSession(newSession);
    setActiveSessionId(newSession.id);

    // 更新本地状态
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionIdState(newSession.id);

    return newSession;
  }, []);

  /**
   * 更新会话（添加消息）
   * @param {string} sessionId - 会话ID
   * @param {Array} messages - 新的消息列表
   */
  const updateSessionMessages = useCallback((sessionId, messages) => {
    const now = Date.now();

    // 使用 setSessions 的函数式更新来访问最新的 sessions
    setSessions(prev => {
      // 查找会话
      const session = prev.find(s => s.id === sessionId);
      if (!session) {
        console.error('会话不存在:', sessionId);
        return prev;
      }

      // 更新会话
      const updatedSession = {
        ...session,
        title: generateSessionTitle(messages),
        messages: messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp || now
        })),
        updatedAt: now,
        metadata: calculateMetadata(messages)
      };

      saveSession(updatedSession);

      // 如果消息包含生成的图片，保存到生成记录
      messages.forEach(msg => {
        if (msg.role === 'assistant' && msg.images && msg.images.length > 0) {
          msg.images.forEach((image, index) => {
            const record = {
              id: `record_${now}_${index}`,
              sessionId,
              source: {
                type: 'agent',
                entryPoint: '/agent'
              },
              input: {
                prompt: messages[messages.length - 2]?.content || '', // 上一条用户消息
                params: {}
              },
              output: {
                mediaType: 'image',
                fileUrl: image.url,
                thumbnailUrl: image.url,
                metadata: image.metadata || {}
              },
              createdAt: now
            };
            saveGenerationRecord(record);
          });
        }
      });

      // 返回更新后的 sessions
      return prev.map(s => s.id === sessionId ? updatedSession : s);
    });
  }, []); // 移除 sessions 依赖

  /**
   * 删除会话
   * @param {string} sessionId - 会话ID
   */
  const removeSession = useCallback((sessionId) => {
    deleteSession(sessionId);

    // 更新本地状态并处理活跃会话切换
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);

      // 如果删除的是当前活跃会话，切换到第一个会话
      setActiveSessionIdState(current => {
        if (current === sessionId) {
          const newActiveId = filtered.length > 0 ? filtered[0].id : null;
          setActiveSessionId(newActiveId || '');
          return newActiveId;
        }
        return current;
      });

      return filtered;
    });
  }, []); // 移除依赖

  /**
   * 切换活跃会话
   * @param {string} sessionId - 会话ID
   */
  const switchSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId);
    setActiveSessionIdState(sessionId);
  }, []);

  /**
   * 获取当前活跃会话
   * @returns {Object|null} 活跃会话对象或null
   */
  const getActiveSession = useCallback(() => {
    // 使用最新的 sessions 状态
    let currentSession = null;
    setSessions(prev => {
      if (activeSessionId) {
        currentSession = prev.find(s => s.id === activeSessionId) || null;
      }
      return prev; // 不修改 sessions
    });
    return currentSession;
  }, [activeSessionId]); // 只依赖 activeSessionId

  /**
   * 清空所有会话
   */
  const clearAllSessions = useCallback(() => {
    if (confirm('确定要清空所有会话记录吗？此操作不可恢复。')) {
      setSessions(prev => {
        prev.forEach(s => deleteSession(s.id));
        setActiveSessionIdState(null);
        setActiveSessionId('');
        return [];
      });
    }
  }, []); // 移除依赖

  return {
    // 状态
    sessions,
    activeSessionId,
    isLoading,

    // 方法
    createSession,
    updateSessionMessages,
    removeSession,
    switchSession,
    getActiveSession,
    clearAllSessions
  };
}
